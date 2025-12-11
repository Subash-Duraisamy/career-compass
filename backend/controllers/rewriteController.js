import axios from "axios";
import { storeResumeChunks, searchResume } from "../rag.js";

export const rewriteResume = async (req, res) => {
  const { resumeText, company } = req.body;

  if (!resumeText || !company) {
    return res.status(400).json({
      error: "Resume text & company required",
    });
  }

  try {
    // Step 1: Store resume chunks inside RAG memory
    await storeResumeChunks(resumeText);

    // Step 2: Retrieve company-specific relevant context
    const relevant = await searchResume(company, 5);
    const context = relevant.length
      ? relevant.map(c => "• " + c).join("\n")
      : "No specific resume context found.";

    // Step 3: Prompt for rewriting the resume
    const prompt = `
Rewrite the following resume SPECIFICALLY for the company: ${company}.
Make it ATS-friendly, impactful, and tailored for their hiring style.

Use these extracted resume sections for accuracy:
${context}

Rewrite the FULL resume with:
- Improved bullets
- Better action verbs
- ATS-friendly formatting
- Quantified achievements
- Company-tailored keywords

Return ONLY the rewritten resume. No explanations.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Career Compass Resume Rewriter"
        }
      }
    );

    const rewritten = response.data.choices[0].message.content.trim();

    return res.json({ rewritten });

  } catch (err) {
    console.error("❌ Rewrite Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to rewrite resume" });
  }
};
