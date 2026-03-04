import express from "express";
import multer from "multer";
import { parseAndChunkPDF } from "../services/pdfParser.js";
import { generateEmbedding } from "../services/embeddings.js";
import { Chunk } from "../models/chunkModel.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload endpoint
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    console.log("📄 Received file:", filePath);

    const chunks = await parseAndChunkPDF(filePath);
    console.log(`📑 Parsed ${chunks.length} chunks`);

    const savedDocs = [];

    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      const text = c.text;
      const embedding = await generateEmbedding(text);

      const doc = new Chunk({
        text,
        embedding,
        source: req.file.originalname,
        page: c.page,
        chunkIndex: c.chunkIndex,
        lineStartPage: c.lineStartPage,
        lineEndPage: c.lineEndPage,
      });

      await doc.save();
      savedDocs.push(doc);

      console.log(`✅ Stored chunk ${i + 1}/${chunks.length} (page ${c.page}, chunk ${c.chunkIndex})`);
    }

    const pagesIndexed = new Set(savedDocs.map(d => d.page)).size;
    res.json({
      message: "✅ PDF processed & embeddings stored (local model)",
      totalChunks: savedDocs.length,
      totalPages: pagesIndexed,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Failed to process file" });
  }
});

export default router;
