import express from "express";
import { retrieveRelevantChunks } from "../services/retriever.js";
import { generateOllamaResponse } from "../services/ollamaLLM.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query field" });

    console.log("🔍 Query:", query);

    // Retrieve top chunks
    const topChunks = await retrieveRelevantChunks(query, 3);
    if (!topChunks.length)
      return res.json({
        answer: "I don’t know. No relevant information found.",
      });

    const context = topChunks.map(c => c.text).join("\n---\n");

    // Build prompt
    const prompt = `
You are OpsMind AI, a corporate knowledge assistant.
Answer the user's question using only the context below.
If the answer is not in context, say "I don’t know."

Context:
${context}

Question:
${query}

Answer:
`;

    // Generate answer via Ollama
    const answer = await generateOllamaResponse(prompt);

    res.json({
      query,
      answer,
      sources: topChunks.map(c => ({
        source: c.source,
        page: c.page,
        lineStartPage: c.lineStartPage,
        lineEndPage: c.lineEndPage,
        chunk: c.chunkIndex,
        text: c.text,
      })),
    });
  } catch (err) {
    console.error("❌ /ask error:", err);
    res.status(500).json({ error: "Failed to generate answer" });
  }
});

export default router;
