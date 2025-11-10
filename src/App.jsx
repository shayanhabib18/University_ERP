import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Login Pages
import MainPage from './pages/MainPage'; 
import AdminLogin from './pages/login/AdminLogin';
import ChairmanLogin from './pages/login/ChairmanLogin';
import StudentLogin from './pages/login/StudentLogin';
import FacultyLogin from './pages/login/FacultyLogin';
import ExecutiveLogin from './pages/login/ExecutiveLogin';
import ExamLogin from './pages/login/ExamLogin';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard'; 
import DepartmentManagement from './pages/admin/DepartmentManagement';
import HandleRequests from './pages/admin/HandleRequests';

// Student Dashboard Pages
import StudentDashboard from "./pages/students/StudentDashboard";
import Profile from "./pages/students/Profile";
import AttendancePage from './pages/students/AttendencePage';
import Courses from "./pages/students/Courses";
import Notifications from "./pages/students/Notifications";
import Requests from "./pages/students/Requests";

//Faculty Dashboard Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';

//Department Chair Pages
import ChairDashboard from './pages/departmentChair/ChairDashboard';

// Executive Dashboard Pages
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Page */}
        <Route path="/" element={<MainPage />} />

        {/* Login Pages */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/chairman" element={<ChairmanLogin />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        <Route path ="/login/executive" element={<ExecutiveLogin />} />
        <Route path="/login/exam" element={<ExamLogin />} />

        {/* Admin Dashboard Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/departments" element={<DepartmentManagement />} />
        <Route path="/admin/handle-requests" element={<HandleRequests />} />

        {/* Student Dashboard Pages */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/courses" element={<Courses />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/requests" element={<Requests />} />
        <Route path="/attendance" element={<AttendancePage />} />

        {/*Faculty Dashboard Pages */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

        {/*ChairDepartment Dashboard Pages */}
        <Route path="/chair/dashboard" element={<ChairDashboard />} />

        {/* Executive Dashboard Pages */}
        <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;
