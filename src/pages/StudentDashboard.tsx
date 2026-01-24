import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageCircle, CheckCheck, GraduationCap, LogOut, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [notes, setNotes] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            if (u.role !== 'student') navigate('/notes');
            setUser(u);
            fetchNotes(u.id);
        } else {
            navigate('/notes');
        }
    }, []);

    const fetchNotes = async (id: number) => {
        try {
            const res = await axios.get(`/api/notes/student/${id}`);
            setNotes(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (noteId: number, isRead: number) => {
        if (isRead) return;
        try {
            await axios.post(`/api/notes/read/${noteId}`);
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, is_read: 1 } : n));
        } catch (err) { console.error(err); }
    };

    if (!user) return null;

    const starsCount = notes.filter(n => n.type === 'star').length;

    return (
        <div className="py-8 animate-fade-in max-w-5xl mx-auto px-4 min-h-screen">

            {/* Header Profile Section */}
            <div className="relative overflow-hidden mb-12 bg-white/80 backdrop-blur-xl border border-white shadow-premium rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10 group-hover:bg-primary-500/10 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/10 transition-colors"></div>

                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-600 to-indigo-700 text-white rounded-[2rem] shadow-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                            <GraduationCap size={48} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                    </div>
                    <div className="text-center md:text-right">
                        <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">{user.name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            <span className="bg-primary-50 text-primary-700 px-5 py-2 rounded-2xl text-lg font-black border border-primary-100 flex items-center gap-2">
                                {user.grade}
                            </span>
                            <span className="bg-slate-100 text-slate-700 px-5 py-2 rounded-2xl text-lg font-black border border-slate-200 flex items-center gap-2">
                                فصل: {user.class_name}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600 px-10 py-6 rounded-[2.5rem] shadow-xl shadow-amber-500/20 text-white transform hover:scale-105 transition-transform cursor-default">
                    <div className="flex items-center gap-3 text-5xl font-black mb-1 drop-shadow-md">
                        {starsCount} <Star fill="white" size={40} className="animate-pulse-slow" />
                    </div>
                    <p className="text-sm font-black opacity-90 tracking-widest uppercase">رصيد نجوم التميز</p>
                </div>

                <button
                    onClick={() => { localStorage.removeItem('user'); navigate('/notes'); }}
                    className="absolute top-6 left-6 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    title="تسجيل خروج"
                >
                    <LogOut size={24} />
                </button>
            </div>

            <div className="flex items-center justify-between mb-8 px-4">
                <h2 className="text-3xl font-black text-slate-800 flex items-center gap-4">
                    <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-lg">
                        <MessageCircle size={28} />
                    </div>
                    سجل الملاحظات والتقييمات
                </h2>
                <div className="text-slate-400 font-bold hidden md:block">
                    إجمالي الوارد: {notes.length} ملاحظة
                </div>
            </div>

            <div className="grid gap-6">
                {notes.length === 0 ? (
                    <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-[3rem] border-4 border-dashed border-slate-100 animate-pulse">
                        <div className="bg-slate-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
                            <MessageCircle size={64} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 text-2xl font-black">سجلك نظيف جداً! لا توجد ملاحظات مسجلة حالياً.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            onMouseEnter={() => markAsRead(note.id, note.is_read)}
                            className={`relative group bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-premium transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-2 cursor-default ${note.type === 'star' ? 'border-amber-400/30' : note.sentiment === 'positive' ? 'border-emerald-400/30' : 'border-red-400/30'}`}
                        >
                            {/* Accent Bar */}
                            <div className={`absolute top-10 right-0 w-2 h-16 rounded-l-full ${note.type === 'star' ? 'bg-amber-500 shadow-[4px_0_15px_rgba(245,158,11,0.5)]' : note.sentiment === 'positive' ? 'bg-emerald-500 shadow-[4px_0_15px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[4px_0_15px_rgba(239,68,68,0.5)]'}`}></div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pr-4">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:rotate-3 transition-transform ${note.type === 'star' ? 'bg-amber-100 text-amber-600' : note.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                        {note.type === 'star' ? <Star fill="currentColor" size={32} /> : (note.sentiment === 'positive' ? '👍' : '📝')}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-1 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{note.teacher_name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">معلم مادة {note.teacher_subject}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto self-stretch">
                                    <div className="flex items-center gap-2 text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-xl group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                        <Calendar size={16} />
                                        {new Date(note.created_at).toLocaleDateString('ar-SA')}
                                    </div>
                                    {note.is_read ? (
                                        <div className="flex items-center gap-2 text-primary-600 font-black text-xs bg-primary-50/50 px-4 py-2 rounded-full border border-primary-100/50">
                                            <CheckCheck size={16} /> تمت المعاينة
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-600 font-black text-xs bg-red-50 px-4 py-2 rounded-full border border-red-100 animate-bounce-slow">
                                            جديد !
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pr-4 md:pr-20">
                                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 text-xl text-slate-700 font-bold leading-relaxed shadow-inner">
                                    {note.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};

export default StudentDashboard;
