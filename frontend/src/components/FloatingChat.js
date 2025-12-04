import React, { useState } from "react";
import axios from "axios";
import "./FloatingChat.css";
// import ChatIcon from "../assets/chat_icon.png";
import ChatIcon from "../assets/chat_icon.svg"; // your chat icon

function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    
    setInput("");

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message: userMsg.text,
      });

      const botMsg = { role: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error: Unable to connect." },
      ]);
    }
  };

  return (
    <>
      {/* CHAT POPUP */}
      {open && (
        <div className="chatbox">
          <div className="chatbox-header">
            AI Career Assistant
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatbox-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === "user" ? "msg user-msg" : "msg bot-msg"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbox-input">
            <input
              type="text"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <div className="chat-float-btn" onClick={() => setOpen(true)}>
        <img src={ChatIcon} className="chat-float-icon" alt="Chat" />
      </div>
    </>
  );
}

export default FloatingChat;
