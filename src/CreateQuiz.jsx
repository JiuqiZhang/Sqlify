import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CreateQuiz() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();

  // Get user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const user = {
    userId: storedUser.userId || storedUser.user_id,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  // State for quiz creation
  const [quizTitle, setQuizTitle] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [questions, setQuestions] = useState([
    { text: "", correctAnswer: "" }
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check user authorization
  useEffect(() => {
    if (user.role !== "instructor") {
      setError("You are not authorized to create quizzes.");
    }
  }, [user.role]);

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { text: "", correctAnswer: "" }]);
  };

  // Update a specific question
  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  // Remove a question
  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Submit quiz
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!quizTitle.trim()) {
      setError("Please enter a quiz title");
      setLoading(false);
      return;
    }

    if (questions.some(q => !q.text.trim() || !q.correctAnswer.trim())) {
      setError("Please fill in all question texts and answers");
      setLoading(false);
      return;
    }

    try {
      // Create the quiz without questions first
      const quizResponse = await fetch(`http://localhost:8000/instructor/courses/${courseId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: quizTitle,
          contentLink: "Quiz module - " + quizTitle
        })
      });

      const quizData = await quizResponse.json();
      
      if (quizData.success) {
        // Successfully created a module, now navigate back
        navigate(`/course/${courseId}/module/${moduleId}`);
      } else {
        setError(quizData.message || "Failed to create quiz module");
      }
    } catch (error) {
      console.error("Quiz creation error:", error);
      setError(`Error creating quiz: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering if not an instructor
  if (user.role !== "instructor") {
    return (
      <div style={{ 
        padding: "2rem", 
        textAlign: "center", 
        backgroundColor: "#f8d7da", 
        color: "#721c24" 
      }}>
        <h1>Unauthorized Access</h1>
        <p>Only instructors can create quizzes.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "1rem",
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      padding: "2rem" 
    }}>
      {/* Back button */}
      <button
        onClick={() => navigate(`/course/${courseId}/module/${moduleId}`)}
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
        ← Back to Module
      </button>

      <h1 style={{ 
        fontSize: "2rem", 
        marginBottom: "1.5rem",
        borderBottom: "1px solid #eaeaea",
        paddingBottom: "1rem"
      }}>
        Create New Quiz
      </h1>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da",
          color: "#721c24",
          padding: "15px",
          marginBottom: "1rem",
          borderRadius: "4px"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Quiz Title */}
        <div style={{ marginBottom: "1rem" }}>
          <label 
            htmlFor="quiz-title" 
            style={{ 
              display: "block", 
              marginBottom: "0.5rem",
              fontWeight: "bold"
            }}
          >
            Quiz Title
          </label>
          <input
            id="quiz-title"
            type="text"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da"
            }}
            placeholder="Enter quiz title"
            required
          />
        </div>

        {/* Difficulty Level */}
        <div style={{ marginBottom: "1rem" }}>
          <label 
            htmlFor="difficulty-level" 
            style={{ 
              display: "block", 
              marginBottom: "0.5rem",
              fontWeight: "bold"
            }}
          >
            Difficulty Level
          </label>
          <select
            id="difficulty-level"
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(Number(e.target.value))}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ced4da"
            }}
          >
            <option value={1}>Easy</option>
            <option value={2}>Medium</option>
            <option value={3}>Hard</option>
          </select>
        </div>

        {/* Questions Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ 
            fontSize: "1.5rem", 
            marginBottom: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            Questions
            <button
              type="button"
              onClick={addQuestion}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              + Add Question
            </button>
          </h2>

          {questions.map((question, index) => (
            <div 
              key={index} 
              style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "1rem", 
                borderRadius: "8px", 
                marginBottom: "1rem",
                border: "1px solid #dee2e6"
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <label 
                  htmlFor={`question-text-${index}`}
                  style={{ 
                    display: "block", 
                    marginBottom: "0.5rem",
                    fontWeight: "bold"
                  }}
                >
                  Question Text
                </label>
                <input
                  id={`question-text-${index}`}
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, "text", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ced4da"
                  }}
                  placeholder="Enter question text"
                  required
                />
              </div>

              <div>
                <label 
                  htmlFor={`question-answer-${index}`}
                  style={{ 
                    display: "block", 
                    marginBottom: "0.5rem",
                    fontWeight: "bold"
                  }}
                >
                  Correct Answer
                </label>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <input
                    id={`question-answer-${index}`}
                    type="text"
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(index, "correctAnswer", e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ced4da"
                    }}
                    placeholder="Enter correct answer"
                    required
                  />
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      style={{
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#6c757d" : "#007bff",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "4px",
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? "Creating Quiz..." : "Create Quiz"}
        </button>
      </form>

      {/* Cancel Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: "1rem",
          display: "block",
          width: "100%",
          padding: "12px 24px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  );
}