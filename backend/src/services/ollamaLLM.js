import Ollama from "ollama";

/**
 * Generate text using local Ollama model
 * @param {string} prompt - The input prompt text
 * @param {string} model - The Ollama model name (default: llama3)
 */
export async function generateOllamaResponse(prompt, model = "llama3") {
  try {
    const response = await Ollama.chat({
      model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    return response.message.content.trim();
  } catch (err) {
    console.error("❌ Ollama generation error:", err);
    throw err;
  }
}
