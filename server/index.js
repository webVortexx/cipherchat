import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import Message from "./models/Message.js";
import Group from "./models/Group.js";
import uploadRoutes from "./routes/upload.routes.js";
import groupRoutes from "./routes/group.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticateRequest, authenticateSocket } from "./middleware/auth.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();
const server = http.createServer(app);
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin,
  })
);
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", authenticateRequest, uploadRoutes);
app.use("/api", authenticateRequest, groupRoutes);

const io = new Server(server, {
  cors: {
    origin: frontendOrigin,
    methods: ["GET", "POST"],
  },
});
io.use(authenticateSocket);

const onlineUsers = {};

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Error:", err.message);
    process.exit(1);
  });

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_room", async ({ room }) => {
    const username = socket.user?.username;
    if (!username || !room) return;

    socket.join(room);
    onlineUsers[socket.id] = { username, room };

    let group = await Group.findOne({ name: room });
    if (!group) {
      group = new Group({
        name: room,
        createdBy: username,
        members: [username],
      });
      await group.save();
    } else if (!group.members.includes(username)) {
      group.members.push(username);
      await group.save();
    }

    const systemMessage = {
      id: Date.now().toString(),
      room,
      author: "SYSTEM",
      content: `${username} joined the room`,
      type: "system",
      timestamp: Date.now(),
    };

    await Message.create(systemMessage);
    socket.to(room).emit("receive_message", systemMessage);

    const previousMessages = await Message.find({ room }).sort({
      timestamp: 1,
    });
    socket.emit("load_messages", previousMessages);
  });

  socket.on("send_message", async (data) => {
    const username = socket.user?.username;
    const {
      room,
      content,
      messageType = "text",
      fileUrl = null,
      usercolor,
      fileName = null,
      fileSize = null,
    } = data;

    if (!room || !username) return;
    if (messageType === "text" && !content) return;
    if (messageType === "file" && !fileUrl) return;

    const message = {
      id: Date.now().toString(),
      room,
      author: username,
      content: content || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      fileUrl,
      usercolor,
      type: messageType,
      timestamp: Date.now(),
    };

    try {
      const savedMessage = await Message.create(message);
      io.to(room).emit("receive_message", savedMessage);
    } catch (err) {
      console.error("DB Error:", err);
    }
  });

  socket.on("disconnect", async () => {
    const user = onlineUsers[socket.id];
    if (user) {
      const leaveMessage = {
        id: randomUUID(),
        room: user.room,
        author: "SYSTEM",
        content: `${user.username} left the room`,
        type: "system",
        timestamp: Date.now(),
      };

      await Message.create(leaveMessage);
      socket.to(user.room).emit("receive_message", leaveMessage);
      delete onlineUsers[socket.id];
    }

    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});
