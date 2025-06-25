import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Login Pages
import MainPage from './pages/MainPage'; 
import AdminLogin from './pages/login/AdminLogin';
import ChairmanLogin from './pages/login/ChairmanLogin';
import StudentLogin from './pages/login/StudentLogin';
import FacultyLogin from './pages/login/FacultyLogin';
import VCLogin from './pages/login/VcLogin';
import ChancellorLogin from './pages/login/ChancelorLogin';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard'; 
import DepartmentManagement from './pages/admin/DepartmentManagement';
import HandleRequests from './pages/admin/HandleRequests';

// Student Dashboard Pages
import StudentDashboard from "./pages/students/StudentDashboard";
import Transcript from "./pages/students/Transcript";
import Profile from "./pages/students/Profile";
import Courses from "./pages/students/Courses";
import Notifications from "./pages/students/Notifications";
import Requests from "./pages/students/Requests";

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
        <Route path="/login/vc" element={<VCLogin />} />
        <Route path="/login/chancellor" element={<ChancellorLogin />} />

        {/* Admin Dashboard Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/departments" element={<DepartmentManagement />} />
        <Route path="/admin/handle-requests" element={<HandleRequests />} />

        {/* Student Dashboard Pages */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/transcript" element={<Transcript />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/courses" element={<Courses />} />
        <Route path="/student/notifications" element={<Notifications />} />
        <Route path="/student/requests" element={<Requests />} />
      </Routes>
    </Router>
  );
}

export default App;
