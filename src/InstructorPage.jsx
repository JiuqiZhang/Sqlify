// this is the main page for instructor, they can create course and manage their courses
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; 

export default function InstructorPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) 

  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchInstructorCourses = async () => {
      if (user && user.user_id) {
        try {
          setLoading(true);
          setError("");
          
          // check user_id
          console.log("lodaing instructor's courses...", user.user_id);
          
          // correct API endpoint
          const response = await api.get(`/instructor/${user.user_id}/courses`);
          
          // print the response for debugging
          console.log("API response:", response.data);
          
          // }
          if (response.data && response.data.success && Array.isArray(response.data.courses)) {
            setCourses(response.data.courses);
          } else {
            setError("failed to fetch courses");
            setCourses([]);
          }
        } catch (err) {
          console.error("error:", err);
          setError("failed : " + (err.response?.data?.message || err.message));
          setCourses([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchInstructorCourses();
  }, [user.user_id]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome Instructor, {user.username || user.name}!</h1>
      <p>You are logged in as <strong>{user.identity}</strong>.</p>

      <h3>Your Courses:</h3>
      
      {loading ? (
        <p>Loading your courses...</p>
      ) : error ? (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      ) : courses.length > 0 ? (
        <ul>
          {courses.map(course => (
            <li key={course.courseId} style={{ marginBottom: "10px" }}>
              <button
                onClick={() => navigate(`/course/${course.courseId}`)}
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
                <strong>{course.courseName}</strong>
              </button>
              : {course.courseDescription}
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven't created any courses yet.</p>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <button
          style={{
            padding: "10px 20px",
            marginRight: "1rem",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
          onClick={() => navigate("/create-course")}
        >
          ➕ Create Course
        </button>

        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem"
          }}
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
            borderRadius: "4px",
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
      
      {/* 调试信息 */}
      <div style={{ 
        marginTop: "2rem", 
        padding: "1rem", 
        border: "1px solid #ddd", 
        borderRadius: "4px",
        backgroundColor: "#f8f9fa"
      }}>
        <h5>Debug Info:</h5>
        <p>Instructor ID: {user.user_id || "Not available"}</p>
        <p>User Role: {user.identity || "Unknown"}</p>
        <p>Courses Count: {courses.length}</p>
        <details>
          <summary>Courses Data</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(courses, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}