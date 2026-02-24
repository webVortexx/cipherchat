import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    id: String,
    room: String,
    author: String,
    content: String,
    fileName: String,
    fileSize: String,
    fileUrl: String,
    usercolor: String,
    type: {
      type: String,
      enum: ["text", "file", "system"],
      default: "text",
    },
    timestamp: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);