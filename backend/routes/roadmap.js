import express from "express";
import { getRoadmapAndProjects } from "../controllers/roadmapController.js";

const router = express.Router();

router.post("/", getRoadmapAndProjects);

export default router;
