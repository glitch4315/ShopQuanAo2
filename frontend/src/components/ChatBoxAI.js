// src/components/ChatBoxAI.js
import React, { useState, useRef, useEffect } from "react";
import "./ChatBoxAI.css";

function ChatBoxAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const toggleOpen = () => setOpen(prev => !prev);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/openai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const botMessage = { role: "bot", content: data.reply || "AI không phản hồi." };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("ChatBoxAI error:", err);
      setMessages(prev => [...prev, { role: "bot", content: "Lỗi khi kết nối AI" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`chatbox-container ${open ? "open" : ""}`}>
      <div className="chatbox-header" onClick={toggleOpen}>
        {open ? "AI Chat" : "Mở Chat AI"}
      </div>
      {open && (
        <div className="chatbox-body">
          <div className="chatbox-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="chat-message bot">Đang trả lời...</div>}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="chatbox-input">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Gửi câu hỏi cho AI..."
            />
            <button onClick={handleSend} disabled={loading}>Gửi</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBoxAI;
