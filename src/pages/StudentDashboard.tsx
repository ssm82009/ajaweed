import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageCircle, CheckCheck, GraduationCap } from 'lucide-react';
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
            // Local update
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, is_read: 1 } : n));
        } catch (err) { console.error(err); }
    };

    if (!user) return null;

    const starsCount = notes.filter(n => n.type === 'star').length;

    return (
        <div className="py-8 animate-fade-in max-w-4xl mx-auto px-4">

            {/* Header Profile */}
            <div className="card p-8 mb-8 flex flex-col md:flex-row items-center justify-between bg-gradient-to-l from-blue-50 to-white border-r-8 border-primary shadow-xl">
                <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className="p-4 bg-primary text-white rounded-2xl shadow-lg ring-4 ring-blue-100">
                        <GraduationCap size={40} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary-dark mb-1">{user.name}</h1>
                        <p className="text-gray-500 text-lg font-medium">{user.grade} - {user.class_name}</p>
                    </div>
                </div>

                <div className="text-center bg-gradient-to-br from-amber-50 to-white px-8 py-4 rounded-2xl border border-amber-200 shadow-sm min-w-[180px]">
                    <div className="flex items-center justify-center gap-2 text-amber-500 font-black text-4xl mb-1 drop-shadow-sm">
                        {starsCount} <Star fill="currentColor" size={32} />
                    </div>
                    <p className="text-sm text-amber-700 font-bold tracking-wide">رصيد نجوم التميز</p>
                </div>
                <button
                    onClick={() => { localStorage.removeItem('user'); navigate('/notes'); }}
                    className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"
                    title="تسجيل خروج"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
                </button>
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-primary-dark px-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageCircle className="text-primary" size={24} />
                </div>
                سجل الملاحظات والتقييمات
            </h2>

            <div className="space-y-6">
                {notes.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-400 text-lg font-medium">لا توجد ملاحظات مسجلة حتى الان.</p>
                    </div>
                )}

                {notes.map((note) => (
                    <div
                        key={note.id}
                        onMouseEnter={() => markAsRead(note.id, note.is_read)}
                        className={`card p-6 transition-all relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg border-r-4 ${note.type === 'star' ? 'border-r-amber-400 bg-gradient-to-l from-amber-50/50 to-white' : note.sentiment === 'positive' ? 'border-r-green-500 bg-gradient-to-l from-green-50/50 to-white' : 'border-r-red-400 bg-gradient-to-l from-red-50/50 to-white'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                {note.type === 'star' ? (
                                    <div className="p-3 bg-amber-100 rounded-full text-amber-600 shadow-sm ring-2 ring-white"><Star size={24} fill="currentColor" /></div>
                                ) : (
                                    <div className={`p-3 rounded-full shadow-sm ring-2 ring-white ${note.sentiment === 'positive' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        <span className="text-xl font-bold">{note.sentiment === 'positive' ? '👍' : '📝'}</span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{note.teacher_name}</h3>
                                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">{note.teacher_subject}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs text-gray-400 font-medium dir-ltr">{new Date(note.created_at).toLocaleDateString('ar-SA')}</span>
                                {/* Read Indicator */}
                                {note.is_read ? (
                                    <div className="flex items-center gap-1 text-blue-500 text-xs font-bold bg-blue-50 px-3 py-1 rounded-full opacity-50 group-hover:opacity-100 transition-opacity">
                                        <CheckCheck size={14} /> تمت القراءة
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-full animate-pulse">
                                        جديد
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mr-16 pl-4 text-gray-700 text-base leading-relaxed font-medium">
                            {note.content}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default StudentDashboard;
