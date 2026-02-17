import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: String,
  room: String,
  author: String,
  content: String,
  type: {
    type: String,
    enum: ["text", "system"],
    default: "text",
  },
  timestamp: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Message", messageSchema);
