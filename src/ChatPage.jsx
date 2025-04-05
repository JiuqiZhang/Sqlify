import React, { useState } from "react";
import axios from "axios";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/chat", {
        message: input,
      });

      const reply = res.data.reply || "Sorry, I didn't understand that.";
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Server error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🧠 SQLify Chat Assistant</h2>

      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
        {messages.map((msg, idx) => (
          <p key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <strong>{msg.sender === "user" ? "You" : "AI"}:</strong> {msg.text}
          </p>
        ))}
        {loading && <p><em>AI is typing...</em></p>}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ width: "70%", padding: "0.5rem" }}
        placeholder="Ask me anything about SQL..."
      />
      <button onClick={sendMessage} style={{ padding: "0.5rem", marginLeft: "1rem" }}>
        Send
      </button>
    </div>
  );
}
