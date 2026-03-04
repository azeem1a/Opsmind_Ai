import express from "express";
import Chat from "../models/chat.js";

const router = express.Router();

// 🟢 Save a chat message
router.post("/", async (req, res) => {
  try {
    const { sessionId, role, content, citations } = req.body;
    if (!sessionId || !role || !content)
      return res.status(400).json({ error: "Missing fields" });

    let chat = await Chat.findOne({ sessionId });
    if (!chat) chat = new Chat({ sessionId, messages: [] });

    // Save citations if provided (assistant messages)
    const message = { role, content };
    if (citations) message.citations = citations;

    chat.messages.push(message);
    await chat.save();

    res.status(201).json({ message: "Message saved", chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟡 Get chat history
router.get("/:sessionId", async (req, res) => {
  try {
    const chat = await Chat.findOne({ sessionId: req.params.sessionId });
    if (!chat) return res.json({ messages: [] });
    res.json(chat.messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔴 Clear chat session
router.delete("/:sessionId", async (req, res) => {
  try {
    await Chat.deleteOne({ sessionId: req.params.sessionId });
    res.json({ message: "Chat session cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
