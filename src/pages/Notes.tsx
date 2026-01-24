import React, { useState } from 'react';
import { User, Shield, GraduationCap } from 'lucide-react';
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
                // Simple hardcoded admin check as per original request, or redirect to /admin
                if (nationalId === '1245') navigate('/admin');
                else setError('كلمة المرور غير صحيحة');
                return;
            }

            const endpoint = role === 'student' ? '/api/student/login' : '/api/teacher/login';
            const res = await axios.post(endpoint, { national_id: nationalId });

            if (res.data.data) {
                // Store user info and redirect
                localStorage.setItem('user', JSON.stringify({ ...res.data.data, role }));
                if (role === 'teacher') navigate('/teacher-dashboard');
                else navigate('/student-dashboard');
            }
        } catch (err) {
            setError('رقم الهوية غير مسجل');
        }
    };

    if (!role) {
        return (
            <div className="py-16 animate-fade-in max-w-5xl mx-auto px-4 text-center">
                <div className="mb-16">
                    <h1 className="text-5xl font-black text-primary-dark mb-4">نظام الملاحظات والتواصل</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">بوابة التواصل الذكي بين الأسرة والمدرسة لمتابعة التميز والإنجاز</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Student Card */}
                    <button onClick={() => setRole('student')} className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <GraduationCap size={48} className="text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">دخول الطالب</h3>
                        <p className="text-gray-500 font-medium">الاطلاع على الملاحظات والنجوم</p>
                    </button>

                    {/* Teacher Card */}
                    <button onClick={() => setRole('teacher')} className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-dark"></div>
                        <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <User size={48} className="text-primary" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">دخول المعلم</h3>
                        <p className="text-gray-500 font-medium">إرسال الملاحظات والتقييمات</p>
                    </button>

                    {/* Admin Card */}
                    <button onClick={() => setRole('admin')} className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-700 to-black"></div>
                        <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={48} className="text-gray-700" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2">الإدارة المدرسية</h3>
                        <p className="text-gray-500 font-medium">التحكم والإشراف الكامل</p>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center py-12 animate-fade-in px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary to-primary-light"></div>

                <h2 className="text-3xl font-black text-center mb-8 text-primary-dark">
                    {role === 'student' ? 'تسجيل دخول الطالب' : role === 'teacher' ? 'تسجيل دخول المعلم' : 'دخول الإدارة'}
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            {role === 'admin' ? 'كلمة المرور' : 'رقم الهوية'}
                        </label>
                        <input
                            type={role === 'admin' ? "password" : "text"}
                            className="w-full p-4 border-2 border-gray-100 rounded-xl text-center text-xl font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder-gray-300"
                            placeholder={role === 'admin' ? "••••••" : "أدخل رقم الهوية هنا"}
                            value={nationalId}
                            onChange={(e) => setNationalId(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold flex items-center justify-center gap-2 animate-shake">
                            <Shield size={18} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn bg-primary hover:bg-primary-dark text-white w-full py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                        تسجيل الدخول
                    </button>

                    <button type="button" onClick={() => { setRole(null); setError(''); }} className="block w-full text-center text-gray-400 font-bold text-sm hover:text-primary transition-colors mt-6">
                        عودة للقائمة الرئيسية
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Notes;
