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
        <div className="exit-system-scope">
            <div className="flex-center min-h-screen relative bg-slate-50 px-6">
                {/* Official Header Settings */}
                <div className="absolute top-0 left-0 right-0 py-8 px-6 text-center text-sm font-bold text-slate-500 leading-relaxed border-b border-slate-100 bg-white/50 backdrop-blur-md z-10">
                    <div className="max-w-4xl mx-auto">
                        {headerSettings.header_line1 && <div className="uppercase tracking-widest text-[10px] mb-1">{headerSettings.header_line1}</div>}
                        {headerSettings.header_line2 && <div className="text-primary font-black">{headerSettings.header_line2}</div>}
                        {headerSettings.header_line3 && <div>{headerSettings.header_line3}</div>}
                        {headerSettings.header_line4 && <div className="mt-2 text-slate-800 text-lg font-black">{headerSettings.header_line4}</div>}
                    </div>
                </div>

                <div className="glass-panel animate-fade-in w-full max-w-md bg-white border border-slate-100 shadow-2xl shadow-primary/5 p-12">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner">
                            <Lock size={36} className="text-primary" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">تسجيل الدخول</h2>
                        <p className="text-slate-400 font-bold mt-2">نظام إدارة الخروج والزيارات</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div className="relative group">
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                <User size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder="اسم المستخدم"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="pr-14 py-4 text-lg font-bold"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                <Lock size={24} />
                            </div>
                            <input
                                type="password"
                                placeholder="كلمة المرور"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-14 py-4 text-lg font-bold"
                            />
                        </div>

                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-center font-black text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary py-4 text-xl shadow-xl shadow-primary/20">
                            دخول النظام
                        </button>

                        <button type="button" onClick={() => navigate('/')} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors mt-2">
                            ← العودة للرئيسية
                        </button>
                    </form>
                </div>

                {/* Premium Footer */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                    <div className="inline-flex items-center gap-4 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نظام الأجاويد v4.0.0</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span className="text-[10px] font-bold text-slate-400">© 2026 م. ماجد عثمان الزهراني</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
