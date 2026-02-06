import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewRequest from './admin/NewRequest';
import Reports from './admin/Reports';
import Settings from './admin/Settings';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('new');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <div className="container">
            <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>نظام الاستئذان - لوحة التحكم</h1>
                <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                    <LogOut size={18} /> تسجيل خروج
                </button>
            </header>

            <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'new' ? 'btn-primary' : ''}`}
                    style={activeTab !== 'new' ? { background: 'white' } : {}}
                    onClick={() => setActiveTab('new')}
                >
                    طلب استئذان جديد
                </button>
                <button
                    className={`btn ${activeTab === 'reports' ? 'btn-primary' : ''}`}
                    style={activeTab !== 'reports' ? { background: 'white' } : {}}
                    onClick={() => setActiveTab('reports')}
                >
                    طباعة التقرير
                </button>
                <button
                    className={`btn ${activeTab === 'settings' ? 'btn-primary' : ''}`}
                    style={activeTab !== 'settings' ? { background: 'white' } : {}}
                    onClick={() => setActiveTab('settings')}
                >
                    الإعدادات
                </button>
            </div>

            <div className="content">
                {activeTab === 'new' && <NewRequest />}
                {activeTab === 'reports' && <Reports />}
                {activeTab === 'settings' && <Settings />}
            </div>
        </div>
    );
}
