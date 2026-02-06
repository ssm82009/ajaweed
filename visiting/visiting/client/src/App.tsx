// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisitorForm from './components/VisitorForm';
import ExitScanner from './components/ExitScanner';
import SuccessPage from './components/SuccessPage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<VisitorForm />} />
          <Route path="/exit" element={<ExitScanner />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
