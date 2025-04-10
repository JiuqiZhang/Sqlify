import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CreateModuleModal = ({ isOpen, onClose, onSubmit, courseId }) => {
  const [title, setTitle] = useState("");
  const [contentLink, setContentLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({ title, contentLink, courseId });
      setTitle("");
      setContentLink("");
      onClose();
    } catch (error) {
      console.error("Module creation failed:", error);
      alert("Failed to create module: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white", padding: "2rem", borderRadius: "8px",
        width: "90%", maxWidth: "500px", boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ marginTop: 0 }}>Create New Module</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="title" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Module Name:
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
              placeholder="Enter module name"
            />
          </div>
          <div>
            <label htmlFor="contentLink" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Content Link:
            </label>
            <input
              id="contentLink"
              type="text"
              value={contentLink}
              onChange={(e) => setContentLink(e.target.value)}
              required
              placeholder="https://example.com/module-content"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem", borderRadius: "4px", border: "1px solid #ccc",
                backgroundColor: "#f5f5f5", cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem", borderRadius: "4px", border: "none",
                backgroundColor: "#4CAF50", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Submitting..." : "Create Module"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const user = {
    userId: storedUser.userId || storedUser.user_id,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const api = axios.create({ baseURL: "http://localhost:8000" });

  const fetchCourseData = async () => {
    if (!courseId) {
      setError("No course ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch course details
      const coursesResponse = await api.get("/student/courses");
      const courseList = coursesResponse.data.success ? coursesResponse.data.courses : [];
      const currentCourse = courseList.find(c => String(c.id) === String(courseId));

      if (!currentCourse) {
        setError("Course not found");
        return;
      }

      setCourse(currentCourse);

      // Fetch modules - using instructor or student endpoint based on role
      // The key fix here: For both roles we're using POST with courseId in the body 
      const modulesEndpoint = user.role === "instructor" ? "/instructor/modules" : "/instructor/modules";
      console.log(`Fetching modules using ${modulesEndpoint} endpoint with courseId: ${courseId}`);
      
      const modulesResponse = await api.post(modulesEndpoint, { courseId });
      console.log("Modules response:", modulesResponse.data);

      let modulesList = [];
      if (user.role === "instructor") {
        // Handle instructor response format
        modulesList = modulesResponse.data[0] || [];
      } else {
        // For student role, we're using the instructor endpoint for now due to the 404 issue
        modulesList = modulesResponse.data[0] || [];
      }

      console.log("Raw modules list:", modulesList);

      // Normalize module data to handle different API response formats
      const normalizedModules = modulesList
        .filter(m => (m.moduleId ?? m.id) && (m.title?.trim() || m.content_link))
        .map(m => ({
          id: m.moduleId ?? m.id,
          title: m.title,
          contentLink: m.content_link || m.contentLink || "",
          courseId: m.course_id || m.courseId || courseId,
        }));

      console.log("Normalized modules:", normalizedModules);
      setModules(normalizedModules);
    } catch (err) {
      console.error("Error fetching course data:", err);
      setError(`Failed to load course data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, user.role]);

  const handleCreateModule = async (moduleData) => {
    try {
      const response = await api.post(`/instructor/courses/${courseId}/modules`, {
        title: moduleData.title,
        contentLink: moduleData.contentLink,
      });

      if (response.data?.success) {
        fetchCourseData();
        return response.data;
      } else {
        throw new Error(response.data?.message || "Module creation failed");
      }
    } catch (error) {
      console.error("Module creation error:", error);
      throw error;
    }
  };

  const handleModuleClick = (moduleId) => {
    console.log("Navigating to Module:", moduleId, "in Course:", courseId);

    if (!moduleId) {
      console.error("Missing moduleId for navigation");
      alert("Module ID is invalid or missing.");
      return;
    }

    navigate(`/course/${courseId}/module/${moduleId}`);
  };

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
      <p>Loading course content...</p>
    </div>;
  }

  if (error) {
    return <div style={{
      padding: "15px", backgroundColor: "#f8d7da", color: "#721c24",
      borderRadius: "6px", marginBottom: "1.5rem"
    }}>
      <strong>Error:</strong> {error}
    </div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button onClick={() => navigate(user.role === "instructor" ? "/instructor" : "/main")}
        style={{
          background: "none", border: "none", color: "#1976d2",
          fontSize: "16px", cursor: "pointer", padding: "8px 0", marginBottom: "20px"
        }}>
        ← Back to Dashboard
      </button>

      <h1 style={{
        fontSize: "2.5rem", marginBottom: "2rem",
        borderBottom: "1px solid #eaeaea", paddingBottom: "1rem"
      }}>{course.name}</h1>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "1rem"
        }}>
          <h2 style={{ fontSize: "1.8rem", margin: 0 }}>Course Modules</h2>
          {user.role === "instructor" && (
            <button onClick={() => setIsModalOpen(true)} style={{
              padding: "12px 24px", backgroundColor: "#4CAF50", color: "white",
              border: "none", borderRadius: "4px", cursor: "pointer",
              fontSize: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              + Create New Module
            </button>
          )}
        </div>

        {modules.length === 0 ? (
          <div style={{
            padding: "20px", backgroundColor: "#e8f4f8",
            borderRadius: "8px", textAlign: "center"
          }}>
            <p>No modules available for this course.</p>
            {user.role === "instructor" && <p>Click "Create New Module" to add content.</p>}
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {modules.map((module) => (
              <div
                key={`${courseId}-${module.id}-${module.title}`}
                onClick={() => handleModuleClick(module.id)}
                style={{
                  padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)", cursor: "pointer",
                  border: "1px solid #eaeaea", display: "flex", flexDirection: "column"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#e9ecef";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                }}
              >
                <h3 style={{ margin: 0, color: "#1976d2", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  {module.title}
                </h3>
                {module.contentLink && (
                  <p style={{
                    margin: "8px 0 0", color: "#6c757d", fontSize: "0.9rem",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    Link: {module.contentLink}
                  </p>
                )}
                <div style={{ marginTop: "auto", paddingTop: "10px" }}>
                  <span style={{
                    fontSize: "0.8rem", color: "#fff", backgroundColor: "#1976d2",
                    padding: "4px 8px", borderRadius: "4px"
                  }}>
                    View Module
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateModuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateModule}
        courseId={courseId}
      />
    </div>
  );
}