import express from "express";
import { rewriteResume } from "../controllers/rewriteController.js";

const router = express.Router();

router.post("/", rewriteResume);

export default router;
