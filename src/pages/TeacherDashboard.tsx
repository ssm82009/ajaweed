import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Star, User, BookOpen, LogOut, Printer, Users, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    // Form State
    const [noteType, setNoteType] = useState<'positive' | 'negative'>('positive');
    const [content, setContent] = useState('');
    const [isStar, setIsStar] = useState(false);
    const [sending, setSending] = useState(false);

    // Tabs & History
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
    const [sentNotes, setSentNotes] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            if (u.role !== 'teacher') navigate('/notes');
            setUser(u);
        } else {
            navigate('/notes');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`/api/notes/teacher/${user.id}`);
                setSentNotes(res.data.data);
            } catch (err) { console.error(err); }
        };
        if (activeTab === 'history' && user) {
            fetchHistory();
        }
    }, [activeTab, user]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.get(`/api/students?query=${searchTerm}`);
            setStudents(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async () => {
        if (!content && !isStar) return;
        setSending(true);
        try {
            await axios.post('/api/notes', {
                student_id: selectedStudent.id,
                teacher_id: user.id,
                sender_type: 'teacher',
                type: isStar ? 'star' : 'note',
                sentiment: noteType,
                content: content || (isStar ? 'منح نجمة تميز' : '')
            });
            alert('تم الإرسال بنجاح');
            setContent('');
            setIsStar(false);
            setSelectedStudent(null);
            // Re-fetch history if needed or just switch back
        } catch (err) {
            alert('فشل الإرسال');
        } finally {
            setSending(false);
        }
    };

    if (!user) return null;

    return (
        <div className="py-12 animate-entrance max-w-7xl mx-auto px-6 min-h-screen">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-16 school-card p-10 bg-white/90 backdrop-blur-xl border-none shadow-[0_32px_64px_-16px_rgba(30,58,138,0.1)]">
                <div className="flex items-center gap-6 mb-6 md:mb-0">
                    <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 ring-8 ring-primary/5">
                        <User size={40} />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">أهلاً بك، {user.name}</h1>
                        <div className="flex items-center gap-3 text-primary font-black text-lg bg-primary/5 px-4 py-1.5 rounded-xl border border-primary/10">
                            <BookOpen size={20} /> معلم مادة {user.subject}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { localStorage.removeItem('user'); navigate('/notes'); }}
                        className="btn-school-outline border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                    >
                        <LogOut size={20} />
                        خروج آمن
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-6 mb-12 justify-center">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-3 shadow-xl ${activeTab === 'new' ? 'btn-school scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <Send size={24} /> محرر الملاحظات
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-3 shadow-xl ${activeTab === 'history' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <BookOpen size={24} /> سجل الصادر
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="grid lg:grid-cols-12 gap-10 items-start">
                    {/* Student List Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8">
                        <div className="school-card p-8 bg-white border-none shadow-2xl shadow-primary/5 h-[700px] flex flex-col">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-50 rounded-[1.25rem] text-primary border border-blue-100 shadow-sm"><Users size={28} /></div>
                                <h3 className="font-black text-2xl text-slate-900 tracking-tight">اختيار الطالب</h3>
                            </div>

                            <form onSubmit={handleSearch} className="space-y-4 mb-8">
                                <div className="relative group">
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                                        <Search size={22} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pr-14 pl-4 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-[1.75rem] focus:bg-white focus:border-primary outline-none transition-all font-black text-lg placeholder:text-slate-200"
                                        placeholder="بحث بالاسم..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn-school-outline w-full py-4 rounded-2xl border-primary/20 text-primary hover:bg-primary/5">تحديث القائمة</button>
                            </form>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                                {students.length === 0 ? (
                                    <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 italic">
                                        <div className="text-5xl mb-4 opacity-10 font-bold">Search Students</div>
                                        <p className="text-slate-400 font-bold px-6">استخدم شريط البحث بالأعلى للوصول لبيانات الطلاب</p>
                                    </div>
                                ) : students.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudent(s)}
                                        className={`w-full text-right p-6 rounded-[1.75rem] transition-all border-2 flex flex-col gap-2 group ${selectedStudent?.id === s.id ? 'bg-primary-50 border-primary shadow-xl shadow-primary/10 scale-[1.02]' : 'bg-white border-slate-50 hover:border-primary/20 hover:bg-slate-50'}`}
                                    >
                                        <div className="font-black text-slate-800 text-xl group-hover:text-primary transition-colors">{s.name}</div>
                                        <div className="flex justify-between items-center opacity-80">
                                            <span className="text-sm font-bold text-slate-400">{s.grade}</span>
                                            <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-lg border ${selectedStudent?.id === s.id ? 'bg-white text-primary border-primary/20' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>{s.class_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Note Sending Form */}
                    <div className="lg:col-span-8">
                        {selectedStudent ? (
                            <div className="school-card p-12 bg-white/90 backdrop-blur-xl border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] h-full relative overflow-hidden">
                                <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-primary to-secondary"></div>

                                <div className="flex items-center gap-6 mb-12 pb-8 border-b-2 border-slate-50">
                                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary font-black text-3xl shadow-inner border border-primary/5">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-slate-400 font-black text-sm uppercase tracking-widest">تحرير رسالة للطالب:</div>
                                        <div className="text-4xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <button onClick={() => { setNoteType('positive'); setIsStar(false); }} className={`p-8 rounded-[2.5rem] border-4 font-black transition-all flex flex-col items-center gap-4 group ${noteType === 'positive' && !isStar ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xl shadow-emerald-500/10 scale-105' : 'bg-slate-50/50 border-white text-slate-300 hover:border-slate-200 hover:text-slate-400'}`}>
                                        <div className="text-5xl group-hover:scale-110 transition-transform">✅</div>
                                        <span className="text-lg">ملاحظة إيجابية</span>
                                    </button>
                                    <button onClick={() => { setNoteType('negative'); setIsStar(false); }} className={`p-8 rounded-[2.5rem] border-4 font-black transition-all flex flex-col items-center gap-4 group ${noteType === 'negative' && !isStar ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xl shadow-rose-500/10 scale-105' : 'bg-slate-50/50 border-white text-slate-300 hover:border-slate-200 hover:text-slate-400'}`}>
                                        <div className="text-5xl group-hover:scale-110 transition-transform">⚠️</div>
                                        <span className="text-lg">ملاحظة للتطوير</span>
                                    </button>
                                    <button onClick={() => { setIsStar(true); }} className={`p-8 rounded-[2.5rem] border-4 font-black transition-all flex flex-col items-center gap-4 group ${isStar ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xl shadow-amber-500/10 scale-105' : 'bg-slate-50/50 border-white text-slate-300 hover:border-slate-200 hover:text-slate-400'}`}>
                                        <div className="text-5xl group-hover:scale-110 transition-transform">🌟</div>
                                        <span className="text-lg">نجمة تميز</span>
                                    </button>
                                </div>

                                {!isStar ? (
                                    <div className="relative mb-12 group">
                                        <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                        <div className="relative">
                                            <textarea
                                                className="w-full h-64 p-10 bg-slate-50/50 border-4 border-white rounded-[2.5rem] resize-none focus:bg-white focus:border-primary/20 outline-none text-2xl font-bold transition-all shadow-inner leading-relaxed placeholder:text-slate-200"
                                                placeholder="صف باختصار سلوك أو إنجاز الطالب هنا..."
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            ></textarea>
                                            <div className="absolute bottom-8 left-10 text-slate-400 font-black text-sm bg-white/80 px-4 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                {content.length} حرف تم تدوينه
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-12 py-20 bg-amber-50/30 rounded-[3rem] border-4 border-dashed border-amber-200 text-center relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-200/20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full"></div>
                                        <div className="relative animate-entrance">
                                            <Star size={100} className="mx-auto mb-8 text-amber-500 fill-amber-500 drop-shadow-[0_10px_10px_rgba(245,158,11,0.3)] group-hover:rotate-12 transition-transform duration-700" />
                                            <h4 className="text-3xl font-black text-amber-900 mb-2 tracking-tight">منح وسام التميز</h4>
                                            <p className="text-amber-700/70 font-bold text-xl px-12 leading-relaxed">سيتم توثيق هذه النجمة في ملف الطالب الرسمي المتاح لولي الأمر</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-6 pt-10 border-t-2 border-slate-50">
                                    <div className="hidden md:flex items-center gap-4 text-slate-400 font-bold text-lg bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 italic">
                                        <BookOpen size={24} className="opacity-40" /> رصد إداري لمادة: {user.subject}
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || (!content && !isStar)}
                                        className="btn-school flex-1 md:flex-none px-16 py-6 text-2xl shadow-3xl shadow-primary/30 group active:scale-95"
                                    >
                                        {sending ? (
                                            <div className="flex items-center gap-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent shadow-md"></div>
                                                جاري الأرشفة...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <Send size={28} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                                                اعتماد الإرسال
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[750px] flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-white/30 backdrop-blur-sm group hover:border-primary/20 transition-colors">
                                <div className="p-12 bg-white rounded-[3rem] shadow-xl border border-slate-50 mb-8 transform group-hover:scale-110 transition-transform duration-700">
                                    <Users size={100} className="text-slate-100" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-400 tracking-tight">حدد أحد الطلاب للمتابعة</h3>
                                <p className="text-slate-300 font-bold mt-4 text-lg">يمكنك استخدام القائمة الجانبية للبحث عن طالب محدد بالاسم</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* History Tab View */
                <div className="animate-entrance bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border-none p-12 min-h-[600px] relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-16 pb-12 border-b-2 border-slate-50">
                        <div className="space-y-3">
                            <h2 className="text-5xl font-black text-slate-900 tracking-tight">سجل الصادر التعليمي</h2>
                            <p className="text-slate-400 text-xl font-bold">الأرشيف الكامل لكافة الملاحظات والنجوم التي تم منحها للطلاب</p>
                        </div>
                        <div className="bg-indigo-600 text-white px-10 py-6 rounded-[2rem] font-black shadow-3xl shadow-indigo-600/30 text-3xl border-4 border-indigo-400/30">
                            {sentNotes.length} <span className="text-sm opacity-80 uppercase tracking-widest mr-2">إجمالي المراسلات</span>
                        </div>
                    </div>

                    {sentNotes.length === 0 ? (
                        <div className="text-center py-40 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100">
                            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-slate-100 opacity-20">
                                <BookOpen size={64} />
                            </div>
                            <p className="text-slate-400 text-2xl font-black">لا يوجد أرشيف مراسلات حالياً</p>
                        </div>
                    ) : (
                        <div className="space-y-12 pr-4 custom-scrollbar">
                            {Object.entries(sentNotes.reduce((acc: any, note) => {
                                if (!acc[note.student_name]) acc[note.student_name] = [];
                                acc[note.student_name].push(note);
                                return acc;
                            }, {})).map(([studentName, notes]: [string, any]) => (
                                <div key={studentName} className="school-card p-0 bg-white border-none shadow-2xl shadow-indigo-500/5 group/card overflow-hidden">
                                    <div className="bg-slate-50 px-10 py-8 flex justify-between items-center flex-wrap gap-8 border-b border-slate-100">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-indigo-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-600/20 group-hover/card:scale-110 transition-transform">
                                                {studentName.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-3xl font-black text-slate-900 tracking-tight">{studentName}</span>
                                                <div className="text-sm font-bold text-slate-400 px-4 py-1 bg-white border rounded-full text-center">أرشيف يضم {notes.length} سجلات</div>
                                            </div>
                                        </div>
                                        <button onClick={() => {
                                            const printContent = document.getElementById(`print-${studentName}`)?.innerHTML;
                                            const win = window.open('', '', 'height=700,width=900');
                                            win?.document.write(`<html><head><title>تقرير الطالب ${studentName}</title><style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap'); body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; } .no-print { display: none; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 15px; text-align: right; } th { background-color: #f8fafc; color: #1e293b; font-weight: 900; } h1 { color: #1e3a8a; text-align: center; margin-bottom: 20px; font-weight: 900; } .student-info { margin-bottom: 30px; font-weight: bold; border-right: 4px solid #1e3a8a; padding-right: 15px; }</style></head><body><h1>تقرير المتابعة اليومية للأجاويد</h1><div class="student-info">اسم الطالب: ${studentName}<br>المعلم المصدر: ${user.name} | مادة: ${user.subject}</div>${printContent}</body></html>`);
                                            win?.document.close();
                                            win?.print();
                                        }} className="btn-school-outline border-slate-200 text-slate-600 bg-white hover:bg-slate-50 px-10 py-5 rounded-2xl shadow-sm">
                                            <Printer size={20} /> تصدير التقرير PDF
                                        </button>
                                    </div>
                                    <div id={`print-${studentName}`} className="overflow-x-auto">
                                        <table className="w-full text-right border-collapse">
                                            <thead className="bg-slate-50/30 text-slate-400 font-black text-sm uppercase tracking-widest border-b border-slate-50 h-20">
                                                <tr>
                                                    <th className="px-10">تصنيف الملاحظة</th>
                                                    <th className="px-10">محتوى الإرسال</th>
                                                    <th className="px-10">وقت الرصد</th>
                                                    <th className="px-10 no-print">الحالة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-slate-50">
                                                {notes.map((note: any) => (
                                                    <tr key={note.id} className="hover:bg-indigo-50/30 transition-all h-24 group/row">
                                                        <td className="px-10">
                                                            <span className={`px-5 py-2 rounded-2xl text-[10px] font-black inline-flex items-center gap-2 border shadow-sm
                                                            ${note.type === 'star' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                                    note.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full ${note.type === 'star' ? 'bg-amber-500' : note.sentiment === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                                {note.type === 'star' ? '🌟 نجمة تميز' : note.sentiment === 'positive' ? '✅ إيجابية' : '⚠️ للتطوير'}
                                                            </span>
                                                        </td>
                                                        <td className="px-10 text-slate-700 font-bold text-lg leading-relaxed max-w-lg group-hover/row:text-slate-900 transition-colors">{note.content}</td>
                                                        <td className="px-10 text-sm text-slate-400 font-black">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={16} className="opacity-40" />
                                                                {new Date(note.created_at).toLocaleDateString('ar-SA')}
                                                            </div>
                                                        </td>
                                                        <td className="px-10 no-print">
                                                            {note.is_read ? (
                                                                <span className="text-emerald-500 font-black text-[10px] bg-emerald-50 px-4 py-2 rounded-xl flex items-center justify-center gap-2 border border-emerald-100 shadow-sm">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> تمت قراءتها
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300 font-black text-[10px] bg-slate-50 px-4 py-2 rounded-xl flex items-center justify-center gap-2 border border-slate-100">
                                                                    في الانتظار
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
