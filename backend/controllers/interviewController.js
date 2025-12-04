import { GoogleGenerativeAI } from "@google/generative-ai";

/* ============================================================
   START INTERVIEW  →  Returns FIRST question
   ============================================================ */
export const startInterview = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role required" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert interviewer for the role: "${role}".
Give ONLY the FIRST interview question.
Do NOT include explanation. Only return the question text.
    `;

    const response = await model.generateContent(prompt);
    const question = response.response.text().trim();

    return res.json({ question, index: 1, score: 0 });

  } catch (err) {
    console.error("Interview Start Error:", err);
    res.status(500).json({ error: "Failed to start interview" });
  }
};


/* ============================================================
   CLEAN JSON FUNCTION
   Extracts & fixes JSON from messy AI output
   ============================================================ */
function extractCleanJSON(text) {
  // Find JSON object in text
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");

  let json = match[0];

  // Remove trailing commas
  json = json.replace(/,\s*}/g, "}")
             .replace(/,\s*]/g, "]");

  return JSON.parse(json);
}



/* ============================================================
   EVALUATE ANSWER  →  Returns feedback + next question + grading
   ============================================================ */
export const evaluateAnswer = async (req, res) => {
  const { question, userAnswer, role, index, score } = req.body;

  if (!question || !userAnswer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
Evaluate the candidate's answer for the role: "${role}"

QUESTION:
${question}

ANSWER:
${userAnswer}

Now return STRICT JSON only:

{
  "feedback": {
      "strengths": "text",
      "weaknesses": "text"
  },
  "score": number,
  "nextQuestion": "another interview question for ${role}"
}

NO extra text. ONLY clean JSON.
`;

    const response = await model.generateContent(prompt);
    let raw = response.response.text();

    // Clean JSON
    const data = extractCleanJSON(raw);

    // Update score
    let updatedScore = score + (data.score || 0);

    /* FINAL ROUND COMPLETED → RETURN FINAL REPORT */
    if (index >= 5) {
      return res.json({
        finished: true,
        finalScore: Math.round(updatedScore / 5),
        summary: data.feedback,
        recommendation: data.nextQuestion
      });
    }

    /* CONTINUE TO NEXT QUESTION */
    return res.json({
      finished: false,
      nextQuestion: data.nextQuestion,
      feedback: data.feedback,
      index: index + 1,
      score: updatedScore
    });

  } catch (err) {
    console.error("Interview Eval Error:", err);

    return res.status(500).json({
      error: "AI returned invalid JSON",
      details: err.message
    });
  }
};
