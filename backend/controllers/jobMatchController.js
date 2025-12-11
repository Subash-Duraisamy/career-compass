import axios from "axios";
import { storeResumeChunks, searchResume } from "../rag.js";

/**
 * Job Match AI with RAG
 * Generates 5 job recommendations using retrieved resume chunks
 */
export const jobMatchAI = async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: "Resume text missing" });
  }

  try {
    // -----------------------------
    // RAG STEP 1: Store resume into vector database
    // -----------------------------
    await storeResumeChunks(resumeText);

    // -----------------------------
    // RAG STEP 2: Retrieve most important topics
    // We will search using different job-related queries to get diverse context
    // -----------------------------
    const queries = [
      "software engineering",
      "data science",
      "web development",
      "AI and machine learning",
      "business analyst",
      "cloud computing",
      "cyber security"
    ];

    let retrieved = [];

    for (let q of queries) {
      const chunks = await searchResume(q, 3);
      retrieved.push(...chunks);
    }

    // Remove duplicates
    retrieved = [...new Set(retrieved)];

    console.log("📌 Retrieved Resume Chunks for Job Match:", retrieved.length);

    if (retrieved.length === 0) {
      retrieved = ["No strong resume signals found. Candidate may need more detail."];
    }

    // -----------------------------
    // Prepare Final RAG Context
    // -----------------------------
    const context = retrieved.map(c => "• " + c).join("\n");

    // -----------------------------
    // LLM Prompt
    // -----------------------------
    const prompt = `
You are an expert career advisor & job recommender.

Using ONLY this extracted resume information:

${context}

Generate EXACTLY 5 JOB MATCH OPTIONS (India region).

STRICT RULES:
- Return ONLY a RAW JSON ARRAY, nothing else.
- Each job must follow this structure:

{
  "title": "",
  "matchScore": number,          // 1 to 10 only
  "reason": "",
  "missingSkills": [],
  "recommendedCertifications": [],
  "salaryPrediction": "X - Y LPA"
}

NO sentences before or after the JSON.
NO explanations.
NO markdown.

Start output with [
End with ]
`;

    // -----------------------------
    // OpenRouter API Request
    // -----------------------------
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Career Compass AI",
        },
      }
    );

    // -----------------------------
    // Clean Output
    // -----------------------------
    let raw = response.data.choices[0].message.content.trim();
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("❌ Invalid AI Output:", raw);
      return res.status(500).json({
        error: "AI returned invalid JSON structure.",
      });
    }

    const jobs = JSON.parse(match[0]);

    return res.json({ jobs });

  } catch (err) {
    console.error("AI Job Match Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "AI Job Matching Failed" });
  }
};
