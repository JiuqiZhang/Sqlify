import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./Signup.jsx";
import Login from "./Login.jsx";
import MainPage from "./MainPage.jsx"; 
import CreateCourse from "./CreateCourse.jsx";
import EnrollCourse from "./EnrollCourse.jsx";
import InstructorPage from "./InstructorPage.jsx"; 
import CoursePage from "./CoursePage.jsx";
import ModulePage from "./ModulePage.jsx";
import QuizPage from "./QuizPage.jsx";
import CreateQuiz from "./CreateQuiz.jsx";
import ChatPage from "./ChatPage.jsx";








export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/course/:courseId/module/:moduleId" element={<ModulePage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<MainPage />} /> {/* 添加主界面 */}
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/enroll" element={<EnrollCourse />} />
        <Route path="/instructor" element={<InstructorPage />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/course/:courseId/module/:moduleId/create-quiz" element={<CreateQuiz />} />
        <Route path="/chat" element={<ChatPage />} />


      </Routes>
    </Router>
  );
}




