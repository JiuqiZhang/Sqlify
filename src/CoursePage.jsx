// this the course page, which shows the course name and modules
// and allows the instructor to create a new module
// and the student to view the modules
import React from "react";
import { useParams } from "react-router-dom";

const mockModules = {
  "c1": [
    { id: "m1", name: "Intro to SQL", content: "https://sql.module/intro" },
    { id: "m2", name: "Joins", content: "https://sql.module/joins" },
  ],
  "c2": [],
};

export default function CoursePage() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const { courseId } = useParams(); // 从 URL 读取课程 ID

  const modules = mockModules[courseId] || [];

  const handleCreateModule = () => {
    alert("Instructor-only: Create Module Dialog");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Course: {courseId}</h2>
      <p>Logged in as: {user.username} ({user.identity})</p>

      <h3>Modules:</h3>
      {modules.length === 0 ? (
        <p>No modules yet.</p>
      ) : (
        <ul>
          {modules.map((mod) => (
            <li key={mod.id}>
              <button
                onClick={() => navigate(`/course/${courseId}/module/${mod.id}`)}
              >
                📘 {mod.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {user.identity === "instructor" && (
        <button onClick={handleCreateModule}>➕ Create Module</button>
      )}
    </div>
  );
}
