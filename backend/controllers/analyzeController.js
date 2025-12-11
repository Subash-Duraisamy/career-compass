import axios from "axios";
import { storeResumeChunks, searchResume } from "../rag.js";

/**
 * Analyze Resume with RAG (Local Embeddings + OpenRouter LLM)
 */
export const analyzeResume = async (req, res) => {
  const { resumeText, company } = req.body;

  if (!resumeText || !company) {
    return res.status(400).json({
      error: "Missing resume or company",
    });
  }

  try {
    console.log("📌 Storing resume chunks in vector DB...");
    await storeResumeChunks(resumeText);

    console.log("📌 Retrieving relevant chunks for:", company);
    const relevantChunks = await searchResume(company, 5);

    // SAFETY FIX ⭐ prevents undefined.map error
    if (!Array.isArray(relevantChunks) || relevantChunks.length === 0) {
      console.log("⚠️ No relevant resume chunks found!");

      return res.json({
        matchScore: 2,
        missingSkills: ["Not enough resume information"],
        strengths: [],
        tip: "Add more detailed work experience and achievements.",
      });
    }

    console.log("📌 Retrieved Chunks:", relevantChunks.length);

    // ----------- RAG Prompt -----------
    const prompt = `
You are an expert ATS + HR evaluator.

Company: ${company}

Relevant extracted resume sections:
${relevantChunks.map(c => "• " + c).join("\n")}

Return STRICT JSON ONLY:
{
  "matchScore": number,
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["point1", "point2"],
  "tip": "one improvement tip"
}
`;

    // ----------- OpenRouter API Call -----------
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
          "X-Title": "Career Compass RAG Analyzer",
        },
      }
    );

    // ----------- Cleanup Output -----------
    let raw = response.data.choices[0].message.content;
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON Parse Failed — Raw Output:", raw);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    return res.json(parsed);

  } catch (error) {
    console.error("❌ AI Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "AI analysis failed",
    });
  }
};
