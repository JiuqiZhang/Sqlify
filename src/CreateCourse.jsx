import React from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

export default function CreateCourse() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const description = e.target[1].value;
    
    //acuire user information
    const user = JSON.parse(localStorage.getItem("user"));
    console.log("userdata:", user);
    

    if (!user || (!user.user_id && !user.id && !user.uid)) {
      return alert("User information is missing. Please log in again.");
    }
    
  
    const instructorId = user.user_id || user.id || user.uid;
    console.log("instructor_id:", instructorId);
    
    try {
      console.log("send data request:", { name, description, instructor_id: instructorId });
      
      const res = await api.post("/instructor/courses", {
        name: name,
        course_description: description,
        instructor_id: instructorId
      });
      
      console.log("server response:", res.data);
      
      if (res.data.success) {
        alert("course created ！");
        navigate("/instructor"); 
      } else {
        alert("failed to create course: " + (res.data.message || "unknown mistake"));
      }
    } catch (err) {
      
      console.error("response data:", err.response?.data);
      
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>create new course</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="courseName">course name:</label>
          <input 
            type="text" 
            id="courseName"
            placeholder="course name" 
            required 
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          />
        </div>
        
        <div>
          <label htmlFor="courseDescription">course description:</label>
          <textarea 
            id="courseDescription"
            placeholder="course description" 
            required 
            rows="4"
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          />
        </div>
        
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button 
            type="submit" 
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              cursor: "pointer"
            }}
          >
            create course
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate("/instructor")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              cursor: "pointer"
            }}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
