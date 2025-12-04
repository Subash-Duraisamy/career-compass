import express from "express";
import { jobMatchAI } from "../controllers/jobMatchController.js";

const router = express.Router();
router.post("/", jobMatchAI);

export default router;
