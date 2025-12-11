import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../components/Chat.css"; // ⭐ IMPORT CSS

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const chatEndRef = useRef(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input,
      });

      const botMsg = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error: Could not get response" },
      ]);
    }
  };

  return (
    <div className="chat-page">

      <div className="chat-container">
        <h2 className="chat-title">AI Career Assistant 💬</h2>

        <div className="chat-window">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.role === "user" ? "user" : "bot"}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input"
            value={input}
            placeholder="Ask a career question..."
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button className="chat-send-btn" onClick={sendMessage}>
            Send ➤
          </button>
        </div>
      </div>

    </div>
  );
}

export default Chat;
