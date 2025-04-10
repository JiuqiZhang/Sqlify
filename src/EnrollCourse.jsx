// EnrollCourse.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "./api";

export default function EnrollCourse() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const studentId = user.user_id;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setFetchingCourses(true);
        setError("");
        console.log("Loading course list...");

        const response = await api.get("/student/courses");
        console.log("API response:", response.data);

        if (response.data.success && response.data.courses) {
          setCourses(response.data.courses);
          console.log("Loaded", response.data.courses.length, "courses");
        } else {
          setError("Failed to load courses: " + (response.data.message || "Unknown error"));
          console.error("API returned success status but no course data:", response.data);
        }
      } catch (err) {
        setError("Error loading courses: " + (err.response?.data?.message || err.message));
        console.error("API request error:", err);
      } finally {
        setFetchingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }

    if (!studentId) {
      setError("You must be logged in to enroll");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setError("");

      console.log("Enrollment data:", { studentId, courseId: selectedCourseId });

      const enrollResponse = await api.post("/student/enroll", {
        studentId: studentId,
        courseId: selectedCourseId
      });

      console.log("Enroll response:", enrollResponse.data);

      if (enrollResponse.data.success) {
        setMessage("Enrollment successful!");
        setSelectedCourseId("");
      } else {
        setError(enrollResponse.data.message || "Enrollment failed");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      setError("Enrollment error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setFetchingCourses(true);
    setCourses([]);

    const fetchCourses = async () => {
      try {
        const response = await api.get("/student/courses");
        if (response.data.success) {
          setCourses(response.data.courses);
        } else {
          setError("Failed to load courses: " + (response.data.message || "Unknown error"));
        }
      } catch (err) {
        setError("Error loading courses: " + (err.response?.data?.message || err.message));
      } finally {
        setFetchingCourses(false);
      }
    };

    fetchCourses();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>Enroll in a Course</h2>

      {error && (
        <div style={{
          padding: "10px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          {error}
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              border: "1px solid #721c24",
              borderRadius: "4px",
              backgroundColor: "transparent",
              color: "#721c24",
              cursor: "pointer"
            }}
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}

      {message && (
        <div style={{
          padding: "10px",
          backgroundColor: "#d4edda",
          color: "#155724",
          borderRadius: "4px",
          marginBottom: "1rem"
        }}>
          {message}
        </div>
      )}

      {fetchingCourses ? (
        <div>
          <span>Loading courses...</span>
        </div>
      ) : (
        <form onSubmit={handleEnroll}>
          {studentId ? (
            <div style={{
              padding: "10px",
              backgroundColor: "#d1ecf1",
              color: "#0c5460",
              borderRadius: "4px",
              marginBottom: "1rem"
            }}>
              Logged in Student ID: {studentId}
            </div>
          ) : (
            <div style={{
              padding: "10px",
              backgroundColor: "#fff3cd",
              color: "#856404",
              borderRadius: "4px",
              marginBottom: "1rem"
            }}>
              Not logged in. Please log in to enroll.
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="courseSelect" style={{ display: "block", marginBottom: "0.5rem" }}>Select a course</label>
            {courses && courses.length > 0 ? (
              <select
                id="courseSelect"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={loading || !studentId}
                required
              >
                <option value="">-- Select a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.name} - {course.description}
                  </option>
                ))}
              </select>
            ) : (
              <div style={{
                padding: "10px",
                backgroundColor: "#fff3cd",
                color: "#856404",
                borderRadius: "4px"
              }}>
                No courses available at the moment. Please try again later.
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading || !selectedCourseId || !studentId || courses.length === 0 ? "not-allowed" : "pointer",
              opacity: loading || !selectedCourseId || !studentId || courses.length === 0 ? 0.7 : 1
            }}
            disabled={loading || !selectedCourseId || !studentId || courses.length === 0}
          >
            {loading ? "Enrolling..." : "Enroll"}
          </button>
        </form>
      )}

      <div style={{
        marginTop: "2rem",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "#f8f9fa"
      }}>
        <h5>Debug Info:</h5>
        <p>API base URL: {api.defaults?.baseURL || "Using configuration from api.js"}</p>
        <p>Student ID: {studentId || "Not logged in"}</p>
        <p>Courses loaded: {courses.length}</p>
        <p>Status: {error ? "Error" : fetchingCourses ? "Loading" : "Connected"}</p>
        <details>
          <summary>Course data</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(courses, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
