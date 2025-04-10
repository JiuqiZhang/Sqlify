import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InstructorCourses() {
  const { instructorId } = useParams();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 新课程表单状态
  const [showForm, setShowForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // 从localStorage获取用户数据
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userId = instructorId || storedUser.userId || storedUser.user_id;
  const user = {
    userId: userId,
    username: storedUser.username || storedUser.userName || storedUser.name || "Guest",
    role: (storedUser.identity || storedUser.role || "guest").toLowerCase(),
  };

  // API实例
  const api = axios.create({
    baseURL: "http://localhost:8000",
  });

  // 验证用户角色
  useEffect(() => {
    if (user.role !== "instructor") {
      navigate("/main");
    }
  }, [user.role, navigate]);

  // 获取教师的所有课程
  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) {
        setError("缺少教师ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`获取教师 ${userId} 的课程`);
        const response = await api.get(`/instructor/${userId}/courses`);
        
        if (response.data && response.data.success) {
          console.log("获取到课程:", response.data.courses);
          setCourses(response.data.courses || []);
        } else {
          setError("获取课程失败");
        }
      } catch (err) {
        console.error("获取课程时出错:", err);
        setError(`获取课程失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // 切换表单显示
  const toggleForm = () => {
    setShowForm(!showForm);
    // 重置表单和状态
    setNewCourseName("");
    setNewCourseDescription("");
    setSuccess(false);
    setError("");
  };

  // 创建新课程
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    if (!newCourseName.trim()) {
      setError("课程名称是必填项");
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
      
      console.log("创建新课程:", courseData);
      const response = await api.post("/instructor/courses", courseData);
      
      if (response.data && response.data.success) {
        console.log("课程创建成功:", response.data);
        setSuccess(true);
        
        // 刷新课程列表
        const coursesResponse = await api.get(`/instructor/${userId}/courses`);
        if (coursesResponse.data && coursesResponse.data.success) {
          setCourses(coursesResponse.data.courses || []);
        }
        
        // 重置表单
        setNewCourseName("");
        setNewCourseDescription("");
        
        // 短暂延迟后隐藏表单
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError("创建课程失败");
      }
    } catch (err) {
      console.error("创建课程时出错:", err);
      setError(`创建课程失败: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 查看课程详情
  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // 编辑课程
  const handleEditCourse = (e, courseId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    navigate(`/instructor/edit-course/${courseId}`);
  };

  // 删除课程
  const handleDeleteCourse = async (e, courseId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    
    if (window.confirm("确定要删除这个课程吗？所有相关的模块和测验也将被删除。")) {
      try {
        const response = await api.delete(`/instructor/courses/${courseId}`, {
          data: { instructorId: userId }
        });
        
        if (response.data && response.data.success) {
          // 从列表中移除已删除的课程
          setCourses(courses.filter(c => c.courseId !== courseId));
        } else {
          setError("删除课程失败");
        }
      } catch (err) {
        console.error("删除课程时出错:", err);
        setError(`删除课程失败: ${err.message}`);
      }
    }
  };

  // 查看学生进度
  const handleViewProgress = (e, courseId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    navigate(`/instructor/progress?courseId=${courseId}`);
  };

  // 查看注册学生
  const handleViewStudents = (e, courseId) => {
    e.stopPropagation(); // 阻止冒泡，避免触发卡片点击
    navigate(`/instructor/students?courseId=${courseId}`);
  };

  // 返回上一级
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
        <p>加载课程中...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* 返回按钮 */}
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
        ← 返回主页
      </button>

      <h1 style={{ 
        fontSize: "2.5rem", 
        marginBottom: "1.5rem",
        borderBottom: "1px solid #eaeaea",
        paddingBottom: "1rem"
      }}>
        我的课程
      </h1>

      {error && !submitting && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#f8d7da", 
          color: "#721c24", 
          borderRadius: "6px",
          marginBottom: "1.5rem"
        }}>
          <strong>错误:</strong> {error}
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
          <strong>成功!</strong> 课程已创建
        </div>
      )}

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1.5rem" 
      }}>
        <h2 style={{ margin: 0 }}>课程列表</h2>
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
          {showForm ? "取消" : "+ 创建新课程"}
        </button>
      </div>

      {/* 创建课程表单 */}
      {showForm && (
        <div style={{ 
          backgroundColor: "#f8f9fa", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          marginBottom: "1.5rem",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>创建新课程</h3>
          
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
                课程名称:
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
                placeholder="输入课程名称"
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
                课程描述:
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
                placeholder="输入课程描述（可选）"
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
              {submitting ? "创建中..." : "创建课程"}
            </button>
          </form>
        </div>
      )}

      {/* 课程列表 */}
      {courses.length === 0 ? (
        <div style={{ 
          padding: "20px", 
          backgroundColor: "#e8f4f8", 
          borderRadius: "8px",
          marginBottom: "1.5rem",
          textAlign: "center"
        }}>
          <p>您还没有创建任何课程。</p>
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
              创建您的第一个课程
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
              
              {/* 课程操作按钮组 */}
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
                  查看课程
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
                  编辑
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
                  删除
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
                  查看学生
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
                  查看进度
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}