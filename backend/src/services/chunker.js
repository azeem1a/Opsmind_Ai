/**
 * Splits text into overlapping chunks
 * @param {string} text - The input text
 * @param {number} size - Chunk size (default 1000 chars)
 * @param {number} overlap - Overlap between chunks (default 200 chars)
 * @returns {Array} - Array of text chunks
 */
export function chunkText(text, size = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;
  let index = 0;

  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    const chunk = text.slice(start, end);
    chunks.push({ text: chunk, start, end, index });
    start += size - overlap;
    index += 1;
  }

  return chunks;
}
