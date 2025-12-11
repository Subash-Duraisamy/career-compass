import axios from "axios";

export const jobMatchAI = async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ error: "Resume text missing" });
  }

  try {
    const prompt = `
Analyze the following resume and generate EXACTLY 5 JOB OPTIONS in India.

Return ONLY a RAW JSON ARRAY.  
NO explanation.  
NO intro text.  
NO sentences before or after the JSON.  
Example format ONLY:

[
  {
    "title": "",
    "matchScore": number,
    "reason": "",
    "missingSkills": [],
    "recommendedCertifications": [],
    "salaryPrediction": ""
  }
]

RULES:
- "matchScore" must be a number between 1 and 10 ONLY.
- Salary must be in INR (LPA format).
- ABSOLUTELY NO TEXT OUTSIDE THE JSON ARRAY.

Resume:
${resumeText}
`;

    // -----------------------------
    // OpenRouter Request
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

    let raw = response.data.choices[0].message.content.trim();

    // Remove Markdown wrappers
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    // -----------------------------
    // SAFELY Extract JSON Array
    // -----------------------------
    const match = raw.match(/\[[\s\S]*\]/); // Extract content inside [...]
    if (!match) {
      console.error("AI Output (invalid):", raw);
      return res.status(500).json({
        error: "AI returned invalid JSON, no array found.",
      });
    }

    const cleanJSON = match[0];

    const jobs = JSON.parse(cleanJSON);

    return res.json({ jobs });

  } catch (err) {
    console.error("AI Job Match Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "AI Job Matching Failed" });
  }
};
