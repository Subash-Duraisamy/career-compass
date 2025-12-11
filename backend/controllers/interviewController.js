import axios from "axios";

/* ============================================================
   START INTERVIEW  →  Returns FIRST question
   ============================================================ */
export const startInterview = async (req, res) => {
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: "Role required" });
  }

  try {
    const prompt = `
You are an expert interviewer for the role: "${role}".
Ask ONLY the FIRST interview question.
Do NOT add explanations.
Return just the question.
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Career Compass AI"
        },
      }
    );

    const question = response.data.choices[0].message.content.trim();

    return res.json({ question, index: 1, score: 0 });

  } catch (err) {
    console.error("Interview Start Error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to start interview" });
  }
};



/* ============================================================
   CLEAN JSON FUNCTION
   Extracts & fixes JSON from messy AI output
   ============================================================ */
function extractCleanJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");

  let json = match[0];

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

NO extra words. ONLY clean JSON.
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
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Career Compass AI"
        },
      }
    );

    let raw = response.data.choices[0].message.content.trim();

    const data = extractCleanJSON(raw);

    // Update score
    const updatedScore = score + (data.score || 0);

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
    console.error("Interview Eval Error:", err.response?.data || err.message);

    return res.status(500).json({
      error: "AI returned invalid JSON",
      details: err.message
    });
  }
};
