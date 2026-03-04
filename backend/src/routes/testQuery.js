import express from "express";
import mongoose from "mongoose";
import { generateEmbedding } from "../services/embeddings.js";

const router = express.Router();

/**
 * Semantic search test route
 * Example: GET /api/test/refund%20policy?topK=5
 */
router.get("/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const topK = Number(req.query.topK) || 3;

    console.log(`🔍 Searching for "${query}" | TopK: ${topK}`);

    // Step 1: Generate embedding for the query text
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Run MongoDB vector search
    const results = await mongoose.connection.db
      .collection("chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "embedding_index",
            path: "embedding",
            queryVector: queryEmbedding,
            numCandidates: 100,
            limit: topK,
          },
        },
      ])
      .toArray();

    // Step 3: Send formatted response
    res.json({
      query,
      topK,
      count: results.length,
      results: results.map((r) => ({
        text: r.text,
        score: r.score?.toFixed(3), // similarity confidence
        source: r.source,
      })),
    });
  } catch (error) {
    console.error("❌ Test query error:", error);
    res.status(500).json({ error: "Semantic search failed" });
  }
});

export default router;
