import React, { useState } from 'react';
import axios from 'axios';
import { Lock, Settings } from 'lucide-react';

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
                <div className="py-20 flex justify-center animate-fade-in">
                    <div className="card p-8 w-full max-w-sm text-center">
                        <Lock className="mx-auto mb-4 text-primary" size={40} />
                        <h2 className="text-xl font-bold mb-6">الدخول للوحة التحكم</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input
                                type="password"
                                className="w-full p-3 border rounded text-center"
                                placeholder="كلمة المرور"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button className="btn btn-primary w-full">دخول</button>
                            <button type="button" onClick={() => setView('search')} className="text-sm text-gray-500">عودة للبحث</button>
                        </form>
                    </div>
                </div>
            );
        }

        return (
            <div className="py-10 max-w-4xl mx-auto animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="text-primary" /> لوحة تحكم الحضور
                    </h2>
                    <button onClick={() => { setIsAuthenticated(false); setView('search'); }} className="text-red-500">خروج</button>
                </div>

                <div className="flex gap-4 mb-6">
                    <button onClick={() => setTab('upload')} className={`px-4 py-2 rounded ${tab === 'upload' ? 'bg-primary text-white' : 'bg-gray-100'}`}>رفع السجلات</button>
                    <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded ${tab === 'settings' ? 'bg-primary text-white' : 'bg-gray-100'}`}>الإعدادات</button>
                </div>

                <div className="card p-8">
                    {tab === 'upload' ? (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg">استيراد ملف الحضور (Excel)</h3>
                            <div className="bg-yellow-50 p-4 rounded text-sm text-yellow-800">
                                يجب أن يحتوي الملف على الأعمدة بالترتيب: (اسم الطالب)، (الصف)، (الفصل)، (رقم الهوية)، (التاريخ)، (وقت الوصول) <br />
                                سيتم احتساب الغياب تلقائياً للطلاب غير الموجودين في الملف لتواريخ الملف.
                            </div>
                            <div className="border-2 border-dashed border-gray-300 p-10 rounded text-center">
                                <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                            </div>

                            <div>
                                <label className="block font-bold mb-2">تاريخ التحضير</label>
                                <input
                                    type="date"
                                    value={uploadDate}
                                    onChange={(e) => setUploadDate(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">سيتم تعميم هذا التاريخ على جميع سجلات الملف (أفضل لتفادي أخطاء التواريخ في الملف)</p>
                            </div>

                            {uploadMsg && <p className="text-center font-bold text-green-600">{uploadMsg}</p>}
                            <button onClick={handleUpload} disabled={!file || uploading} className="btn btn-primary w-full">
                                {uploading ? 'جاري المعالجة...' : 'بدء الاستيراد'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-md mx-auto">
                            <div>
                                <label className="block font-bold mb-2">وقت الحضور المتأخر</label>
                                <input type="time" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="w-full p-2 border rounded" />
                                <p className="text-xs text-gray-500 mt-1">أي حضور بعد هذا الوقت سيعتبر متأخراً (لون برتقالي)</p>
                            </div>
                            <hr />
                            <div>
                                <label className="block font-bold mb-2">تغيير كلمة المرور</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="كلمة المرور الجديدة" />
                            </div>
                            <button onClick={handleSettingsSave} className="btn btn-primary w-full">حفظ التغييرات</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 animate-fade-in max-w-4xl mx-auto min-h-screen">

            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-text mb-4">سجلات الحضور والغياب</h1>
                <p className="text-text-light">استعلم عن حالة الانضباط والنقاط المكتسبة</p>
            </div>

            {/* Search Box */}
            {/* Search Box */}
            <div className="card p-8 mb-10 border-t-8 border-primary shadow-xl">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        className="flex-1 p-4 border-2 border-gray-200 rounded-xl text-right text-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder="أدخل رقم الهوية للاستعلام..."
                        value={nid}
                        onChange={(e) => setNid(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary px-10 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                        بحث
                    </button>
                </form>
                {/* Gamification Banner */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100 text-green-800 hover:scale-105 transition-transform">
                        <span className="block font-black text-3xl mb-2 text-green-600">+3</span>
                        <span className="font-bold text-lg">نقاط حضور مبكر</span>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 text-orange-800 hover:scale-105 transition-transform">
                        <span className="block font-black text-3xl mb-2 text-orange-500">+1</span>
                        <span className="font-bold text-lg">نقطة تأخر صباحي</span>
                    </div>
                    <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 text-red-800 hover:scale-105 transition-transform">
                        <span className="block font-black text-3xl mb-2 text-red-600">-1</span>
                        <span className="font-bold text-lg">نقطة غياب</span>
                    </div>
                </div>
            </div>

            {loading && <div className="text-center py-10"><div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>}
            {errorSearch && <div className="text-center text-red-500 font-bold py-10 card bg-red-50 border-red-100">{errorSearch}</div>}

            {studentData && (
                <div className="space-y-6 animate-fade-in text-right">

                    {/* Student Header */}
                    <div className="card p-8 bg-gradient-to-br from-white to-blue-50 border-r-4 border-primary shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-primary mb-2">{studentData.student.name}</h2>
                                <p className="text-xl text-gray-600 font-medium mb-1">{studentData.student.grade} - {studentData.student.class_name}</p>
                                <p className="text-sm text-gray-500 font-bold mt-2">
                                    آخر تحضير: <span className="text-primary-dark">{studentData.records.length > 0 ? `${studentData.records[0].date} | ${studentData.records[0].time}` : 'لا يوجد'}</span>
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center min-w-[150px]">
                                <span className="text-4xl font-black text-primary mb-1">{studentData.stats.totalPoints}</span>
                                <span className="text-sm font-bold text-gray-400">مجموع النقاط</span>
                            </div>
                        </div>
                    </div>

                    {/* Records List (Cards) */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-xl text-gray-700 px-2">سجل الحضور</h3>
                        {studentData.records.length === 0 ? (
                            <div className="text-center p-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                لا توجد سجلات حضور لهذا الطالب
                            </div>
                        ) : (
                            studentData.records.map((r: any) => (
                                <div key={r.id} className="card p-5 hover:shadow-lg transition-all border border-gray-100 bg-white group hover:-translate-y-1">
                                    {/* Row 1: Date & Time */}
                                    <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-3">
                                        <div className="flex items-center gap-2 text-gray-700 font-bold text-lg">
                                            <span className="text-gray-400 text-sm ml-1">التاريخ:</span>
                                            {r.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700 font-bold text-lg dir-ltr">
                                            <span className="text-gray-400 text-sm ml-1">وقت الوصول:</span>
                                            {r.time}
                                        </div>
                                    </div>

                                    {/* Row 2: Status & Points */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="font-bold text-lg mb-1">الحالة:</div>
                                            {r.status === 'early' && <span className="inline-block text-green-700 bg-green-100 px-4 py-2 rounded-lg font-bold shadow-sm">(حضور مبكر)</span>}
                                            {r.status === 'late' && <span className="inline-block text-orange-700 bg-orange-100 px-4 py-2 rounded-lg font-bold shadow-sm">(حضور متأخر)</span>}
                                            {r.status === 'absent' && <span className="inline-block text-red-700 bg-red-100 px-4 py-2 rounded-lg font-bold shadow-sm">(غائب)</span>}
                                        </div>
                                        <div className="text-center min-w-[100px]">
                                            <div className="font-bold text-lg mb-1">النقاط:</div>
                                            <span className={`text-2xl font-black ${r.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {r.points > 0 ? `+${r.points}` : r.points}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 3: Notes */}
                                    <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 font-medium leading-relaxed border border-gray-100">
                                        <span className="font-bold text-gray-800 ml-2">ملاحظات:</span>
                                        {r.status === 'early' && "شكرا جزيلا لاهتمامكم بالانضباط والحضور المبكر ساهمت في تميز ابنكم."}
                                        {r.status === 'late' && "نأمل الحرص على الحضور المبكر لضمان الاستفادة الكاملة من الوقت التعليمي."}
                                        {r.status === 'absent' && "نرجو التواصل مع المدرسة لتبرير الغياب ومتابعة الدروس الفائتة."}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            )
            }

            {/* Admin Login Link */}
            <div className="mt-20 text-center">
                <button onClick={() => setView('admin')} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
                    لوحة التحكم
                </button>
            </div>

        </div >
    );
};

export default Attendance;
