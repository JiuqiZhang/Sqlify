// this course is a mockup for a quiz creation page
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CreateQuiz() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const [quizName, setQuizName] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [questions, setQuestions] = useState([{ text: "", answer: "" }]);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: "", answer: "" }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newQuiz = {
      quizName,
      difficulty,
      moduleId,
      courseId,
      questions,
    };
    console.log("📤 Quiz Submitted:", newQuiz);
    alert("Quiz created (mock). Check console.");
    navigate(`/course/${courseId}/module/${moduleId}`);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create Quiz for Module: {moduleId}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Quiz Name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          required
        />
        <input
          type="number"
          min="1"
          max="5"
          placeholder="Difficulty (1-5)"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          required
        />
        <h4>Questions:</h4>
        {questions.map((q, idx) => (
          <div key={idx}>
            <input
              type="text"
              placeholder={`Question ${idx + 1}`}
              value={q.text}
              onChange={(e) => handleQuestionChange(idx, "text", e.target.value)}
              required
              style={{ width: "80%", marginRight: "1rem" }}
            />
            <input
              type="text"
              placeholder="Correct Answer"
              value={q.answer}
              onChange={(e) => handleQuestionChange(idx, "answer", e.target.value)}
              required
              style={{ width: "40%" }}
            />
          </div>
        ))}
        <button type="button" onClick={addQuestion}>➕ Add Question</button>
        <button type="submit">✅ Submit Quiz</button>
        <button type="button" onClick={() => navigate(-1)}>⬅ Cancel</button>
      </form>
    </div>
  );
}
