import express from "express";
import mongoose from "mongoose";
import { generateEmbedding } from "../services/embeddings.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing ?q= parameter" });

    const embedding = await generateEmbedding(query);

    const results = await mongoose.connection.db
      .collection("chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "embedding_index",
            path: "embedding",
            queryVector: embedding,
            numCandidates: 100,
            limit: 3,
          },
        },
      ])
      .toArray();

    res.json({
      query,
      results: results.map(r => ({
        text: r.text,
        score: r.score,
        source: r.source,
      })),
    });
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
