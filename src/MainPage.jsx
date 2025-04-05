// This is the main page of the application, where students can see their courses and enroll in new ones.
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || { username: "Guest", identity: "unknown" };

  // test data，
  const mockCourses = [
    { id: "c1", name: "SQL Basics", instructor: "teacher@example.com" },
    { id: "c2", name: "Advanced SQL", instructor: "teacher@example.com" },
  ];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to SQLify, {user.username}!</h1>
      <p>You are logged in as <strong>{user.identity}</strong>.</p>

      <h3>Your Courses:</h3>
      <ul>
        {mockCourses.map(course => (
          <li key={course.id}>
            <button onClick={() => navigate(`/course/${course.id}`)}>
              📘 {course.name}
            </button>
          </li>
        ))}
      </ul>

      {user.identity === "student" && (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            marginTop: "1rem",
          }}
          onClick={() => navigate("/enroll")}
        >
          📚 Enroll in Course
        </button>
      )}

      {user.identity === "instructor" && (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#3f51b5",
            color: "white",
            border: "none",
            marginTop: "1rem",
          }}
          onClick={() => navigate("/create-course")}
        >
          ➕ Create Course
        </button>
      )}
      
      <button 
      onClick={() => navigate("/chat")}>
        💬 Chat with AI</button>


      <br /><br />
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#FF9800",
          color: "white",
          border: "none",
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


  