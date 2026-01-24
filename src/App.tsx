import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import HonorBoard from './pages/HonorBoard';
import Notes from './pages/Notes';
import Attendance from './pages/Attendance';
import Admin from './pages/Admin';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

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
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
