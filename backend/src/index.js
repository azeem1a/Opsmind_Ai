import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import uploadRoutes from "./routes/upload.js";
import searchRoutes from "./routes/search.js";
import testQueryRoutes from "./routes/testQuery.js";
import askRoutes from "./routes/ask.js";
import chatRoutes from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

app.use("/api/upload", uploadRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/test", testQueryRoutes);
app.use("/api/ask", askRoutes);
app.use("/api/chat", chatRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("OpsMind AI backend running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
