import { useEffect, useState } from 'react';
import axios from 'axios';
import { LogOut, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GuardDashboard() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const navigate = useNavigate();

    const fetchPermissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/permissions?date=', { // Default today
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPermissions();
        const interval = setInterval(fetchPermissions, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const confirmExit = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من خروج الطالب؟')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/permissions/${id}/confirm`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPermissions();
        } catch (err) {
            alert('خطأ في التأكيد');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>نظام الاستئذان - بوابة الأمن</h1>
                <button onClick={handleLogout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                    <LogOut size={18} /> تسجيل خروج
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {permissions.map(p => {
                    const isConfirmed = p.status === 'confirmed';
                    return (
                        <div
                            key={p.id}
                            className="glass-panel animate-fade-in"
                            style={{
                                background: isConfirmed ? '#f3f4f6' : 'linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)',
                                border: isConfirmed ? '1px solid #e5e7eb' : '1px solid #818cf8',
                                boxShadow: isConfirmed ? 'none' : '0 10px 25px -5px rgba(79, 70, 229, 0.2)',
                                opacity: isConfirmed ? 0.7 : 1,
                                transform: isConfirmed ? 'scale(0.98)' : 'scale(1)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', margin: 0, color: isConfirmed ? '#6b7280' : 'var(--primary-color)' }}>
                                    {p.student_name}
                                </h2>
                                <span style={{
                                    fontSize: '0.8rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '999px',
                                    background: isConfirmed ? '#e5e7eb' : '#d1fae5',
                                    color: isConfirmed ? '#374151' : '#065f46'
                                }}>
                                    {isConfirmed ? 'تم الخروج' : 'مصرح بالخروج'}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1rem', color: '#4b5563', lineHeight: '1.6' }}>
                                <div><strong>الصف/الفصل:</strong> {p.grade} - {p.class_name}</div>
                                <div><strong>السبب:</strong> {p.reason}</div>
                                <div><strong>المستلم:</strong> {p.departure_with}</div>
                                <div><strong>المسؤول:</strong> {p.officer_name}</div>
                            </div>

                            {!isConfirmed ? (
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', background: 'var(--success)' }}
                                    onClick={() => confirmExit(p.id)}
                                >
                                    <CheckCircle size={20} /> تأكيد الخروج
                                </button>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} /> وقت الخروج: {new Date(p.exit_time).toLocaleTimeString('ar-SA')}
                                </div>
                            )}
                        </div>
                    );
                })}
                {permissions.length === 0 && (
                    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '3rem', color: '#6b7280' }}>
                        لا يوجد طلبات استئذان لهذا اليوم
                    </div>
                )}
            </div>
        </div>
    );
}
