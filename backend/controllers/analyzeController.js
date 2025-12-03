import { GoogleGenerativeAI } from "@google/generative-ai";

export const analyzeResume = async (req, res) => {
  const { resumeText, company } = req.body;

  // Only resume + company required
  if (!resumeText || !company) {
    return res.status(400).json({
      error: "Missing inputs: resume or company",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
Analyze the following resume ONLY for the company "${company}".
Consider ${company}'s culture, hiring standards, and preferred tech stack.

Provide:
- Strengths relevant to ${company}
- Missing or weak skills based on ${company}'s expectations
- One improvement tip
- A match score (0–10)

Resume:
${resumeText}

Return STRICT JSON ONLY:
{
  "matchScore": number,
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["point1", "point2"],
  "tip": "one improvement tip"
}
`;

    const response = await model.generateContent(prompt);
    let raw = response.response.text();

    // Clean output
    raw = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/[\u201C\u201D]/g, '"')
      .trim();

    const parsed = JSON.parse(raw);

    return res.json(parsed);
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "AI analysis failed" });
  }
};
