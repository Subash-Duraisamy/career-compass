import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import uploadRouter from "./routes/upload.js";
import analyzeRouter from "./routes/analyze.js";
import chatRouter from "./routes/chat.js";
import jobMatchRouter from "./routes/jobMatch.js";
import interviewRouter from "./routes/interview.js";
import rewriteRouter from "./routes/rewrite.js";
import roadmapRouter from "./routes/roadmap.js";


// IMPORTANT: Load RAG system
import "./rag.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/upload", uploadRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/chat", chatRouter);
app.use("/api/job-match", jobMatchRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/rewrite", rewriteRouter);
app.use("/api/roadmap", roadmapRouter);



const PORT = 5000;
app.listen(PORT, () => console.log(`🔥 Backend running on port ${PORT}`));
