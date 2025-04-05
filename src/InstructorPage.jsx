
// this is the main page for instructor, they can creat course and manage their courses
import React from "react";
import { useNavigate } from "react-router-dom";

export default function InstructorPage() {
  const user = JSON.parse(localStorage.getItem("user")) || {
    username: "Guest",
    identity: "unknown"
  };

  const navigate = useNavigate();

  const mockCourses = [
    { id: "c1", name: "SQL for Beginners", description: "Basic SQL concepts." },
    { id: "c2", name: "Advanced Queries", description: "Complex joins and subqueries." }
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome Instructor, {user.username}!</h1>
      <p>You are logged in as <strong>{user.identity}</strong>.</p>

      <h3>Your Courses:</h3>
      <ul>
        {mockCourses.map(course => (
          <li key={course.id}>
            <button
              onClick={() => navigate(`/course/${course.id}`)}
              style={{
                background: "none",
                border: "none",
                color: "#1976d2",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "1rem",
                padding: 0
              }}
            >
              <strong>{course.name}</strong>
            </button>: {course.description}
          </li>
        ))}
      </ul>

      <button
        style={{
          padding: "10px 20px",
          marginRight: "1rem",
          backgroundColor: "#2196F3",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
        onClick={() => navigate("/create-course")}
      >
        ➕ Create Course
      </button>

      <button
       style={{ marginTop: "1rem" }}
       onClick={() => navigate("/chat")}
       >
        💬 Chat with AI
      </button>


      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#FF9800",
          color: "white",
          border: "none",
          cursor: "pointer"
        }}
        onClick={() => {
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        🚪 Logout
      </button>
    </div>
  );
}

