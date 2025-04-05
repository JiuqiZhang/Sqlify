import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 模拟题目数据
const mockQuizzes = {
  q1: {
    name: "Basics Quiz",
    questions: [
      { id: "q1_1", text: "What does SQL stand for?", answer: "Structured Query Language" },
      { id: "q1_2", text: "Which command is used to retrieve data?", answer: "SELECT" },
    ],
  },
  q2: {
    name: "Syntax Quiz",
    questions: [
      { id: "q2_1", text: "Which clause filters rows?", answer: "WHERE" },
    ],
  },
};

export default function QuizPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { quizId } = useParams();
  const navigate = useNavigate();

  const quiz = mockQuizzes[quizId];

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz) return <p>Quiz not found.</p>;

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isCorrect = (id, correctAnswer) => {
    return answers[id]?.trim().toLowerCase() === correctAnswer.toLowerCase();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🧪 {quiz.name}</h2>

      {quiz.questions.map((q) => (
        <div key={q.id} style={{ marginBottom: "1rem" }}>
          <p><strong>{q.text}</strong></p>
          <input
            type="text"
            disabled={submitted}
            value={answers[q.id] || ""}
            onChange={(e) => handleChange(q.id, e.target.value)}
            style={{ padding: "0.5rem", width: "60%" }}
          />
          {submitted && (
            <p style={{ color: isCorrect(q.id, q.answer) ? "green" : "red" }}>
              {isCorrect(q.id, q.answer) ? "✅ Correct" : `❌ Wrong (Answer: ${q.answer})`}
            </p>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
          }}
        >
          Submit Quiz
        </button>
      )}

      <br /><br />
      <button onClick={() => navigate(-1)}>⬅ Back</button>
    </div>
  );
}
