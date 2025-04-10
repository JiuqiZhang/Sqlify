import React, { useState, useEffect } from "react";
import api from "./api"; // Corrected import path

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Test API connection on component load
  useEffect(() => {
    const testAPI = async () => {
      try {
        // Try to request a known working endpoint to test connection
        const result = await api.get('/student/courses');
        console.log('API connection test successful:', result.data);
      } catch (error) {
        console.error('API connection test failed:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
      }
    };
    
    testAPI();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Using the /chat endpoint as specified in your Routes document
      const res = await api.post("/chat", {
        question: input, // Exact parameter name from your documentation
      });

      // Process response
      if (res.data.success) {
        const reply = res.data.query || "Sorry, I couldn't generate SQL for that.";
        setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
        
        // If there are results, display them
        if (res.data.result) {
          const resultText = JSON.stringify(res.data.result, null, 2);
          setMessages((prev) => [...prev, { 
            sender: "bot", 
            text: "Results:\n" + resultText,
            isResult: true 
          }]);
        }
      } else {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: res.data.message || "Failed to process your request." 
        }]);
      }
    } catch (err) {
      console.error("Chat request error:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      
      setMessages((prev) => [
        ...prev, 
        { 
          sender: "bot", 
          text: err.response?.data?.message || "Server error. Please try again." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🧠 SQLify Chat Assistant</h2>

      <div style={{ 
        maxHeight: "400px", 
        overflowY: "auto", 
        border: "1px solid #ccc", 
        padding: "1rem", 
        marginBottom: "1rem", 
        borderRadius: "8px",
        backgroundColor: "#f9f9f9"
      }}>
        {messages.length === 0 && (
          <p style={{ color: "#666", textAlign: "center" }}>
            Ask me anything about SQL and I'll generate a query for you!
          </p>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ 
              textAlign: msg.sender === "user" ? "right" : "left",
              marginBottom: "10px",
              backgroundColor: msg.sender === "user" ? "#e3f2fd" : (msg.isResult ? "#e8f5e9" : "#fff"),
              padding: "8px 12px",
              borderRadius: "8px",
              display: "inline-block",
              maxWidth: "80%",
              marginLeft: msg.sender === "user" ? "auto" : "0",
              marginRight: msg.sender === "user" ? "0" : "auto",
              border: msg.isResult ? "1px solid #a5d6a7" : "1px solid #e0e0e0"
            }}
          >
            <strong>{msg.sender === "user" ? "You" : "AI"}:</strong> 
            {msg.isResult ? (
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{msg.text}</pre>
            ) : (
              <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
            )}
          </div>
        ))}
        {loading && (
          <p style={{ textAlign: "left", color: "#666" }}>
            <em>AI is generating SQL...</em>
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ 
            flex: 1, 
            padding: "10px", 
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
          placeholder="Ask me to convert your question into SQL..."
        />
        <button 
          onClick={sendMessage} 
          disabled={loading}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#1976d2", 
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}