import React, { useState } from "react";
import axios from "axios";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: input
      });

      const botMsg = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error: Could not get response" }
      ]);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2>Career Chat Assistant</h2>

      <div
        style={{
          height: "400px",
          overflowY: "auto",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          marginBottom: "20px",
          background: "#fafafa"
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: "10px"
            }}
          >
            <p
              style={{
                display: "inline-block",
                padding: "10px",
                borderRadius: "10px",
                background: msg.role === "user" ? "#2563eb" : "#e5e7eb",
                color: msg.role === "user" ? "white" : "black",
                maxWidth: "70%"
              }}
            >
              {msg.text}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={input}
          placeholder="Ask a career question..."
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "10px" }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
