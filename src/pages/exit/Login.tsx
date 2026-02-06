import '../../assets/styles/exit.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [headerSettings, setHeaderSettings] = useState<any>({});
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/exit/settings');
                setHeaderSettings(res.data);
            } catch (err) { console.error(err); }
        };
        fetchSettings();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/exit/login', { username, password });
            const { token, role } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (role === 'admin') navigate('/exit/admin');
            else if (role === 'guard') navigate('/exit/guard');
            else setError('دور غير معروف');
        } catch (err) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', position: 'relative' }}>
            {/* Header Settings Display */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem', textAlign: 'center', fontSize: '0.9rem', lineHeight: '1.6', color: '#4b5563', zIndex: 10 }}>
                {headerSettings.header_line1 && <div>{headerSettings.header_line1}</div>}
                {headerSettings.header_line2 && <div>{headerSettings.header_line2}</div>}
                {headerSettings.header_line3 && <div>{headerSettings.header_line3}</div>}
                {headerSettings.header_line4 && <div style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{headerSettings.header_line4}</div>}
            </div>

            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>تسجيل الدخول</h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={20} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="text"
                            placeholder="اسم المستخدم"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ paddingRight: '40px' }}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                        <input
                            type="password"
                            placeholder="كلمة المرور"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ paddingRight: '40px' }}
                        />
                    </div>

                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" className="btn btn-primary">
                        دخول
                    </button>
                </form>
            </div>

            {/* Footer Copyright */}
            <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
                حقوق الملكية الفكرية والبرمجية محفوظة لـ ماجد عثمان الزهراني
            </div>
        </div>
    );
}
