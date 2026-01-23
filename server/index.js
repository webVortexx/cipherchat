import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("join_room", ({ username, room }) => {
    console.log("➡️ join_room:", username, room);

    socket.join(room);

    io.in(room).emit("receive_message", {
      author: "SYSTEM",
      message: `${username} joined the room`,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("send_message", (data) => {
    console.log("➡️ send_message:", data);

    io.in(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
