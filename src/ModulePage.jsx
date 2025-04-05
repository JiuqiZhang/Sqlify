import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const mockModuleContent = {
  "m1": {
    name: "Intro to SQL",
    content: "https://sql.module/intro",
    quizzes: [
      { id: "q1", name: "Basics Quiz" },
      { id: "q2", name: "Syntax Quiz" },
    ]
  },
  "m2": {
    name: "Joins",
    content: "https://sql.module/joins",
    quizzes: []
  }
};

export default function ModulePage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const module = mockModuleContent[moduleId];

  if (!module) {
    return <p>Module not found.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Module: {module.name}</h2>
      <p><a href={module.content} target="_blank" rel="noreferrer">📎 Open Learning Link</a></p>

      <h3>Quizzes</h3>
      {module.quizzes.length === 0 ? (
        <p>No quizzes yet.</p>
      ) : (
        <ul>
          {module.quizzes.map(q => (
            <li key={q.id}>
              <button onClick={() => navigate(`/quiz/${q.id}`)}>
                🧪 {q.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {user.identity === "instructor" && (
        <button
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          backgroundColor: "#3f51b5",
          color: "white",
          border: "none",
        }}
        onClick={() => navigate(`/course/${courseId}/module/${moduleId}/create-quiz`)}
      >
        ➕ Create Quiz
      </button>
      
      )}

      <br /><br />
      <button onClick={() => navigate(`/course/${courseId}`)}>⬅️ Back to Course</button>
    </div>
  );
}
