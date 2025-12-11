import axios from "axios";
import { storeResumeChunks, searchResume } from "../rag.js";

/* ============================================================
   AI ROADMAP + MULTI-LEVEL PROJECT SUGGESTION ENGINE (RAG)
============================================================ */
export const getRoadmapAndProjects = async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: "Resume text missing" });
  }

  try {
    // ----------------------------------
    // 1. Store resume text in memory vector DB (RAG)
    // ----------------------------------
    await storeResumeChunks(resumeText);

    // ----------------------------------
    // 2. Extract skill-based context
    // ----------------------------------
    const queries = [
      "python", "machine learning", "javascript", "react",
      "java", "cloud", "data science", "backend", "frontend"
    ];

    let collected = [];

    for (let q of queries) {
      const results = await searchResume(q, 3);
      collected.push(...results);
    }

    collected = [...new Set(collected)];
    const context = collected.length
      ? collected.map(c => `• ${c}`).join("\n")
      : "No resume context found from RAG.";


    // ----------------------------------
    // 3. AI Prompt for Roadmap + Project Engine
    // ----------------------------------
    const prompt = `
You are an expert AI Career Mentor. Analyze ONLY the following resume context:

${context}

Now generate STRICT JSON in this EXACT FORMAT:

{
  "roadmap": [
    {
      "title": "Phase 1: Fundamentals",
      "steps": ["step1", "step2", "step3"]
    },
    {
      "title": "Phase 2: Core Development",
      "steps": ["step1", "step2", "step3"]
    },
    {
      "title": "Phase 3: Projects & Practice",
      "steps": ["step1", "step2", "step3"]
    },
    {
      "title": "Phase 4: Advanced Systems",
      "steps": ["step1", "step2", "step3"]
    },
    {
      "title": "Phase 5: Job Preparation",
      "steps": ["step1", "step2", "step3"]
    }
  ],

  "projects": {
    "easy": [
      {
        "name": "",
        "problem": "",
        "techStack": ["React", "Node.js"],
        "difficulty": "Easy",
        "time": "1–2 weeks",
        "whatYouLearn": ["point1", "point2"]
      }
    ],

    "medium": [
      {
        "name": "",
        "problem": "",
        "techStack": ["Python", "Machine Learning"],
        "difficulty": "Medium",
        "time": "3–4 weeks",
        "whatYouLearn": ["point1", "point2"]
      }
    ],

    "advanced": [
      {
        "name": "",
        "problem": "",
        "techStack": ["Deep Learning", "Cloud Deployment"],
        "difficulty": "Advanced",
        "time": "1–2 months",
        "whatYouLearn": ["point1", "point2"]
      }
    ]
  }
}

STRICT RULES:
- Respond ONLY with JSON.
- NO explanation.
- NO additional text.
- No Markdown formatting.
`;

    // ----------------------------------
    // 4. Send request to OpenRouter
    // ----------------------------------
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.25,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ----------------------------------
    // 5. Clean response
    // ----------------------------------
    let raw = response.data.choices[0].message.content.trim();
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(raw);

    return res.json(parsed);

  } catch (err) {
    console.error("Roadmap Generator Error:", err.message);
    return res.status(500).json({ error: "Failed to generate roadmap." });
  }
};
