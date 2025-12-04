import { GoogleGenerativeAI } from "@google/generative-ai";

export const jobMatchAI = async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: "Resume text missing" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const prompt = `
Analyze this resume and generate the top 5 most suitable jobs.

For EACH job, return JSON STRICTLY in this format:

{
  "title": "",
  "matchScore": number,  // MUST be a number from 1 to 10 ONLY (no % or text)
  "reason": "",
  "missingSkills": [],
  "recommendedCertifications": [],
  "salaryPrediction": ""
}

RULES:
- "matchScore" must be ONLY a number between 1 and 10.
- DO NOT return percentages.
- DO NOT add "/10".
- DO NOT add "%" symbols.
- If unsure, choose a number between 1–10.

Salary must be in INR (LPA format) only.

Resume:
${resumeText}

Return ONLY pure JSON array with 5 jobs.
`;



    const result = await model.generateContent(prompt);
    let aiText = result.response.text();

    aiText = aiText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jobs = JSON.parse(aiText);

    res.json({ jobs });
  } catch (err) {
    console.error("AI Job Match Error:", err);
    res.status(500).json({ error: "AI Job Matching Failed" });
  }
};
