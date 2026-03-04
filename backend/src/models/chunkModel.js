import mongoose from "mongoose";

const chunkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  source: { type: String },
  page: { type: Number },
  chunkIndex: { type: Number },
  lineStart: { type: Number },
  lineEnd: { type: Number },
  // page-local line numbers (computed during parsing)
  lineStartPage: { type: Number },
  lineEndPage: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const Chunk = mongoose.model("Chunk", chunkSchema);
