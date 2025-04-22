import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage'; 
import AdminLogin from './pages/login/AdminLogin';
import ChairmanLogin from './pages/login/ChairmanLogin';
import StudentLogin from './pages/login/StudentLogin';
import FacultyLogin from './pages/login/FacultyLogin';
import VCLogin from './pages/login/VcLogin';
import ChancellorLogin from './pages/login/ChancelorLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* Logins pages */}
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/login/chairman" element={<ChairmanLogin/>} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        <Route path="/login/vc" element={<VCLogin />} />
        <Route path="/login/chancellor" element={<ChancellorLogin />} />
      </Routes>
    </Router>
  );
}
export default App;
