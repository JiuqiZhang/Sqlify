import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function MainPage() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const user = {
    userId: storedUser.userId || storedUser.user_id,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [rawApiResponses, setRawApiResponses] = useState({});

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user.userId) {
        console.warn("No user ID found, cannot fetch courses");
        setLoading(false);
        setError("User ID not found. Please log in again.");
        return;
      }

      console.log("Fetching courses for user:", user);
      
      try {
        setLoading(true);
        
        // acquire enrolled courses
        console.log("Fetching enrolled courses for student ID:", user.userId);
        const enrolledRes = await api.post("/student/enrolled", { 
          studentId: user.userId 
        });
        
        // acquire courses
        const availableRes = await api.get("/student/courses");
        
        // keep raw API responses for debugging
        setRawApiResponses({
          enrolled: enrolledRes.data,
          available: availableRes.data
        });
        
        console.log("Raw enrolled response:", enrolledRes.data);
        console.log("Raw available response:", availableRes.data);

        // ensure enrolledRes.data.success is true
        let enrolled = [];
        if (enrolledRes.data.success) {
          if (Array.isArray(enrolledRes.data.courses)) {
            enrolled = enrolledRes.data.courses;
            console.log("enrolledRes.data.courses is an array with length:", enrolled.length);
          } else if (enrolledRes.data.courses) {
            
            enrolled = [enrolledRes.data.courses];
            console.log("enrolledRes.data.courses is not an array, using as single item");
          } else {
            console.log("enrolledRes.data.courses is falsy:", enrolledRes.data.courses);
          }
        } else {
          console.log("enrolledRes.data.success is falsy");
        }

        let available = [];
        if (availableRes.data.success) {
          available = Array.isArray(availableRes.data.courses) 
            ? availableRes.data.courses 
            : availableRes.data.courses ? [availableRes.data.courses] : [];
        }

        console.log("Processed enrolled courses:", enrolled);
        console.log("Enrolled courses count:", enrolled.length);
        
        
        const normalizeEnrolled = enrolled.map(course => ({
          id: course.id || course.courseId,
          name: course.name || course.courseName,
          description: course.description || course.courseDescription
        }));

        const normalizeAvailable = available.map(course => ({
          id: course.id || course.courseId,
          name: course.name || course.courseName,
          description: course.description || course.courseDescription
        }));

        const enrolledIds = new Set(normalizeEnrolled.map(c => c.id));
        const filteredAvailable = normalizeAvailable.filter(
          course => !enrolledIds.has(course.id)
        );

        console.log("Normalized enrolled courses:", normalizeEnrolled);
        console.log("Normalized available courses:", filteredAvailable);

        setDebugInfo(`
          Raw Enrolled Response: ${JSON.stringify(enrolledRes.data)}
          Raw Available Response: ${JSON.stringify(availableRes.data)}
          Normalized Enrolled (${normalizeEnrolled.length}): ${JSON.stringify(normalizeEnrolled)}
          Normalized Available (${filteredAvailable.length}): ${JSON.stringify(filteredAvailable)}
        `);

        setEnrolledCourses(normalizeEnrolled);
        setAvailableCourses(filteredAvailable);
      } catch (err) {
        console.error("Course fetch error:", err);
        setError(`Failed to fetch courses: ${err.message}`);
        setDebugInfo(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user.userId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to SQLify, {user.username}!</h1>
      <p>You are logged in as <strong>{user.role}</strong>.</p>

      {loading ? (
        <p>Loading your courses...</p>
      ) : error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <>
          <h3>Your Courses:</h3>
          {enrolledCourses.length === 0 ? (
            <p>You have no enrolled courses.</p>
          ) : (
            <ul>
              {enrolledCourses.map((course) => (
                <li key={course.id} style={{ marginBottom: "10px" }}>
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
                  </button>
                  {course.description && (
                    <span style={{ marginLeft: "8px", color: "#666" }}>
                      : {course.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {user.role === "student" && (
            <>
              <h3>Available Courses:</h3>
              {availableCourses.length === 0 ? (
                <p>No courses available for enrollment.</p>
              ) : (
                <ul>
                  {availableCourses.map((course) => (
                    <li key={course.id} style={{ marginBottom: "8px" }}>
                      <strong>{course.name}</strong>
                      {course.description && (
                        <span style={{ marginLeft: "8px", color: "#666" }}>
                          - {course.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}

      {user.role === "student" && (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginTop: "1rem",
            cursor: "pointer"
          }}
          onClick={() => navigate("/enroll-course")}
        >
          📚 Enroll in Course
        </button>
      )}

      {user.role === "instructor" && (
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#3f51b5",
            color: "white",
            border: "none",
            borderRadius: "4px",
            marginTop: "1rem",
            cursor: "pointer"
          }}
          onClick={() => navigate("/create-course")}
        >
          ➕ Create Course
        </button>
      )}

      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          marginTop: "1rem",
          marginLeft: "10px",
          cursor: "pointer"
        }}
        onClick={() => navigate("/chat")}
      >
        💬 Chat with AI
      </button>

      <br /><br />
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

      {/*  */}
      <div style={{ 
        marginTop: "2rem", 
        padding: "1rem", 
        border: "1px solid #ddd", 
        borderRadius: "4px",
        backgroundColor: "#f8f9fa"
      }}>
        <h5>:</h5>
        <p>ID: {user.userId}</p>
        <p>role: {user.role}</p>
        <p>registered: {enrolledCourses.length}</p>
        <p>availablecourse: {availableCourses.length}</p>
        
        <details>
          <summary>raq API</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
            {JSON.stringify(rawApiResponses, null, 2)}
          </pre>
        </details>
        
        <details>
          <summary>info</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.8rem" }}>
            {debugInfo}
          </pre>
        </details>
      </div>
    </div>
  );
}