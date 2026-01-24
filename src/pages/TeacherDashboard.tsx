import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Star, User, BookOpen, LogOut, Printer, Users } from 'lucide-react';
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
    }, []);

    useEffect(() => {
        if (activeTab === 'history' && user) {
            fetchHistory();
        }
    }, [activeTab, user]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`/api/notes/teacher/${user.id}`);
            setSentNotes(res.data.data);
        } catch (err) { console.error(err); }
    };

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
            fetchHistory();
        } catch (err) {
            alert('فشل الإرسال');
        } finally {
            setSending(false);
        }
    };

    if (!user) return null;

    return (
        <div className="py-8 animate-fade-in max-w-7xl mx-auto px-4">
            {/* Top Header Card */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-premium border border-white">
                <div className="flex items-center gap-5 mb-4 md:mb-0">
                    <div className="p-4 bg-primary-600 text-white rounded-2xl shadow-lg ring-4 ring-primary-50">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">أهلاً بك، {user.name}</h1>
                        <p className="text-primary-600 font-bold flex items-center gap-1">
                            <BookOpen size={16} /> معلم مادة: {user.subject}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { localStorage.removeItem('user'); navigate('/notes'); }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        تسجيل خروج
                    </button>
                </div>
            </div>

            {/* Main Navigation Tabs */}
            <div className="flex gap-4 mb-10 justify-center">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-2 ${activeTab === 'new' ? 'btn-primary shadow-2xl scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <Send size={20} />
                    إرسال ملاحظة جديدة
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-2 ${activeTab === 'history' ? 'btn-primary shadow-2xl scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                >
                    <BookOpen size={20} />
                    سجل المراسلات
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* Student List Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8">
                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] shadow-premium border border-white h-[650px] flex flex-col">
                            <h3 className="font-black text-xl mb-6 text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Users size={22} /></div>
                                البحث عن طالب
                            </h3>
                            <form onSubmit={handleSearch} className="space-y-3 mb-6">
                                <div className="relative">
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold"
                                        placeholder="الاسم أو رقم الهوية..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-full py-4 rounded-2xl shadow-lg font-black tracking-wide">بحث سريع</button>
                            </form>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {students.length === 0 && (
                                    <div className="text-center py-20">
                                        <div className="text-4xl mb-4 grayscale">🔍</div>
                                        <p className="text-slate-400 font-bold">ابدأ البحث لعرض الطلاب</p>
                                    </div>
                                )}
                                {students.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudent(s)}
                                        className={`w-full text-right p-5 rounded-2xl transition-all border-2 text-wrap ${selectedStudent?.id === s.id ? 'bg-primary-50 border-primary-500 shadow-lg scale-[1.02]' : 'bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <div className="font-black text-slate-800 text-lg mb-1">{s.name}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-500">{s.grade}</span>
                                            <span className="text-sm font-black text-primary-600 bg-white px-3 py-1 rounded-lg border border-primary-100">{s.class_name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Note Sending Form */}
                    <div className="lg:col-span-8">
                        {selectedStudent ? (
                            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[2.5rem] shadow-premium border border-white h-full">
                                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-black text-2xl">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-slate-500 font-bold mb-1">توجيه ملاحظة للطالب:</div>
                                        <div className="text-3xl font-black text-slate-800">{selectedStudent.name}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                    <button onClick={() => { setNoteType('positive'); setIsStar(false); }} className={`p-6 rounded-3xl border-2 font-black transition-all flex flex-col items-center gap-3 ${noteType === 'positive' && !isStar ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg scale-105' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                                        <span className="text-3xl">👍</span>
                                        ملاحظة إيجابية
                                    </button>
                                    <button onClick={() => { setNoteType('negative'); setIsStar(false); }} className={`p-6 rounded-3xl border-2 font-black transition-all flex flex-col items-center gap-3 ${noteType === 'negative' && !isStar ? 'bg-red-50 border-red-500 text-red-700 shadow-lg scale-105' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                                        <span className="text-3xl">📝</span>
                                        ملاحظة للتطوير
                                    </button>
                                    <button onClick={() => { setIsStar(true); }} className={`p-6 rounded-3xl border-2 font-black transition-all flex flex-col items-center gap-3 ${isStar ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-lg scale-105' : 'bg-slate-50 border-transparent text-slate-400 hover:border-slate-200'}`}>
                                        <Star className={isStar ? "fill-amber-500 text-amber-500" : ""} size={36} />
                                        نجمة تميز
                                    </button>
                                </div>

                                {!isStar ? (
                                    <div className="relative mb-10 group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-200 to-indigo-200 rounded-[2rem] blur opacity-20 group-focus-within:opacity-50 transition-opacity"></div>
                                        <div className="relative">
                                            <textarea
                                                className="w-full h-56 p-8 bg-white border-2 border-slate-100 rounded-[2rem] resize-none focus:border-primary-500 focus:ring-0 outline-none text-xl font-bold transition-all shadow-inner"
                                                placeholder="اكتب تفاصيل الملاحظة بوضوح هنا..."
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            ></textarea>
                                            <div className="absolute bottom-6 left-8 text-slate-400 text-sm font-bold bg-white px-3 py-1 rounded-lg border border-slate-50 shadow-sm">
                                                {content.length} حرف
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-10 py-16 flex items-center justify-center text-center bg-gradient-to-br from-amber-50 to-white rounded-[2rem] border-2 border-dashed border-amber-300 text-amber-900 shadow-inner">
                                        <div className="animate-bounce-slow">
                                            <Star size={80} className="mx-auto mb-6 text-amber-400 fill-amber-400 drop-shadow-xl" />
                                            <p className="font-black text-2xl tracking-tight">سيتم منح الطالب "نجمة تميز" في رصيده العام!</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="text-slate-500 text-sm font-bold bg-slate-100 px-6 py-3 rounded-2xl flex items-center gap-2">
                                        <BookOpen size={18} /> مادة {user.subject}
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || (!content && !isStar)}
                                        className="btn btn-primary px-12 py-5 rounded-[1.5rem] shadow-2xl text-xl font-black gap-3 hover:scale-105 active:scale-95"
                                    >
                                        {sending ? 'جاري الإرسال...' : (
                                            <>
                                                <Send size={24} /> إرسال الآن
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[750px] flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[3rem] bg-white/50 backdrop-blur-sm">
                                <div className="p-8 bg-slate-50 rounded-full mb-6">
                                    <User size={80} className="opacity-30" />
                                </div>
                                <p className="text-2xl font-black text-slate-400">اختر طالباً من القائمة للبدء في كتابة الملاحظة</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* History Tab View */
                <div className="animate-fade-in bg-white/90 backdrop-blur-md rounded-[3rem] shadow-premium border border-white p-10 min-h-[600px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 mb-2">سجل المراسلات</h2>
                            <p className="text-slate-500 text-lg font-bold">جميع الملاحظات التي قمت بإرسالها للطلاب</p>
                        </div>
                        <div className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-primary-500/30 text-xl">
                            {sentNotes.length} ملاحظة
                        </div>
                    </div>

                    {sentNotes.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-slate-400 text-xl font-black">لا يوجد مراسلات مسجلة في حسابك حتى الآن</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {Object.entries(sentNotes.reduce((acc: any, note) => {
                                if (!acc[note.student_name]) acc[note.student_name] = [];
                                acc[note.student_name].push(note);
                                return acc;
                            }, {})).map(([studentName, notes]: [string, any]) => (
                                <div key={studentName} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                                                {studentName.charAt(0)}
                                            </div>
                                            <span className="text-2xl font-black text-slate-800">{studentName}</span>
                                            <span className="bg-white border text-primary-600 px-3 py-1 rounded-lg text-sm font-black">{notes.length} ملاحظات</span>
                                        </div>
                                        <button onClick={() => {
                                            const printContent = document.getElementById(`print-${studentName}`)?.innerHTML;
                                            const win = window.open('', '', 'height=700,width=900');
                                            win?.document.write(`<html><head><title>تقرير الطالب ${studentName}</title><style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap'); body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 40px; } .no-print { display: none; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 12px; text-align: right; } th { background-color: #f8fafc; color: #1e293b; font-weight: bold; } h1 { color: #4f46e5; text-align: center; margin-bottom: 20px; } .student-info { margin-bottom: 30px; font-weight: bold; border-right: 4px solid #4f46e5; padding-right: 15px; }</style></head><body><h1>تقرير ملاحظات المعلمين</h1><div class="student-info">الطالب: ${studentName}<br>المعلم: ${user.name}</div>${printContent}</body></html>`);
                                            win?.document.close();
                                            win?.print();
                                        }} className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all">
                                            <Printer size={18} /> طباعة التقرير
                                        </button>
                                    </div>
                                    <div id={`print-${studentName}`} className="p-0 overflow-x-auto">
                                        <table className="w-full text-right border-collapse">
                                            <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                                <tr>
                                                    <th className="p-6">النوع</th>
                                                    <th className="p-6">المحتوى</th>
                                                    <th className="p-6">التاريخ</th>
                                                    <th className="p-6 no-print">الحالة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {notes.map((note: any) => (
                                                    <tr key={note.id} className="hover:bg-slate-50/30 transition-colors">
                                                        <td className="p-6">
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black inline-flex items-center gap-1.5
                                                            ${note.type === 'star' ? 'bg-amber-100 text-amber-700' :
                                                                    note.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                                {note.type === 'star' ? '🌟 نجمة تميز' : note.sentiment === 'positive' ? '✅ إيجابية' : '⚠️ للتطوير'}
                                                            </span>
                                                        </td>
                                                        <td className="p-6 text-slate-700 font-bold leading-relaxed">{note.content}</td>
                                                        <td className="p-6 text-sm text-slate-400 font-medium">{new Date(note.created_at).toLocaleDateString('ar-SA')}</td>
                                                        <td className="p-6 no-print">
                                                            {note.is_read ? (
                                                                <span className="text-emerald-600 font-black text-xs bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit">
                                                                    <Send size={12} /> مقروءة
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 font-black text-xs bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit">
                                                                    <Send size={12} className="opacity-50" /> مرسلة
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
