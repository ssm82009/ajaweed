import React, { useState } from 'react';
import { User, Shield, GraduationCap, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Notes = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState<'student' | 'teacher' | 'admin' | null>(null);
    const [nationalId, setNationalId] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            if (role === 'admin') {
                if (nationalId === '1245') navigate('/admin');
                else setError('كلمة المرور غير صحيحة');
                return;
            }

            const endpoint = role === 'student' ? '/api/student/login' : '/api/teacher/login';
            const res = await axios.post(endpoint, { national_id: nationalId });

            if (res.data.data) {
                localStorage.setItem('user', JSON.stringify({ ...res.data.data, role }));
                if (role === 'teacher') navigate('/teacher-dashboard');
                else navigate('/student-dashboard');
            }
        } catch (err) {
            setError('رقم الهوية غير مسجل في النظام');
        }
    };

    if (!role) {
        return (
            <div className="py-20 animate-fade-in max-w-6xl mx-auto px-4 text-center">
                <div className="mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-50 text-primary-600 border border-primary-100 font-black text-sm shadow-sm">
                        <Lock size={16} /> بوابة الوصول الآمن
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none">
                        نظام <span className="text-gradient">التواصل</span> الذكي
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed h-auto">
                        بوابة التواصل الفعال بين الأسرة والمدرسة لمتابعة مسيرة التميز والإنجاز.
                        <span className="block text-primary-600/70 mt-3">يرجى اختيار نوع الحساب للمتابعة</span>
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {/* Student Card */}
                    <button onClick={() => setRole('student')} className="group relative bg-white/70 backdrop-blur-md rounded-[3rem] p-10 shadow-premium hover:shadow-2xl transition-all duration-500 border border-white hover:-translate-y-4 overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
                        <div className="bg-blue-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-blue-500/10">
                            <GraduationCap size={56} className="text-blue-600" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">دخول الطالب</h3>
                        <p className="text-slate-500 font-bold mb-8 leading-relaxed">الاطلاع على الملاحظات، استلام النجوم، ومتابعة التقييمات الشخصية</p>
                        <div className="mt-auto px-8 py-3 bg-blue-50 text-blue-700 font-black rounded-2xl flex items-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            اختر هذا الحساب <ChevronRight size={18} />
                        </div>
                    </button>

                    {/* Teacher Card */}
                    <button onClick={() => setRole('teacher')} className="group relative bg-white/70 backdrop-blur-md rounded-[3rem] p-10 shadow-premium hover:shadow-2xl transition-all duration-500 border border-white hover:-translate-y-4 overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-600 to-primary-800"></div>
                        <div className="bg-primary-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-xl shadow-primary-500/10">
                            <User size={56} className="text-primary-600" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-primary-600 transition-colors">دخول المعلم</h3>
                        <p className="text-slate-500 font-bold mb-8 leading-relaxed">إرسال الملاحظات اليومية، منح نجوم التميز، والتواصل مع أولياء الأمور</p>
                        <div className="mt-auto px-8 py-3 bg-primary-50 text-primary-700 font-black rounded-2xl flex items-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-all">
                            اختر هذا الحساب <ChevronRight size={18} />
                        </div>
                    </button>

                    {/* Admin Card */}
                    <button onClick={() => setRole('admin')} className="group relative bg-white/70 backdrop-blur-md rounded-[3rem] p-10 shadow-premium hover:shadow-2xl transition-all duration-500 border border-white hover:-translate-y-4 overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-slate-700 to-slate-900"></div>
                        <div className="bg-slate-100 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-all duration-500 shadow-xl">
                            <Shield size={56} className="text-slate-800" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-4 group-hover:text-slate-900 transition-colors">الإدارة المدرسية</h3>
                        <p className="text-slate-500 font-bold mb-8 leading-relaxed">التحكم في بيانات الطلاب والمعلمين، إدارة لوحة الشرف، والمراقبة العامة</p>
                        <div className="mt-auto px-8 py-3 bg-slate-100 text-slate-800 font-black rounded-2xl flex items-center gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            دخول المشرف <ChevronRight size={18} />
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 animate-fade-in px-4">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-premium p-12 w-full max-w-xl border border-white relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-primary-600 to-indigo-600 shadow-lg"></div>

                <div className="text-center mb-12">
                    <div className="inline-block p-5 bg-primary-50 rounded-[2rem] text-primary-600 mb-6 shadow-inner ring-8 ring-primary-50/50">
                        {role === 'student' ? <GraduationCap size={48} /> : role === 'teacher' ? <User size={48} /> : <Shield size={48} />}
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        {role === 'student' ? 'دخول الطالب' : role === 'teacher' ? 'دخول المعلم' : 'دخول الإدارة'}
                    </h2>
                    <p className="text-slate-500 font-bold mt-2">يرجى إدخال البيانات المعتمدة في النظام</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-3">
                        <label className="block text-slate-700 font-black text-lg mr-2">
                            {role === 'admin' ? 'كلمة مرور المشرف' : 'رقم الهوية الوطنية'}
                        </label>
                        <div className="relative group">
                            <input
                                type={role === 'admin' ? "password" : "text"}
                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-center text-3xl font-black focus:bg-white focus:border-primary-500 focus:ring-8 focus:ring-primary-500/5 outline-none transition-all tracking-widest placeholder:text-slate-200"
                                placeholder={role === 'admin' ? "••••••" : "0000000000"}
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-5 bg-red-50 text-red-600 rounded-[1.5rem] border-2 border-red-100 text-center font-black flex items-center justify-center gap-3 animate-shake">
                            <Shield size={24} className="animate-pulse" />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full py-6 text-2xl rounded-[1.8rem] shadow-2xl flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98]">
                        <span className="flex-1">دخول النظام</span>
                        <div className="bg-white/20 p-2 rounded-xl"><ChevronRight size={24} /></div>
                    </button>

                    <button type="button" onClick={() => { setRole(null); setError(''); }} className="block w-full text-center text-slate-400 font-bold text-lg hover:text-red-500 transition-all mt-8 group">
                        <span className="group-hover:tracking-wider transition-all">← العودة لاختيار الحساب</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Notes;
