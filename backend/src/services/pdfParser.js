import fs from "fs";
import { PDFParse } from "pdf-parse";
import { chunkText } from "./chunker.js";

/**
 * Parse PDF and chunk it into pieces of ~1000 characters
 */
export async function parseAndChunkPDF(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: fileBuffer });
  const data = await parser.getText();

  const totalPages = data.total || data.numpages || 1;
  console.log("📑 Total Pages:", totalPages);

  const fullText = data.text.replace(/\n\s*\n/g, "\n");
  const rawChunks = chunkText(fullText, 1000, 200);

  // Compute line numbers and page estimate for each chunk
  const chunks = rawChunks.map((c) => {
    const { text, start, end, index } = c;

    // approximate page by proportional position in document
    const page = Math.max(1, Math.ceil((start / Math.max(1, fullText.length)) * totalPages));

    // estimate character bounds for this page (proportional split)
    const pageCharStart = Math.floor(((page - 1) / totalPages) * fullText.length);
    const pageCharEnd = Math.floor((page / totalPages) * fullText.length);

    // compute line numbers within the page by counting newlines from page start
    const pageSliceUpToStart = fullText.slice(pageCharStart, start);
    const pageSliceUpToEnd = fullText.slice(pageCharStart, end);

    const lineStartPage = pageSliceUpToStart.length ? pageSliceUpToStart.split('\n').length : 1;
    const lineEndPage = pageSliceUpToEnd.length ? pageSliceUpToEnd.split('\n').length : lineStartPage;

    return {
      text,
      chunkIndex: index,
      page,
      lineStartPage,
      lineEndPage,
    };
  });

  console.log(`✅ Created ${chunks.length} chunks`);
  return chunks;
}
