// EnrollCourse.jsx
import React from "react";

export default function EnrollCourse() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Enroll in a Course</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        alert("Enrolled in course! (Backend connection needed)");
      }}>
        <input type="text" placeholder="Enter Course ID" required />
        <br />
        <button type="submit">Enroll</button>
      </form>
    </div>
  );
}
