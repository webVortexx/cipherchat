import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: String,
  room: String,
  author: String,
  content: String,
  fileUrl: String,
  usercolor: String,
  type: {
    type: String,
    enum: ["text", "file", "system"],
    default: "text",
  },
  timestamp: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Message", messageSchema);