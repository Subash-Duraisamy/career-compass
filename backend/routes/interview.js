import express from "express";
import { startInterview, evaluateAnswer } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/start", startInterview);
router.post("/answer", evaluateAnswer);

export default router;
