import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  citations: { type: Array, default: [] },
});

const ChatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", ChatSchema);
