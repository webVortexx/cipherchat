import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { randomUUID } from "crypto";
import mongoose from "mongoose";
import Message from "./models/Message.js";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api", uploadRoutes);

const io = new Server(server, {
  cors: {
    origin: "*", // ⚠️ Change in production
    methods: ["GET", "POST"],
  },
});

// Track connected users
const onlineUsers = {};

// =========================
// MONGODB CONNECTION
// =========================
mongoose
  .connect(
    "mongodb+srv://cipherchatadmin:cipherchatadmin@cluster0.6tiltr1.mongodb.net/cipherchat?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("MongoDB Atlas Connected"))
  .catch((err) => console.log(err));

// =========================
// SOCKET CONNECTION
// =========================
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // =========================
  // JOIN ROOM
  // =========================
  socket.on("join_room", async ({ username, room }) => {
    if (!username || !room) return;

    socket.join(room);

    onlineUsers[socket.id] = { username, room };

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

    // Load previous messages
    const previousMessages = await Message.find({ room }).sort({
      timestamp: 1,
    });

    socket.emit("load_messages", previousMessages);
  });

  // =========================
  // SEND MESSAGE (TEXT + FILE)
  // =========================

  socket.on("send_message", async (data) => {
  const { room, author, content, messageType = "text", fileUrl = null, usercolor } = data;

  if (!room || !author) return;
  if (messageType === "text" && !content) return;
  if (messageType === "file" && !fileUrl) return;

    const message = {
      id: Date.now().toString(),
      room,
      author,
      content: content || null,
      fileUrl,
      usercolor,
      type: messageType,
      timestamp: Date.now(),
    };

    try {
      const savedMessage = await Message.create(message);

      io.to(room).emit("receive_message", savedMessage);
    } catch (err) {
      console.error("DB Save Error:", err);
    }
  });

  // =========================
  // DISCONNECT
  // =========================
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

    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
