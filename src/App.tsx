import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import HonorBoard from './pages/HonorBoard';
import Notes from './pages/Notes';
import Attendance from './pages/Attendance';
import Admin from './pages/Admin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Exit System
import ExitLogin from './pages/exit/Login';
import ExitAdminDashboard from './pages/exit/AdminDashboard';
import ExitGuardDashboard from './pages/exit/GuardDashboard';

// Visiting System
import VisitorForm from './pages/visiting/components/VisitorForm';
import VisitorExit from './pages/visiting/components/ExitScanner';
import VisitorSuccess from './pages/visiting/components/SuccessPage';
import VisitorAdminLogin from './pages/visiting/components/AdminLogin';
import VisitorAdminDashboard from './pages/visiting/components/AdminDashboard';

const ExitPrivateRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (!token) return <Navigate to="/exit/login" />;
    if (role && userRole !== role) return <Navigate to="/exit/login" />;
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="container mx-auto px-4 flex-grow">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/honor" element={<HonorBoard />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/attendance" element={<Attendance />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                        <Route path="/student-dashboard" element={<StudentDashboard />} />

                        {/* Exit System */}
                        <Route path="/exit/login" element={<ExitLogin />} />
                        <Route path="/exit/admin" element={<ExitPrivateRoute role="admin"><ExitAdminDashboard /></ExitPrivateRoute>} />
                        <Route path="/exit/guard" element={<ExitPrivateRoute role="guard"><ExitGuardDashboard /></ExitPrivateRoute>} />

                        {/* Visiting System */}
                        <Route path="/visiting" element={<VisitorForm />} />
                        <Route path="/visiting/exit" element={<VisitorExit />} />
                        <Route path="/visiting/success" element={<VisitorSuccess />} />
                        <Route path="/visiting/admin" element={<VisitorAdminLogin />} />
                        <Route path="/visiting/admin/dashboard" element={<VisitorAdminDashboard />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
