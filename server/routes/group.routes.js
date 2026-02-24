import express from "express";
import Group from "../models/Group.js";

const router = express.Router();

// Get all groups
router.get("/groups", async (req, res) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new group
router.post("/groups", async (req, res) => {
  try {
    const { name, description, createdBy } = req.body;

    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ error: "Group already exists" });
    }

    const newGroup = new Group({
      name,
      description,
      createdBy,
      members: [createdBy],
    });

    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to group
router.post("/groups/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { username } = req.body;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: username } },
      { new: true }
    );

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;