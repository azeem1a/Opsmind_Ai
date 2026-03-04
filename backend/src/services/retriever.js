import mongoose from "mongoose";
import { generateEmbedding } from "./embeddings.js";

/**
 * Retrieve the most relevant text chunks from MongoDB Vector Search
 * @param {string} query - The user query or question
 * @param {number} topK - Number of chunks to return (default: 3)
 * @returns {Array<{ text: string, score: number, source: string }>}
 */
export async function retrieveRelevantChunks(query, topK = 3) {
  try {
    
    const embedding = await generateEmbedding(query);

    const results = await mongoose.connection.db
      .collection("chunks")
      .aggregate([
        {
          $vectorSearch: {
            index: "embedding_index", // 👈 your Atlas vector index name
            path: "embedding",        // 👈 field in your chunk documents
            queryVector: embedding,   // 👈 generated vector
            numCandidates: 100,       // 👈 number of candidates to scan
            limit: topK               // 👈 top results to return
          },
        },
      ])
      .toArray();

    const formatted = results.map(r => {
      // $vectorSearch in Atlas may return the matched document fields either at top-level
      // or under `document` depending on options. Handle both shapes.
      const doc = r.document || r;

      return {
        text: doc.text || r.text || '',
        score: r.score ?? doc.score ?? 0,
        source: doc.source || r.source || 'unknown',
        page: doc.page ?? r.page,
        chunkIndex: doc.chunkIndex ?? r.chunkIndex,
        // prefer page-local line numbers if available
        lineStartPage: doc.lineStartPage ?? doc.lineStart ?? r.lineStart,
        lineEndPage: doc.lineEndPage ?? doc.lineEnd ?? r.lineEnd,
      };
    });

    console.log(`🔎 Retrieved ${formatted.length} relevant chunks`);
    return formatted;
  } catch (err) {
    console.error("❌ Retrieval error:", err);
    return [];
  }
}
