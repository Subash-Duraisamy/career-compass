import axios from "axios";

export const chatAssistant = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message provided" });
  }

  try {
    const prompt = `
You are an AI Career Assistant. 
Give clear, friendly, helpful answers.
Use simple sentences.
Avoid long paragraphs.
Use bullet points whenever helpful.

User message: "${message}"
`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-70b-instruct",   // FREE, STRONG, WORKS
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Career Compass AI",
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    return res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to get AI response" });
  }
};
