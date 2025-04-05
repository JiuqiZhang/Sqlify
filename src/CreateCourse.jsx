// CreateCourse.jsx
import React from "react";

export default function CreateCourse() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create a New Course</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        alert("Course created! (You can connect backend later)");
      }}>
        <input type="text" placeholder="Course Name" required />
        <br />
        <textarea placeholder="Course Description" required />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
