import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 已有组件导入
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

// 需要创建的新组件 (目前使用占位符)
// 先导入可能尚未创建的组件
const InstructorCourses = () => <div>教师课程页面</div>;
const InstructorModules = () => <div>教师模块页面</div>;
const UpdateModule = () => <div>更新模块页面</div>;
const InstructorQuizzes = () => <div>教师测验页面</div>;
const QuizQuestions = () => <div>测验问题页面</div>;
const StudentsList = () => <div>学生列表页面</div>;
const CourseProgress = () => <div>课程进度页面</div>;
const InstructorProfile = () => <div>教师个人资料页面</div>;
const StudentCourses = () => <div>学生课程页面</div>;
const StudentModules = () => <div>学生模块页面</div>;
const StudentQuizzes = () => <div>学生测验页面</div>;
const AttemptQuiz = () => <div>测验作答页面</div>;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. 认证相关路由 */}
        <Route path="/" element={<SignUp />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        {/* 2. 主页/公共路由 */}
        <Route path="/main" element={<MainPage />} />
        <Route path="/chat" element={<ChatPage />} />
        
        {/* 3. 教师相关路由 */}
        {/* 教师主页/教师课程列表 */}
        <Route path="/instructor" element={<InstructorPage />} />
        <Route path="/instructor/:instructorId/courses" element={<InstructorCourses />} />
        <Route path="/create-course" element={<CreateCourse />} />
        
        {/* 课程模块管理 */}
        <Route path="/instructor/modules" element={<InstructorModules />} />
        <Route path="/instructor/modules/:moduleId" element={<UpdateModule />} />
        
        {/* 测验管理 */}
        <Route path="/instructor/quizzes" element={<InstructorQuizzes />} />
        <Route path="/instructor/newquizzes" element={<CreateQuiz />} />
        <Route path="/instructor/quiz-questions" element={<QuizQuestions />} />
        
        {/* 学生和进度管理 */}
        <Route path="/instructor/students" element={<StudentsList />} />
        <Route path="/instructor/progress" element={<CourseProgress />} />
        <Route path="/instructor/profile" element={<InstructorProfile />} />
        
        {/* 4. 学生相关路由 */}
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/enroll" element={<EnrollCourse />} />
        <Route path="/student/enrolled" element={<MainPage />} />
        <Route path="/student/modules" element={<StudentModules />} />
        <Route path="/student/quizzes" element={<StudentQuizzes />} />
        <Route path="/student/quiz-questions" element={<QuizQuestions />} />
        <Route path="/student/attempt" element={<AttemptQuiz />} />
        
        {/* 5. 整合视图路由 (更友好的用户导航路径) */}
        {/* 课程视图 */}
        <Route path="/course/:courseId" element={<CoursePage />} />
        
        {/* 模块视图 */}
        <Route path="/course/:courseId/module/:moduleId" element={<ModulePage />} />
        
        {/* 测验视图 */}
        <Route path="/course/:courseId/module/:moduleId/quizzes" element={<QuizPage />} />
        <Route path="/course/:courseId/module/:moduleId/quiz/:quizId" element={<QuizPage />} />
        <Route path="/course/:courseId/module/:moduleId/create-quiz" element={<CreateQuiz />} />
        
        {/* 6. 测验单独访问路由 (兼容性路由) */}
        <Route path="/quiz/:quizId" element={<QuizPage />} />
      </Routes>
    </Router>
  );
}




