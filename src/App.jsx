import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Main Page
import MainPage from './pages/MainPage';

// Login Pages
import AdminLogin from './pages/login/AdminLogin';
import ChairmanLogin from './pages/login/ChairmanLogin';
import StudentLogin from './pages/login/StudentLogin';
import FacultyLogin from './pages/login/FacultyLogin';
import ExecutiveLogin from './pages/login/ExecutiveLogin';
import CoordinatorLogin from './pages/login/CoordinatorLogin';
import ForgotPassword from './pages/login/ForgotPassword';
import ResetPassword from './pages/login/ResetPassword';

// ✅ Signup Page
import StudentSignup from "./pages/students/StudentSignup";
// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import HandleRequests from './pages/admin/HandleRequests';

// Student Dashboard Pages
import StudentDashboard from './pages/students/StudentDashboard';
import Profile from './pages/students/Profile';
import AttendancePage from './pages/students/AttendencePage';
import Courses from './pages/students/Courses';
import Notifications from './pages/students/Notifications';
import Requests from './pages/students/Requests';

// Faculty Dashboard
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyRequests from './pages/faculty/FacultyRequests';

// Chair Dashboard
import ChairDashboard from './pages/departmentChair/ChairDashboard';

// Executive Dashboard
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';

// Coordinator Dashboard 
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard';

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
        <Route path="/login/executive" element={<ExecutiveLogin />} />
        <Route path="/login/coordinator" element={<CoordinatorLogin />} />
        
        {/* Forgot Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ✅ Student Signup */}
        <Route path="/signup/student" element={<StudentSignup />} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/departments" element={<DepartmentManagement />} />
        <Route path="/admin/handle-requests" element={<HandleRequests />} />

        {/* Student Dashboard */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/courses" element={<Courses />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/requests" element={<Requests />} />
        <Route path="/attendance" element={<AttendancePage />} />

        {/* Faculty Dashboard */}
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/requests" element={<FacultyRequests />} />

        {/* Chair Dashboard */}
        <Route path="/chair/dashboard" element={<ChairDashboard />} />

        {/* Executive Dashboard */}
        <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />

        {/* Coordinator Dashboard */}
        <Route path="/coordinator/dashboard" element={<CoordinatorDashboard />} />
       
      </Routes>
    </Router>
  );
}

export default App;
