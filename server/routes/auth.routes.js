import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticateRequest } from "../middleware/auth.js";

const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

router.post("/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: username.trim() }],
    });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/auth/me", authenticateRequest, (req, res) => {
  return res.json({
    user: {
      id: req.user.userId,
      username: req.user.username,
      email: req.user.email,
    },
  });
});

export default router;
