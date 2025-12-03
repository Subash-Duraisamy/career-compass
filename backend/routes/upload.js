import express from "express";
import multer from "multer";
import { extractText } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("resume"), extractText);

export default router;
