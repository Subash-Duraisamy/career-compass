import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import uploadRouter from "./routes/upload.js";
import analyzeRouter from "./routes/analyze.js";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/upload", uploadRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/chat", chatRouter);  // <-- MUST BE HERE

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🔥 Backend running on port ${PORT}`);
});
