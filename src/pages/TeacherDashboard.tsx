import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Star, User, BookOpen } from 'lucide-react';
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
            fetchHistory(); // Refresh history if needed
        } catch (err) {
            alert('فشل الإرسال');
        } finally {
            setSending(false);
        }
    };

    if (!user) return null;

    return (
        <div className="py-8 animate-fade-in max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border-b-4 border-primary">
                <h1 className="text-2xl font-bold flex items-center gap-3 text-primary-dark">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <User className="text-primary" size={28} />
                    </div>
                    <span>أهلاً بك، الأستاذ/ة {user.name}</span>
                </h1>
                <div className="flex items-center gap-4">
                    <span className="bg-blue-50 text-blue-800 px-4 py-2 rounded-xl text-sm font-bold">المادة: {user.subject}</span>
                    <button
                        onClick={() => { localStorage.removeItem('user'); navigate('/notes'); }}
                        className="text-red-500 hover:text-red-600 font-bold text-sm"
                    >
                        تسجيل خروج
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex gap-4 mb-8 justify-center">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'new' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    <Send size={18} />
                    إرسال ملاحظة جديدة
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    <BookOpen size={18} />
                    سجل المراسلات
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="grid md:grid-cols-12 gap-8">
                    {/* Left: Search (4 cols) */}
                    <div className="md:col-span-4 space-y-4">
                        <div className="card p-6 border border-gray-100 shadow-lg h-[600px] flex flex-col">
                            <h3 className="font-bold text-lg mb-4 text-primary flex items-center gap-2">
                                <Search size={20} />
                                البحث عن طالب
                            </h3>
                            <form onSubmit={handleSearch} className="space-y-3 mb-4">
                                <input
                                    type="text"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="الاسم أو رقم الهوية..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary w-full py-3 text-lg shadow-md">بحث</button>
                            </form>

                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {students.length === 0 && <p className="text-center text-gray-400 mt-10">ابدأ البحث لعرض الطلاب</p>}
                                {students.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedStudent(s)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedStudent?.id === s.id ? 'bg-blue-50 border-primary text-primary-dark shadow-md transform scale-[1.02]' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-300'}`}
                                    >
                                        <p className="font-bold text-base">{s.name}</p>
                                        <p className="text-xs text-gray-500 mt-1 flex justify-between">
                                            <span>{s.grade}</span>
                                            <span>{s.class_name}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Action (8 cols) */}
                    <div className="md:col-span-8">
                        {selectedStudent ? (
                            <div className="card p-8 border-t-8 border-primary h-full shadow-xl bg-white relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0 pointer-events-none"></div>

                                <h2 className="text-3xl font-black mb-8 flex items-center gap-3 relative z-10 border-b pb-4 border-gray-100">
                                    <span className="text-gray-400 font-medium text-lg">توجيه ملاحظة للطالب:</span>
                                    <span className="text-primary">{selectedStudent.name}</span>
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
                                    <button onClick={() => { setNoteType('positive'); setIsStar(false); }} className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${noteType === 'positive' && !isStar ? 'bg-green-50 border-green-500 text-green-700 shadow-md ring-2 ring-green-200' : 'border-gray-100 text-gray-400 hover:border-gray-300 bg-gray-50'}`}>
                                        <span className="text-2xl">👍</span>
                                        ملاحظة إيجابية
                                    </button>
                                    <button onClick={() => { setNoteType('negative'); setIsStar(false); }} className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${noteType === 'negative' && !isStar ? 'bg-red-50 border-red-500 text-red-700 shadow-md ring-2 ring-red-200' : 'border-gray-100 text-gray-400 hover:border-gray-300 bg-gray-50'}`}>
                                        <span className="text-2xl">📝</span>
                                        ملاحظة للتطوير
                                    </button>
                                    <button onClick={() => setIsStar(true)} className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${isStar ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-md ring-2 ring-amber-200' : 'border-gray-100 text-gray-400 hover:border-gray-300 bg-gray-50'}`}>
                                        <Star className={isStar ? "fill-amber-500 text-amber-500" : ""} size={28} />
                                        نجمة تميز
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    {!isStar ? (
                                        <div className="relative">
                                            <textarea
                                                className="w-full h-48 p-6 border-2 border-gray-200 rounded-2xl resize-none focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-lg transition-all"
                                                placeholder="اكتب تفاصيل الملاحظة هنا..."
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                            ></textarea>
                                            <div className="absolute bottom-4 left-4 text-gray-400 text-xs pointer-events-none">
                                                {content.length} حرف
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-48 flex items-center justify-center text-center bg-gradient-to-br from-amber-50 to-white rounded-2xl border-2 border-dashed border-amber-300 text-amber-800 shadow-inner">
                                            <div className="animate-bounce-slow">
                                                <Star size={64} className="mx-auto mb-4 text-amber-400 fill-amber-400 drop-shadow-lg" />
                                                <p className="font-bold text-xl">سيتم منح الطالب نجمة تميز في رصيده!</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex items-center justify-between border-t pt-6 border-gray-100 relative z-10">
                                    <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full font-medium">
                                        <BookOpen size={16} />
                                        مادة التدريس: {user.subject}
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || (!content && !isStar)}
                                        className="btn bg-primary hover:bg-primary-dark text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center gap-2"
                                    >
                                        {sending ? 'جاري الإرسال...' : (
                                            <>
                                                <Send size={20} />
                                                إرسال الملاحظة
                                            </>
                                        )}
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-4 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 min-h-[500px]">
                                <User size={64} className="mb-4 opacity-20" />
                                <p className="text-xl font-medium">اختر طالباً من القائمة للبدء</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // History Tab View - Grouped by Student
                <div className="animate-fade-in bg-white rounded-3xl shadow-xl border border-gray-100 p-8 min-h-[500px]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800">سجل الرسائل المرسلة</h2>
                            <p className="text-gray-500">متابعة حالة قراءة الرسائل (مصنفة حسب الطالب)</p>
                        </div>
                        <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl font-bold">
                            {sentNotes.length} رسالة
                        </div>
                    </div>

                    {Object.keys(sentNotes.reduce((acc, note) => ({ ...acc, [note.student_name]: true }), {})).length === 0 && (
                        <p className="text-center text-gray-400 py-10">لا يوجد رسائل مرسلة بعد</p>
                    )}

                    <div className="space-y-6">
                        {Object.entries(sentNotes.reduce((acc: any, note) => {
                            if (!acc[note.student_name]) acc[note.student_name] = [];
                            acc[note.student_name].push(note);
                            return acc;
                        }, {})).map(([studentName, notes]: [string, any]) => (
                            <div key={studentName} className="border border-gray-200 rounded-2xl overflow-hidden print-break-inside">
                                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                                        <div className="w-2 h-8 bg-primary rounded-full"></div>
                                        {studentName}
                                        <span className="text-xs bg-white border px-2 py-1 rounded-full text-gray-500">{notes.length} ملاحظات</span>
                                    </h3>
                                    <button onClick={() => {
                                        const printContent = document.getElementById(`print-${studentName}`)?.innerHTML;
                                        const win = window.open('', '', 'height=700,width=900');
                                        win?.document.write(`<html><head><title>تقرير الطالب ${studentName}</title><style>body { font-family: 'Cairo', sans-serif; direction: rtl; } .no-print { display: none; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: right; } th { background-color: #f2f2f2; }</style></head><body><h1>تقرير ملاحظات المعلمين</h1><h2>الطالب: ${studentName}</h2>${printContent}</body></html>`);
                                        win?.document.close();
                                        win?.print();
                                    }} className="text-sm border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                                        🖨️ طباعة التقرير
                                    </button>
                                </div>
                                <div id={`print-${studentName}`} className="p-0">
                                    <table className="w-full text-right">
                                        <thead className="bg-white text-gray-500 font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="p-4 w-32">نوع الملاحظة</th>
                                                <th className="p-4">نص الرسالة</th>
                                                <th className="p-4 w-32">التاريخ</th>
                                                <th className="p-4 w-32 no-print">الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {notes.map((note: any) => (
                                                <tr key={note.id} className="hover:bg-gray-50/50">
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                                                        ${note.type === 'star' ? 'bg-amber-100 text-amber-700' :
                                                                note.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {note.type === 'star' ? 'نجمة تميز' : note.sentiment === 'positive' ? 'إيجابية' : 'للتطوير'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-gray-700">{note.content}</td>
                                                    <td className="p-4 text-sm text-gray-400">{new Date(note.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4 no-print">
                                                        {note.is_read ? (
                                                            <span className="text-green-600 font-bold text-xs">✓✓ مقروءة</span>
                                                        ) : (
                                                            <span className="text-gray-400 font-bold text-xs">✓ مرسلة</span>
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
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;
