import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ModulePage() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const user = {
    userId: storedUser.userId || storedUser.user_id,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  const [moduleDetails, setModuleDetails] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const api = axios.create({
    baseURL: "http://localhost:8000",
  });

  useEffect(() => {
    const fetchModuleData = async () => {
      if (!moduleId || !courseId) {
        setError("Missing course or module ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use instructor modules endpoint for both roles since student endpoint is returning 404
        const modulesEndpoint = "/instructor/modules";
        console.log(`Fetching module data from ${modulesEndpoint} with courseId: ${courseId}`);
        
        const moduleResponse = await api.post(modulesEndpoint, { courseId });
        console.log("Module response:", moduleResponse.data);

        // Extract modules list, handling both response formats
        const modulesList = moduleResponse.data[0] || [];
        console.log("Modules list:", modulesList);

        // Find the current module, checking both id and moduleId
        const module = modulesList.find(m => 
          String(m.id) === String(moduleId) || 
          (m.moduleId && String(m.moduleId) === String(moduleId))
        );

        if (!module) {
          console.error(`Module not found with ID: ${moduleId}`);
          setError("Module not found");
          setLoading(false);
          return;
        }

        console.log("Found module:", module);
        
        setModuleDetails({
          id: module.id,
          title: module.title || "",
          contentLink: module.content_link || module.contentLink || "",
          courseId: module.course_id || module.courseId || courseId
        });

        // Use instructor quizzes endpoint for both roles since student endpoint is returning 500
        const quizzesEndpoint = "/instructor/quizzes";
        console.log(`Fetching quizzes from ${quizzesEndpoint} with moduleId: ${moduleId}`);
        
        try {
          const quizzesResponse = await api.post(quizzesEndpoint, { moduleId });
          console.log("Quizzes response:", quizzesResponse.data);

          let quizzesList = [];
          if (quizzesResponse.data && quizzesResponse.data.success) {
            quizzesList = quizzesResponse.data.quizzes || [];
          }

          setQuizzes(quizzesList);
          console.log("Processed quizzes:", quizzesList);
        } catch (quizError) {
          console.error("Failed to fetch quizzes:", quizError);
          // Don't fail the whole page load if quizzes can't be loaded
          setQuizzes([]);
        }

      } catch (err) {
        console.error("Failed to fetch module data:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url
        });
        setError(`Failed to load module data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId, courseId, user.role]);

  const handleQuizClick = (quizId) => {
    navigate(`/course/${courseId}/module/${moduleId}/quiz/${quizId}`);
  };

  const handleCreateQuiz = () => {
    navigate(`/course/${courseId}/module/${moduleId}/create-quiz`);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px" 
      }}>
        <p>Loading module content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#f8d7da", 
        color: "#721c24", 
        borderRadius: "6px",
        marginBottom: "1.5rem"
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button
        onClick={() => navigate(`/course/${courseId}`)}
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
        ← Back to Course
      </button>

      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "1rem",
        borderBottom: "1px solid #eaeaea",
        paddingBottom: "1rem"
      }}>
        {moduleDetails.title}
      </h1>

      {moduleDetails.contentLink && (
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1rem", 
          borderRadius: "8px",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#1976d2" }}>Learning Resource</h3>
            <a 
              href={moduleDetails.contentLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: "#007bff",
                textDecoration: "none",
                wordBreak: "break-all"
              }}
            >
              {moduleDetails.contentLink}
            </a>
          </div>
          <a 
          
            onClick={()=>{window.open("https://"+moduleDetails.contentLink)}}
         
       
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              borderRadius: "4px",
              textDecoration: "none"
            }}
          >
            Open Link
          </a>
        </div>
      )}

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1rem" 
        }}>
          <h2 style={{ fontSize: "1.8rem", margin: 0 }}>Module Quizzes</h2>
          
          {user.role === "instructor" && (
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              onClick={handleCreateQuiz}
            >
              + Create New Quiz
            </button>
          )}
        </div>

        {quizzes.length === 0 ? (
          <div style={{ 
            padding: "20px", 
            backgroundColor: "#e8f4f8", 
            borderRadius: "8px",
            marginBottom: "1.5rem",
            textAlign: "center"
          }}>
            <p>No quizzes available for this module.</p>
            {user.role === "instructor" && (
              <p>Click "Create New Quiz" to add one.</p>
            )}
          </div>
        ) : (
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px"
          }}>
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id} 
                style={{ 
                  padding: "16px",
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
                onClick={() => handleQuizClick(quiz.id)}
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
                  {quiz.title}
                </h3>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginTop: "auto" 
                }}>
                  <span style={{
                    display: "inline-block",
                    fontSize: "0.9rem",
                    color: "#6c757d"
                  }}>
                    Difficulty: {quiz.difficultyLevel || 1}/5
                  </span>
                  <span style={{
                    display: "inline-block",
                    fontSize: "0.8rem",
                    color: "#fff",
                    backgroundColor: "#1976d2",
                    padding: "4px 8px",
                    borderRadius: "4px"
                  }}>
                    Start Quiz
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}