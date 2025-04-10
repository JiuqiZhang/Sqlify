import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InstructorCourses() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // new course form state
  const [showForm, setShowForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // acquire user information
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = instructorId || storedUser.userId || storedUser.user_id;
  const user = {
    userId: userId,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  // API instance
  const api = axios.create({
    baseURL: "http://localhost:8000",
  });

  
  useEffect(() => {
    if (user.role !== "instructor") {
      navigate("/main");
    }
  }, [user.role, navigate]);

  
  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) {
        setError("lack of user ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`acquire ${userId} course`);
        const response = await api.get(`/instructor/${userId}/courses`);
        
        if (response.data && response.data.success) {
          console.log("acquried course:", response.data.courses);
          setCourses(response.data.courses || []);
        } else {
          setError("failed to acqurie course");
        }
      } catch (err) {
        console.error("error :", err);
        setError(`failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  
  const toggleForm = () => {
    setShowForm(!showForm);
    
    setNewCourseName("");
    setNewCourseDescription("");
    setSuccess(false);
    setError("");
  };

  
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!newCourseName.trim()) {
      setError("course name is neccessary");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const courseData = {
        name: newCourseName,
        description: newCourseDescription,
        instructorId: userId
      };
      
      console.log("create new course:", courseData);
      const response = await api.post("/instructor/courses", courseData);
      
      if (response.data && response.data.success) {
        console.log("successfully created course:", response.data);
        setSuccess(true);
        
        // refresh course list
        const coursesResponse = await api.get(`/instructor/${userId}/courses`);
        if (coursesResponse.data && coursesResponse.data.success) {
          setCourses(coursesResponse.data.courses || []);
        }
        
        // reset form fields
        setNewCourseName("");
        setNewCourseDescription("");
        
        // hide form after 2 seconds
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError("failed to create course");
      }
    } catch (err) {
      console.error("error:", err);
      setError(`failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // instructor view course
  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // edit course
  const handleEditCourse = (e, courseId) => {
    e.stopPropagation(); //
    navigate(`/instructor/edit-course/${courseId}`);
  };

  // delete course
  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation(); 
    
    if (window.confirm("are yous ure to delete this course?")) {
      try {
        const response = await api.delete(`/instructor/courses/${courseId}`, {
          data: { instructorId: userId }
        });
        
        if (response.data && response.data.success) {
          //
          setCourses(courses.filter(c => c.courseId !== courseId));
        } else {
          setError("failed to delete course");
        }
      } catch (err) {
        console.error("errot:", err);
        setError(`failed to delete: ${err.message}`);
      }
    }
  };

 
  const handleViewProgress = (e, courseId) => {
    e.stopPropagation(); 
    navigate(`/instructor/progress?courseId=${courseId}`);
  };

  
  const handleViewStudents = (e, courseId) => {
    e.stopPropagation(); 
    navigate(`/instructor/students?courseId=${courseId}`);
  };

  
  const handleBack = () => {
    navigate("/instructor");
  };

  if (loading && !courses.length) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px" 
      }}>
        <p>loading..</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      
      <button
        onClick={handleBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "none",
          border: "none",
          color: "#1976d2",
          fontSize: "16px",
          cursor: "pointer",
          padding: "8px 0",
          marginBottom: "20px"
        }}
      >
        ← back to instructor page
      </button>

      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "1.5rem",
        borderBottom: "1px solid #eaeaea",
        paddingBottom: "1rem"
      }}>
        my course
      </h1>

      {error && !submitting && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          borderRadius: "6px",
          marginBottom: "1.5rem"
        }}>
          <strong>error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#d4edda", 
          color: "#155724", 
          borderRadius: "6px",
          marginBottom: "1.5rem"
        }}>
          <strong>success!</strong> course created successfully!
        </div>
      )}

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1.5rem" 
      }}>
        <h2 style={{ margin: 0 }}>course list</h2>
        <button
          onClick={toggleForm}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: "1rem"
          }}
        >
          {showForm ? "cancel" : "+ create new course"}
        </button>
      </div>

      
      {showForm && (
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          marginBottom: "1.5rem",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>create new course</h3>
          
          <form onSubmit={handleCreateCourse}>
            <div style={{ marginBottom: "1rem" }}>
              <label 
                htmlFor="course-name"
                style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}
              >
                course name:
              </label>
              <input
                id="course-name"
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
                placeholder="input course name"
                required
              />
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label 
                htmlFor="course-description"
                style={{ 
                  display: "block", 
                  marginBottom: "0.5rem",
                  fontWeight: "bold"
                }}
              >
                course description:
              </label>
              <textarea
                id="course-description"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da",
                  minHeight: "100px"
                }}
                placeholder="input course description）"
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? "#6c757d" : "#4CAF50",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: submitting ? "not-allowed" : "pointer",
                width: "100%",
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? "creating..." : "create course"}
            </button>
          </form>
        </div>
      )}

      
      {courses.length === 0 ? (
        <div style={{ 
          padding: "20px", 
          backgroundColor: "#e8f4f8", 
          borderRadius: "8px",
          marginBottom: "1.5rem",
          textAlign: "center"
        }}>
          <p>You have not create any course yet.</p>
          {!showForm && (
            <button
              onClick={toggleForm}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              create your first course
            </button>
          )}
        </div>
      ) : (
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px"
        }}>
          {courses.map((course) => (
            <div 
              key={course.courseId} 
              style={{ 
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: "1px solid #eaeaea",
                height: "100%",
                display: "flex",
                flexDirection: "column"
              }}
              onClick={() => handleViewCourse(course.courseId)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#e9ecef";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
              }}
            >
              <h3 style={{ 
                margin: 0, 
                color: "#1976d2", 
                fontSize: "1.25rem",
                marginBottom: "0.5rem"
              }}>
                {course.courseName}
              </h3>
              
              <p style={{ 
                color: "#6c757d",
                fontSize: "0.9rem",
                margin: "0.5rem 0",
                flexGrow: 1
              }}>
                {course.courseDescription || "无描述"}
              </p>
              
              {/* course operations*/}
              <div style={{ 
                marginTop: "auto", 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "8px"
              }}>
                <button
                  onClick={(e) => handleViewCourse(course.courseId)}
                  style={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  view course
                </button>
                
                <button
                  onClick={(e) => handleEditCourse(e, course.courseId)}
                  style={{
                    backgroundColor: "#ff9800",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  edit
                </button>
                
                <button
                  onClick={(e) => handleDeleteCourse(e, course.courseId)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  delete
                </button>
                
                <button
                  onClick={(e) => handleViewStudents(e, course.courseId)}
                  style={{
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  view student
                </button>
                
                <button
                  onClick={(e) => handleViewProgress(e, course.courseId)}
                  style={{
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  insepct progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}