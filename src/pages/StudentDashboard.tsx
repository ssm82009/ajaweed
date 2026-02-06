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
    }, [navigate]);

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
        <div className="py-16 animate-entrance max-w-6xl mx-auto px-6 min-h-screen">

            {/* Header Profile Section */}
            <div className="school-card relative overflow-hidden mb-16 p-12 bg-white/90 backdrop-blur-xl border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-all duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] -z-10 group-hover:bg-secondary/10 transition-all duration-1000"></div>
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="relative">
                            <div className="w-28 h-28 bg-primary text-white rounded-[2.5rem] shadow-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform ring-8 ring-primary/5">
                                <GraduationCap size={56} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-10 h-10 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
                        </div>
                        <div className="text-center md:text-right space-y-4">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">{user.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="bg-primary/5 text-primary px-6 py-2.5 rounded-2xl text-xl font-black border border-primary/10 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary mb-0.5"></div>
                                    {user.grade}
                                </div>
                                <div className="bg-slate-50 text-slate-500 px-6 py-2.5 rounded-2xl text-xl font-black border border-slate-100 flex items-center gap-2 italic">
                                    فصل {user.class_name}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-white border-2 border-amber-100 px-12 py-8 rounded-[3rem] shadow-2xl shadow-amber-500/5 group/stars hover:border-amber-400 transition-all duration-500">
                        <div className="flex items-center gap-4 text-6xl font-black text-amber-500 mb-2 drop-shadow-sm group-hover/stars:scale-110 transition-transform">
                            {starsCount} <Star fill="currentColor" size={48} className="animate-bounce-slow" />
                        </div>
                        <p className="text-xs font-black text-slate-400 tracking-[0.2em] uppercase">رصيد نجوم التميز</p>
                    </div>
                </div>

                <button
                    onClick={() => { localStorage.removeItem('user'); navigate('/notes'); }}
                    className="absolute top-8 left-8 p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                    title="خروج آمن من النظام"
                >
                    <LogOut size={28} />
                </button>
            </div>

            <div className="flex items-center justify-between mb-12 px-2">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                        <MessageCircle size={32} />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">سجل المتابعة</h2>
                        <p className="text-slate-400 font-bold text-lg">آخر الملاحظات والتقييمات الواردة من المعلمين</p>
                    </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                    <div className="text-3xl font-black text-slate-800">{notes.length}</div>
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">إجمالي السجلات</div>
                </div>
            </div>

            <div className="grid gap-8">
                {notes.length === 0 ? (
                    <div className="text-center py-40 school-card bg-white/50 border-4 border-dashed border-slate-100/50">
                        <div className="bg-white w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary/5 border border-slate-100">
                            <MessageCircle size={64} className="text-slate-200" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">السجل خالي تماماً</h3>
                        <p className="text-slate-400 text-xl font-bold">لم يتم رصد أي ملاحظات في ملفك حتى هذه اللحظة</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            onMouseEnter={() => markAsRead(note.id, note.is_read)}
                            className="school-card p-0 relative group bg-white hover:-translate-y-2 transition-all duration-500 border-none shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 h-full w-2.5 ${note.type === 'star' ? 'bg-amber-400' : note.sentiment === 'positive' ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>

                            <div className="p-10 flex flex-col md:flex-row gap-10">
                                <div className="shrink-0 flex md:flex-col items-center gap-6 border-l md:border-l-0 md:border-b-2 border-slate-50 md:pb-8 md:pr-0 pb-0 pr-8">
                                    <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-4xl shadow-2xl transition-all group-hover:rotate-6 ${note.type === 'star' ? 'bg-amber-50 text-amber-500 shadow-amber-500/10' : note.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-500 shadow-emerald-500/10' : 'bg-rose-50 text-rose-500 shadow-rose-500/10'}`}>
                                        {note.type === 'star' ? <Star fill="currentColor" size={40} /> : (note.sentiment === 'positive' ? '👍' : '📝')}
                                    </div>
                                    <div className="md:text-center space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">التصنيف الرسمي</div>
                                        <div className={`text-xs font-black px-4 py-1.5 rounded-xl border ${note.type === 'star' ? 'bg-amber-50 text-amber-600 border-amber-100' : note.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                            {note.type === 'star' ? 'وسام تميز' : note.sentiment === 'positive' ? 'سلوك إيجابي' : 'توصية تطوير'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">{note.teacher_name}</h3>
                                            <div className="text-primary font-bold text-lg flex items-center gap-2 italic">
                                                معلم مادة {note.teacher_subject}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 flex-wrap">
                                            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl flex items-center gap-3 text-slate-400 font-bold text-sm border border-slate-100">
                                                <Calendar size={18} className="opacity-40" />
                                                {new Date(note.created_at).toLocaleDateString('ar-SA')}
                                            </div>
                                            {note.is_read ? (
                                                <div className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-2xl font-black text-[10px] flex items-center gap-2 border border-emerald-100 uppercase tracking-widest">
                                                    <CheckCheck size={16} /> تمت القراءة
                                                </div>
                                            ) : (
                                                <div className="bg-amber-100 text-amber-700 px-5 py-2.5 rounded-2xl font-black text-[10px] flex items-center gap-2 border border-amber-200 animate-pulse uppercase tracking-widest">
                                                    جديد !
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border-2 border-white shadow-inner relative group/note">
                                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center border border-slate-50 italic text-slate-200 font-black text-2xl">"</div>
                                        <p className="text-2xl text-slate-700 font-bold leading-relaxed pr-6">{note.content}</p>
                                    </div>
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
