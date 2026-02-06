import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Settings, ChevronRight, GraduationCap, ClipboardList } from 'lucide-react';

const Attendance = () => {
    const [view, setView] = useState<'search' | 'admin'>('search');

    // Search State
    const [nid, setNid] = useState('');
    const [studentData, setStudentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [errorSearch, setErrorSearch] = useState('');

    // Admin State
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tab, setTab] = useState<'upload' | 'settings'>('upload');

    // Settings State
    const [newPassword, setNewPassword] = useState('');
    const [threshold, setThreshold] = useState('07:30');

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorSearch('');
        setStudentData(null);
        try {
            const res = await axios.get(`/api/attendance/student/${nid}`);
            setStudentData(res.data);
        } catch (err) {
            setErrorSearch('لم يتم العثور على سجلات لهذا الطالب');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/attendance/login', { password });
            setIsAuthenticated(true);
            // Fetch settings
            const res = await axios.get('/api/attendance/settings');
            setThreshold(res.data.threshold);
        } catch (err) {
            alert('كلمة المرور خاطئة');
        }
    };

    const handleSettingsSave = async () => {
        try {
            await axios.post('/api/attendance/settings', {
                password: newPassword || undefined,
                threshold
            });
            alert('تم حفظ الإعدادات');
            setNewPassword('');
        } catch (err) { alert('فشل الحفظ'); }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('date', uploadDate);
        try {
            await axios.post('/api/attendance/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploadMsg('تم رفع السجلات وتحديث النقاط بنجاح');
            setFile(null);
        } catch (err: any) {
            console.error(err);
            setUploadMsg(err.response?.data?.error || 'حدث خطأ أثناء المعالجة - تأكد من صحة الملف');
        } finally {
            setUploading(false);
        }
    };

    if (view === 'admin') {
        if (!isAuthenticated) {
            return (
                <div className="py-24 flex justify-center animate-entrance">
                    <div className="school-card p-12 w-full max-w-md text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100">
                            <Lock className="text-primary" size={40} />
                        </div>
                        <h2 className="text-3xl font-black mb-8">الدخول للوحة التحكم</h2>
                        <form onSubmit={handleLogin} className="space-y-6 text-right">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">كلمة المرور الإدارية</label>
                                <input
                                    type="password"
                                    className="text-center text-2xl font-black tracking-widest"
                                    placeholder="••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button className="btn-school w-full py-4 text-xl">دخول النظام</button>
                            <button type="button" onClick={() => setView('search')} className="block w-full text-center text-sm font-bold text-slate-400 hover:text-primary transition-colors">عودة للبحث</button>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <div className="py-16 max-w-5xl mx-auto animate-entrance px-4">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-4xl font-black flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100"><Settings className="text-primary" size={28} /></div>
                        لوحة تحكم الحضور
                    </h2>
                    <button onClick={() => { setIsAuthenticated(false); setView('search'); }} className="btn-school-outline border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200">خروج آمن</button>
                </div>

                <div className="flex gap-4 mb-10">
                    <button onClick={() => setTab('upload')} className={`px-8 py-3 rounded-2xl font-black transition-all ${tab === 'upload' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>رفع السجلات</button>
                    <button onClick={() => setTab('settings')} className={`px-8 py-3 rounded-2xl font-black transition-all ${tab === 'settings' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}`}>الإعدادات العامة</button>
                </div>

                <div className="school-card p-12">
                    {tab === 'upload' ? (
                        <div className="space-y-8">
                            <h3 className="font-black text-2xl">استيراد ملف الحضور (Excel)</h3>
                            <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100 text-sm font-bold text-blue-800 leading-relaxed">
                                <span className="block mb-2 text-primary">⚠️ ملاحظات هامة:</span>
                                يجب أن يحتوي الملف على الأعمدة بالترتيب: (اسم الطالب)، (الصف)، (الفصل)، (رقم الهوية)، (التاريخ)، (وقت الوصول) <br />
                                سيتم احتساب الغياب تلقائياً للطلاب غير الموجودين في الملف لتواريخ الملف.
                            </div>

                            <div className="relative group">
                                <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all cursor-pointer">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Settings className="text-slate-400 group-hover:text-primary" size={32} />
                                        </div>
                                        <p className="mb-2 text-sm text-slate-500 font-bold tracking-tight">
                                            {file ? <span className="text-primary">{file.name}</span> : <span>اضغط هنا لاختيار ملف Excel</span>}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium">XLSX, XLS (الحد الأقصى 10MB)</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                                </label>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 items-end">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ التحضير</label>
                                    <input
                                        type="date"
                                        value={uploadDate}
                                        onChange={(e) => setUploadDate(e.target.value)}
                                        className="font-bold text-lg"
                                        required
                                    />
                                </div>
                                <button onClick={handleUpload} disabled={!file || uploading} className="btn-school h-[3.5rem] text-lg">
                                    {uploading ? 'جاري المعالجة...' : 'بدء عملية الاستيراد'}
                                </button>
                            </div>
                            {uploadMsg && <div className={`text-center p-4 rounded-xl font-black ${uploadMsg.includes('نجاح') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{uploadMsg}</div>}
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-2xl mx-auto py-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">وقت الحضور المتأخر</label>
                                    <input type="time" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="font-bold text-lg" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">تغيير كلمة المرور</label>
                                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••" className="text-center font-bold text-lg" />
                                </div>
                            </div>
                            <button onClick={handleSettingsSave} className="btn-school w-full py-4 text-xl">حفظ كافة التغييرات</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="py-16 animate-entrance max-w-5xl mx-auto min-h-screen px-4">

            <div className="text-center mb-16 space-y-4">
                <h1 className="text-5xl md:text-7xl font-black tracking-tight"><span className="text-royal">سجلات</span> الانضباط المدرسية</h1>
                <p className="text-xl text-slate-500 font-bold opacity-80">استعلم عن حالة الحضور والغياب والنقاط المكتسبة للطلاب</p>
            </div>

            {/* Premium Search Box */}
            <div className="school-card p-10 mb-12 border-t-[12px] border-primary shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 relative z-10">
                    <input
                        type="text"
                        className="flex-1 p-6 border-slate-100 bg-slate-50 rounded-3xl text-right text-3xl font-black focus:bg-white placeholder:text-slate-300 transition-all tracking-widest"
                        placeholder="أدخل رقم الهوية للاستعلام..."
                        value={nid}
                        onChange={(e) => setNid(e.target.value)}
                    />
                    <button type="submit" className="btn-school px-12 text-2xl shadow-2xl group">
                        بحث الآن <ChevronRight size={24} className="group-hover:-translate-x-2 transition-transform" />
                    </button>
                </form>

                {/* Gamification Banner */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center pt-10 border-t border-slate-50">
                    <div className="group space-y-3">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform font-black text-2xl shadow-sm border border-emerald-200">
                            +3
                        </div>
                        <span className="font-black text-slate-700 block text-lg">نقاط حضور مبكر</span>
                        <p className="text-xs text-slate-400 font-bold px-4 leading-relaxed">للمبادرين بالحضور قبل الوقت المحدد</p>
                    </div>
                    <div className="group space-y-3">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform font-black text-2xl shadow-sm border border-amber-200">
                            +1
                        </div>
                        <span className="font-black text-slate-700 block text-lg">نقطة تأخر صباحي</span>
                        <p className="text-xs text-slate-400 font-bold px-4 leading-relaxed">نقدر حضوركم حتى لو كان متأخراً</p>
                    </div>
                    <div className="group space-y-3">
                        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform font-black text-2xl shadow-sm border border-rose-200">
                            -1
                        </div>
                        <span className="font-black text-slate-700 block text-lg">نقطة غياب</span>
                        <p className="text-xs text-slate-400 font-bold px-4 leading-relaxed">نأمل الالتزام لضمان عدم نقص النقاط</p>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="font-black text-slate-400 text-sm tracking-widest uppercase">جاري استرجاع البيانات...</span>
                </div>
            )}

            {errorSearch && (
                <div className="school-card bg-rose-50 border-rose-100 flex items-center justify-center gap-4 py-16 animate-entrance">
                    <div className="p-4 bg-white rounded-2xl shadow-sm"><Lock className="text-rose-500" size={32} /></div>
                    <div className="text-right">
                        <h3 className="text-2xl font-black text-rose-700 mb-1">{errorSearch}</h3>
                        <p className="text-rose-600/60 font-bold">تأكد من صحة رقم الهوية المدخل وحاول مرة أخرى</p>
                    </div>
                </div>
            )}

            {studentData && (
                <div className="space-y-10 animate-entrance text-right">

                    {/* Student Status Card */}
                    <div className="school-card p-12 bg-gradient-to-br from-white to-blue-50/30 border-r-8 border-primary relative overflow-hidden">
                        <div className="absolute top-0 left-0 p-12 opacity-5 -z-0">
                            <GraduationCap size={180} className="text-primary" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
                            <div className="space-y-4 text-center md:text-right">
                                <span className="badge badge-info px-4 py-1.5 text-sm mb-2">الملف الشخصي للطالب</span>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight">{studentData.student.name}</h2>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <span className="px-5 py-2 bg-white rounded-2xl border border-slate-100 font-bold text-slate-600 shadow-sm">{studentData.student.grade}</span>
                                    <span className="px-5 py-2 bg-white rounded-2xl border border-slate-100 font-bold text-slate-600 shadow-sm">{studentData.student.class_name}</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 font-bold text-sm mt-4">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    آخر تحضير: <span className="text-slate-800">{studentData.records.length > 0 ? `${studentData.records[0].date} | ${studentData.records[0].time}` : 'لم يتم التحضير بعد'}</span>
                                </div>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex flex-col items-center min-w-[220px] transform hover:scale-105 transition-transform duration-500 ring-15 ring-slate-100/50">
                                <div className="text-6xl font-black text-royal mb-2">{studentData.stats.totalPoints}</div>
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">إجمالي النقاط التراكمي</span>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Records Container */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="font-black text-2xl text-slate-800 flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-blue-500 rounded-full"></div>
                                تفاصيل سجلات الحضور
                            </h3>
                            <span className="text-xs font-black text-slate-400 uppercase bg-slate-100 px-4 py-1.5 rounded-full">{studentData.records.length} سجل متاح</span>
                        </div>

                        {studentData.records.length === 0 ? (
                            <div className="school-card p-20 text-center bg-slate-50/50 border-dashed border-2">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                    <ClipboardList size={40} className="text-slate-200" />
                                </div>
                                <p className="text-xl font-bold text-slate-300">لا توجد أي سجلات حضور في النظام حالياً</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {studentData.records.map((r: any) => (
                                    <div key={r.id} className="school-card p-8 group hover:border-primary/20 bg-white relative overflow-hidden transition-all duration-300">
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            {/* Date Circle */}
                                            <div className="w-24 h-24 rounded-[1.75rem] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                                                <span className="text-xs font-black text-slate-400 uppercase group-hover:text-blue-100 transition-colors">بتاريخ</span>
                                                <span className="text-lg font-black text-slate-700 group-hover:text-white transition-colors">{r.date.split('-')[2]}</span>
                                                <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-200 transition-colors uppercase">{r.date.split('-')[1]} | {r.date.split('-')[0]}</span>
                                            </div>

                                            <div className="flex-1 grid md:grid-cols-3 gap-8 w-full">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">توقيت الحضور</span>
                                                    <div className="text-2xl font-black text-slate-800 flex items-center gap-2 dir-ltr justify-end md:justify-start">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                        {r.time}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">التقييم اليومي</span>
                                                    {r.status === 'early' && <span className="badge badge-success px-4 py-2 font-black text-sm rounded-xl">حضور مبكر</span>}
                                                    {r.status === 'late' && <span className="badge badge-warning px-4 py-2 font-black text-sm rounded-xl">حضور متأخر</span>}
                                                    {r.status === 'absent' && <span className="badge badge-danger px-4 py-2 font-black text-sm rounded-xl">غائب تماماً</span>}
                                                </div>

                                                <div className="space-y-1 md:text-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مجموع النقاط</span>
                                                    <div className={`text-4xl font-black ${r.points > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {r.points > 0 ? `+${r.points}` : r.points}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-sm font-bold text-slate-600 leading-relaxed group-hover:bg-white transition-colors">
                                            <span className="text-primary mr-2 font-black italic">رسالة المؤسسة:</span>
                                            {r.status === 'early' && "تميزك في الحضور المبكر يعكس طموحك العالي. استمر في هذا التألق."}
                                            {r.status === 'late' && "نقدر حضورك، ونأمل منك التواجد مبكراً للمشاركة في البرنامج الصباحي الهام."}
                                            {r.status === 'absent' && "نأسف لغيابك اليوم. يرجى تبرير الغياب لتجنب تأثر نقاطك العامة للمستوى."}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Portal Shortcut */}
            {!studentData && !loading && (
                <div className="mt-24 text-center group">
                    <button onClick={() => setView('admin')} className="p-4 rounded-full hover:bg-slate-100 transition-all">
                        <Lock size={16} className="text-slate-200 group-hover:text-slate-400 mb-2 mx-auto" />
                        <span className="text-[10px] font-black text-slate-200 group-hover:text-slate-500 uppercase tracking-[0.3em]">بوابة الموظفين</span>
                    </button>
                </div>
            )}
        </div >
    );
};

export default Attendance;
