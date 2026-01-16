import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ---------- MIDDLEWARES ---------- */
app.use(cors());
app.use(express.json());

/* ---------- ROUTES ---------- */
app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.use("/upload", uploadRoutes);

/* ---------- SOCKET.IO ---------- */
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (message) => {
    io.emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ---------- SERVER LISTEN ---------- */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
