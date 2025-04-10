import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ConstructionOutlined } from "@mui/icons-material";

// 测验作答组件 (学生视图)
const TakeQuizForm = ({ quiz, onSubmit, loading }) => {
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [error, setError] = useState("");

  // API实例
  const api = axios.create({
    baseURL: "http://localhost:8000",
  });

  // 获取当前测验的问题
  useEffect(() => {
    const fetchQuizQuestions = async () => {
      try {
        setLoadingQuestions(true);
        
        // 使用通用的问题获取端点
        const endpoint = "/instructor/quiz-questions";
        console.log(`从${endpoint}获取测验问题，quizId=${quiz.id}`);
        
        const response = await api.post(endpoint, { quizId: quiz.id });
        
        if (response.data && response.data.success) {
          console.log("获取到的问题:", response.data.questions);
          setQuestions(response.data.questions || []);
          
          // 初始化答案对象
          const initialAnswers = {};
          response.data.questions.forEach(q => {
            initialAnswers[q.id] = "";
          });
          setAnswers(initialAnswers);
        } else {
          setError("获取测验问题失败");
        }
      } catch (err) {
        console.error("获取测验问题时出错:", err);
        setError(`获取测验问题失败: ${err.message}`);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuizQuestions();
  }, [quiz.id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    //  
    const formattedAnswers = Object.keys(answers).map(questionId => ({
      questionId: parseInt(questionId),
      answer: answers[questionId]
    }));
    
    onSubmit(formattedAnswers);
  };

  if (loadingQuestions) {
    return (
      <div style={{ padding: "15px", textAlign: "center" }}>
        <p>loading question..</p>
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
        <strong>error:</strong> {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{ 
        padding: "15px", 
        backgroundColor: "#e8f4f8", 
        borderRadius: "8px",
        marginBottom: "1.5rem",
        textAlign: "center"
      }}>
        <p>No question in the quiz</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
      {questions.map((question, index) => (
        <div 
          key={question.id} 
          style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "1.5rem", 
            borderRadius: "8px", 
            marginBottom: "1.5rem",
            border: "1px solid #dee2e6"
          }}
        >
          <p style={{ 
            fontSize: "1.1rem", 
            fontWeight: "500", 
            marginBottom: "1rem" 
          }}>
            {index + 1}. {question.text}
          </p>
          
          <div>
            <label 
              htmlFor={`answer-${question.id}`}
              style={{ 
                display: "block", 
                marginBottom: "0.5rem",
                fontWeight: "bold"
              }}
            >
              your answer:
            </label>
            <input
              id={`answer-${question.id}`}
              type="text"
              value={answers[question.id] || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ced4da"
              }}
              placeholder="input your answer"
              required
            />
          </div>
        </div>
      ))}

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
        {loading ? "submiting..." : "submit answer"}
      </button> 
    </form>
  );
};

// test list component
const QuizList = ({ quizzes, onSelect, onCreateQuiz, isInstructor, moduleId }) => {
  if (quizzes.length === 0) {
    return (
      <div style={{ 
        padding: "20px", 
        backgroundColor: "#e8f4f8", 
        borderRadius: "8px",
        marginBottom: "1.5rem",
        textAlign: "center"
      }}>
        <p>此模块没有可用的测验。</p>
        {isInstructor && (
          <button
            onClick={() => onCreateQuiz(moduleId)}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              marginTop: "10px",
              cursor: "pointer"
            }}
          >
            create a new quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        marginBottom: "2rem" 
      }}>
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id} 
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
            onClick={() => onSelect(quiz)}
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
              alignItems: "center", 
              margin: "8px 0",
              color: "#6c757d",
              fontSize: "0.9rem"
            }}>
              <span style={{ marginRight: "5px" }}>difficulty:</span>
              
                <span style={{ color: "#ffc107" }}>{"★".repeat(quiz.difficultyLevel)}</span>
                <span style={{ color: "#e9ecef" }}>{"★".repeat(5-quiz.difficultyLevel)}</span>
            
            </div>
            
            <div style={{ marginTop: "auto", paddingTop: "10px" }}>
              <span style={{
                display: "inline-block",
                fontSize: "0.8rem",
                color: "#fff",
                backgroundColor: isInstructor ? "#6c757d" : "#007bff",
                padding: "4px 8px",
                borderRadius: "4px"
              }}>
                {isInstructor ? "Edit" : "Start the quiz"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// main quiz page component
export default function QuizPage() {
  const { moduleId, courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // user information from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const user = {
    userId: storedUser.userId || storedUser.user_id,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  const isInstructor = user.role === "instructor";

  // state management
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // APIinstance
  const api = axios.create({
    baseURL: "http://localhost:8000",
  });

  
  useEffect(() => {
    if (location.state && location.state.selectedQuiz) {
      setSelectedQuiz(location.state.selectedQuiz);
      setQuizCompleted(false);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!moduleId) {
        console.log('aaa')
        setError("lack of moduleID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
       
        const endpoint = isInstructor ? "/instructor/quizzes" : "/student/quizzes";
        console.log(` acquire quizz from${endpoint}，moduleId=${moduleId}`);
        
        const response = await api.post(endpoint, { moduleId });
        
        if (response.data && response.data.success) {
          console.log("fetched quizz:", response.data.quizzes);
          setQuizzes(response.data.quizzes || []);
        } else {
          setError("failed to fetch quizzes");
        }
      } catch (err) {
        console.error("error:", err);
        setError(`failed to fetch quizz: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    
    if (!selectedQuiz) {
      fetchQuizzes();
    } else {
      setLoading(false);
    }
  }, [moduleId, isInstructor, selectedQuiz]);

  
  const handleSelectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizCompleted(false);
  };


  const handleCreateQuiz = () => {
    navigate(`/course/${courseId}/module/${moduleId}/create-quiz`);
  };

 
  const handleSubmitQuiz = async (answers) => {
    if (!user.userId) {
      setError("you must log in to submit the quiz");
      return;
    }

    try {
      setSubmitting(true);
      console.log("answer of student:", {studentId: user.userId, answers});
      
      
      const response = await api.post("/student/attempt", {
        studentId: user.userId,
        answers
      });
      
      if (response.data && response.data.success) {
        setQuizCompleted(true);
      } else {
        setError("failed to submit quiz");
      }
    } catch (err) {
      console.error("error:", err);
      setError(`failed to submit quiz: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: "20px", 
        textAlign: "center", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px" 
      }}>
        <p>loading test...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      
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
        ←back to module
      </button>

      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "1.5rem",
        borderBottom: "1px solid #eaeaea",
        paddingBottom: "1rem"
      }}>
        {selectedQuiz ? selectedQuiz.title : "测验"}
      </h1>

      {error && (
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

      {quizCompleted && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#d4edda", 
          color: "#155724", 
          borderRadius: "6px",
          marginBottom: "1.5rem"
        }}>
          <strong>success!</strong> your quiz has been submitted.
          <button
            onClick={() => setSelectedQuiz(null)}
            style={{
              display: "block",
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            back to quiz list
          </button>
        </div>
      )}

      
      {!selectedQuiz && isInstructor && (
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.5rem" 
        }}>
          <h2 style={{ margin: 0 }}>module quiz</h2>
          <button
            onClick={handleCreateQuiz}
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
            +create new quizz
          </button>
        </div>
      )}

      {/* quizz content */}
      {selectedQuiz && !quizCompleted ? (
        <>
          <div style={{ 
            backgroundColor: "#f0f0f0", 
            padding: "15px", 
            borderRadius: "8px",
            marginBottom: "1.5rem"
          }}>
            <h3 style={{ margin: "0 0 8px 0" }}>quizz information</h3>
            <p style={{ margin: "0 0 5px 0" }}>
              <strong>Difficulty:</strong> {selectedQuiz.difficultyLevel === 1 ? "简单" : 
                                    selectedQuiz.difficultyLevel === 2 ? "中等" : "困难"}
            </p>
          </div>
          
          {isInstructor ? (
            <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <p>As professor, you can not attend a quiz.</p>
              <button
                onClick={() => setSelectedQuiz(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  marginTop: "10px",
                  cursor: "pointer"
                }}
              >
                Return to list
              </button>
            </div>
          ) : (
            <TakeQuizForm 
              quiz={selectedQuiz} 
              onSubmit={handleSubmitQuiz}
              loading={submitting}
            />
          )}
        </>
      ) : (
        <QuizList 
          quizzes={quizzes} 
          onSelect={handleSelectQuiz} 
          onCreateQuiz={handleCreateQuiz}
          isInstructor={isInstructor}
          moduleId={moduleId}
        />
      )}
    </div>
  );
}