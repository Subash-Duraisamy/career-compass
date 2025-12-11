import axios from "axios";
import { storeResumeChunks, searchResume } from "../rag.js";

/* ============================================================
   SAFE JSON CLEANER
============================================================ */
function extractCleanJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    let json = match[0]
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ============================================================
   START INTERVIEW (Difficulty + Timer + RAG)
============================================================ */
export const startInterview = async (req, res) => {
  const { role, resumeText, difficulty } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role required" });
  }

  const level = difficulty || "easy";

  try {
    let context = "No resume context available.";

    // RAG enhance questions if resume is available
    if (resumeText) {
      await storeResumeChunks(resumeText);
      const relevant = await searchResume(role, 5);
      if (Array.isArray(relevant) && relevant.length > 0) {
        context = relevant.map((c) => "• " + c).join("\n");
      }
    }

    const prompt = `
You are an expert interviewer for the job role: "${role}".
Ask ONLY ONE interview question based on the difficulty level.

Difficulty Rules:
- EASY → basic conceptual questions
- MEDIUM → scenario-based questions
- HARD → deep technical / system design / real SDE questions

Candidate Context:
${context}

Return ONLY the question text.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const question = response.data.choices[0].message.content.trim();

    // Question timer by difficulty
    const timer =
      level === "easy" ? 45 :
      level === "medium" ? 90 :
      150; // hard

    return res.json({
      question,
      index: 1,
      score: 0,
      difficulty: level,
      timer,
    });

  } catch (err) {
    console.error("Interview Start Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to start interview" });
  }
};

/* ============================================================
   EVALUATE ANSWER (Difficulty Preserved + RAG Context)
============================================================ */
export const evaluateAnswer = async (req, res) => {
  const { question, userAnswer, role, index, score, difficulty } = req.body;

  if (!question || !userAnswer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  try {
    const r1 = await searchResume(role, 3) || [];
    const r2 = await searchResume(question, 3) || [];
    const r3 = await searchResume(userAnswer, 3) || [];

    const combined = [...r1, ...r2, ...r3];
    const unique = [...new Set(combined)];

    const context =
      unique.length > 0
        ? unique.map((c) => "• " + c).join("\n")
        : "No resume context available.";

    const prompt = `
Evaluate this candidate answer for the role "${role}".

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
${userAnswer}

Return STRICT JSON ONLY:
{
  "feedback": {
    "strengths": "text",
    "weaknesses": "text"
  },
  "score": number,
  "nextQuestion": "next interview question"
}
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const clean = extractCleanJSON(response.data.choices[0].message.content);
    if (!clean) {
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    const updatedScore = score + (clean.score || 0);

    // If interview completed
    if (index >= 5) {
      return res.json({
        finished: true,
        finalScore: Math.round(updatedScore / 5),
        summary: clean.feedback,
        recommendation: clean.nextQuestion,
      });
    }

    const timer =
      difficulty === "easy" ? 45 :
      difficulty === "medium" ? 90 :
      150;

    return res.json({
      finished: false,
      nextQuestion: clean.nextQuestion,
      feedback: clean.feedback,
      index: index + 1,
      score: updatedScore,
      difficulty,
      timer,
    });

  } catch (err) {
    console.error("Eval Error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Evaluation failed",
      details: err.message,
    });
  }
};
