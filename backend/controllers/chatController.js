import { GoogleGenerativeAI } from "@google/generative-ai";

export const chatAssistant = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an AI Career Assistant. 
Give clear, friendly, helpful answers.
No long paragraphs. Use bullet points when needed.

User message: ${message}
    `;

    const response = await model.generateContent(prompt);
    const reply = response.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
};
