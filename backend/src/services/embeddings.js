import { pipeline } from "@xenova/transformers";

// Load the model once (it will cache locally)
let embedder = null;

async function loadModel() {
  if (!embedder) {
    console.log("🧠 Loading local embedding model...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Model loaded successfully!");
  }
  return embedder;
}

/**
  Generate numeric embeddings for input text
 */
export async function generateEmbedding(text) {
  try {
    const model = await loadModel();
    const output = await model(text, { pooling: "mean", normalize: true });
    return Array.from(output.data); 
  } catch (err) {
    console.error("❌ Embedding error:", err);
    throw err;
  }
}
