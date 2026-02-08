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
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                setError('رقم الهوية غير مسجل في النظام');
            } else {
                setError('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً');
                console.error('Login error:', err);
            }
        }
    };

    if (!role) {
        return (
            <div className="py-24 animate-entrance max-w-6xl mx-auto px-6 text-center">
                <div className="mb-24 space-y-8">
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 text-primary border border-blue-100 font-black text-sm shadow-sm">
                        <Lock size={16} /> بوابة الوصول الآمن للمستخدمين
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
                        نظام <span className="text-royal">التواصل</span> الذكي
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed h-auto opacity-80">
                        بوابة التواصل الفعال بين الأسرة والمدرسة لمتابعة مسيرة التميز والإنجاز.
                        <span className="block text-primary/60 mt-4 font-black">يرجى اختيار نوع الحساب للمتابعة</span>
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {/* Student Card */}
                    <button onClick={() => setRole('student')} className="school-card group p-12 hover:-translate-y-4 transition-all duration-500 flex flex-col items-center border-none shadow-2xl shadow-primary/5">
                        <div className="w-28 h-28 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-blue-100 shadow-xl shadow-blue-500/10">
                            <GraduationCap size={56} className="text-primary" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors">دخول الطالب</h3>
                        <p className="text-slate-500 font-bold mb-10 leading-relaxed opacity-80">الاطلاع على الملاحظات، استلام النجوم، ومتابعة التقييمات الشخصية</p>
                        <div className="mt-auto w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                            اختر هذا الحساب <ChevronRight size={20} className="group-hover:-translate-x-2 transition-transform" />
                        </div>
                    </button>

                    {/* Teacher Card */}
                    <button onClick={() => setRole('teacher')} className="school-card group p-12 hover:-translate-y-4 transition-all duration-500 flex flex-col items-center border-none shadow-2xl shadow-primary/5">
                        <div className="w-28 h-28 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 border border-emerald-100 shadow-xl shadow-emerald-500/10">
                            <User size={56} className="text-emerald-600" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 group-hover:text-emerald-600 transition-colors">دخول المعلم</h3>
                        <p className="text-slate-500 font-bold mb-10 leading-relaxed opacity-80">إرسال الملاحظات اليومية، منح نجوم التميز، والتواصل مع أولياء الأمور</p>
                        <div className="mt-auto w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                            اختر هذا الحساب <ChevronRight size={20} className="group-hover:-translate-x-2 transition-transform" />
                        </div>
                    </button>

                    {/* Admin Card */}
                    <button onClick={() => setRole('admin')} className="school-card group p-12 hover:-translate-y-4 transition-all duration-500 flex flex-col items-center border-none shadow-2xl shadow-primary/5">
                        <div className="w-28 h-28 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-all duration-500 border border-rose-100 shadow-xl shadow-rose-500/10">
                            <Shield size={56} className="text-rose-600" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 group-hover:text-rose-600 transition-colors">الإدارة المدرسية</h3>
                        <p className="text-slate-500 font-bold mb-10 leading-relaxed opacity-80">التحكم في بيانات الطلاب والمعلمين، إدارة لوحة الشرف، والمراقبة العامة</p>
                        <div className="mt-auto w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                            دخول المشرف <ChevronRight size={20} className="group-hover:-translate-x-2 transition-transform" />
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-20 animate-entrance px-6">
            <div className="school-card p-14 w-full max-w-2xl border-none shadow-[0_32px_64px_-16px_rgba(30,58,138,0.1)] relative overflow-hidden group bg-white">
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-primary to-secondary shadow-lg"></div>

                <div className="text-center mb-14">
                    <div className="inline-block p-6 bg-blue-50/50 rounded-[2.5rem] text-primary mb-8 shadow-inner ring-12 ring-blue-50/30 group-hover:scale-110 transition-transform duration-500">
                        {role === 'student' ? <GraduationCap size={56} /> : role === 'teacher' ? <User size={56} /> : <Shield size={56} />}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {role === 'student' ? 'دخول الطالب' : role === 'teacher' ? 'دخول المعلم' : 'دخول الإدارة'}
                    </h2>
                    <p className="text-slate-400 font-bold text-lg">يرجى إدخال البيانات المعتمدة للوصول للنظام</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-10">
                    <div className="space-y-4">
                        <label className="block text-slate-400 font-black text-xs uppercase tracking-[0.2em] mr-4 text-right">
                            {role === 'admin' ? 'كلمة مرور المشرف' : 'رقم الهوية الوطنية'}
                        </label>
                        <div className="relative">
                            <input
                                type={role === 'admin' ? "password" : "text"}
                                className="w-full p-8 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] text-center text-4xl font-black focus:bg-white focus:shadow-2xl focus:shadow-primary/5 outline-none transition-all tracking-[0.1em] placeholder:text-slate-200"
                                placeholder={role === 'admin' ? "••••••" : "0000000000"}
                                value={nationalId}
                                onChange={(e) => setNationalId(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-6 bg-rose-50 text-rose-600 rounded-[1.75rem] border-2 border-rose-100 text-center font-black flex items-center justify-center gap-4 animate-shake">
                            <Shield size={28} className="animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <button type="submit" className="btn-school w-full py-6 text-2xl shadow-3xl hover:shadow-primary/40 group">
                            <span className="flex-1">دخول النظام</span>
                            <div className="bg-white/20 p-2.5 rounded-xl group-hover:-translate-x-1 transition-transform"><ChevronRight size={24} /></div>
                        </button>

                        <button type="button" onClick={() => { setRole(null); setError(''); }} className="block w-full text-center text-slate-400 font-bold text-lg hover:text-rose-500 transition-all group">
                            <span className="group-hover:tracking-wider transition-all">← العودة لاختيار الحساب</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Notes;
