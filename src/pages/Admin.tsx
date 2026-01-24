import { useState } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, Medal, MessageSquare, Users, Trash2, CheckCircle, Info } from 'lucide-react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState<'honor' | 'students' | 'teachers' | 'messages'>('students');

    // Reuse existing states for upload
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpload = async (endpoint: string) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true);
        setMessage(null);
        try {
            const response = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage({ type: 'success', text: `تم الرفع بنجاح! عدد السجلات المضافة/المحدثة: ${response.data.success}` });
            setFile(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'فشل الرفع: ' + (err.response?.data?.error || err.message) });
        } finally {
            setUploading(false);
        }
    };

    // Honor Board State
    const [honorList, setHonorList] = useState<any[]>([]);
    const [newHonor, setNewHonor] = useState({ title: '', description: '', category: 'academic' });
    const [honorImage, setHonorImage] = useState<File | null>(null);

    // Messages State
    const [messagesList, setMessagesList] = useState<any[]>([]);

    // Load Data based on Tab
    const loadData = async (tab: string) => {
        if (tab === 'honor') {
            try {
                const res = await axios.get('/api/honor');
                setHonorList(res.data.data);
            } catch (error) { console.error(error); }
        } else if (tab === 'messages') {
            try {
                const res = await axios.get('/api/admin/notes');
                setMessagesList(res.data.data);
            } catch (error) { console.error(error); }
        }
    };

    const handleHonorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', newHonor.title);
        formData.append('description', newHonor.description);
        formData.append('category', newHonor.category);
        if (honorImage) formData.append('image', honorImage);

        try {
            await axios.post('/api/honor', formData);
            alert('تمت إضافة الطالب للوحة الشرف بنجاح');
            setNewHonor({ title: '', description: '', category: 'academic' });
            setHonorImage(null);
            loadData('honor');
        } catch (error) {
            alert('حدث خطأ أثناء الإضافة');
        }
    };

    const handleDeleteHonor = async (id: number) => {
        if (confirm('هل أنت متأكد من حذف هذا التكريم؟')) {
            try {
                await axios.post(`/api/honor/delete/${id}`);
                loadData('honor');
            } catch (error) { alert('فشل الحذف'); }
        }
    };

    return (
        <div className="py-12 animate-fade-in max-w-7xl mx-auto px-4 min-h-screen">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">لوحة <span className="text-gradient">التحكم</span> والإدارة</h1>
                <p className="text-slate-500 font-bold text-lg">إدارة بيانات الطلاب، المعلمين، والمراسلات المدرسية</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center flex-wrap gap-4 mb-12">
                <button onClick={() => setActiveTab('students')} className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-premium ${activeTab === 'students' ? 'btn-primary scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-primary-200'}`}>
                    <Users size={24} /> إدارة الطلاب
                </button>
                <button onClick={() => setActiveTab('teachers')} className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-premium ${activeTab === 'teachers' ? 'bg-primary-500 text-white scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-primary-200'}`}>
                    <Users size={24} /> إدارة المعلمين
                </button>
                <button onClick={() => { setActiveTab('honor'); loadData('honor'); }} className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-premium ${activeTab === 'honor' ? 'bg-amber-500 text-white scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-amber-200'}`}>
                    <Medal size={24} /> لوحة الشرف
                </button>
                <button onClick={() => { setActiveTab('messages'); loadData('messages'); }} className={`px-10 py-5 rounded-2xl font-black transition-all flex items-center gap-3 shadow-premium ${activeTab === 'messages' ? 'bg-emerald-600 text-white scale-105' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-emerald-200'}`}>
                    <MessageSquare size={24} /> المراسلات
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-premium border border-white min-h-[600px]">

                {/* Import Sections (Students/Teachers) */}
                {(activeTab === 'students' || activeTab === 'teachers') && (
                    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in py-8">
                        <div className="text-center">
                            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl ${activeTab === 'students' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                <FileSpreadsheet size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
                                استيراد بيانات {activeTab === 'students' ? 'الطلاب' : 'المعلمين'}
                            </h2>
                            <p className="text-slate-500 text-lg font-bold">تحديث قاعدة البيانات بشكل جماعي عبر ملف Excel</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                            <div className="space-y-4">
                                <h4 className="font-black text-slate-800 flex items-center gap-2">
                                    <Info size={20} className="text-primary-500" /> تعليمات هامة:
                                </h4>
                                <ul className="text-slate-600 font-bold space-y-3">
                                    <li className="flex items-center gap-2">🔹 صيغة الملف: <code className="bg-white px-2 py-0.5 rounded border text-sm text-primary-600">.xlsx</code></li>
                                    {activeTab === 'students' ? (
                                        <>
                                            <li className="flex items-center gap-2">🔹 العمود 1: اسم الطالب</li>
                                            <li className="flex items-center gap-2">🔹 العمود 2: رقم الهوية (فريد)</li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-center gap-2">🔹 العمود 1: اسم المعلم</li>
                                            <li className="flex items-center gap-2">🔹 العمود 2: رقم الهوية (فريد)</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-black text-slate-800 invisible md:visible flex items-center gap-2">
                                    &nbsp;
                                </h4>
                                <ul className="text-slate-600 font-bold space-y-3">
                                    {activeTab === 'students' ? (
                                        <>
                                            <li className="flex items-center gap-2">🔹 العمود 3: الصف الدراسي</li>
                                            <li className="flex items-center gap-2">🔹 العمود 4: اسم الفصل</li>
                                        </>
                                    ) : (
                                        <li className="flex items-center gap-2">🔹 العمود 3: مادة التدريس</li>
                                    )}
                                    <li className="flex items-center gap-2 text-primary-600 text-sm">💡 سيتم تحديث السجلات إذا كان الرقم مسجلاً مسبقاً</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-lg text-slate-500 file:ml-6 file:py-4 file:px-10 file:rounded-2xl file:border-0 file:bg-slate-900 file:text-white file:font-black file:text-lg hover:file:bg-black cursor-pointer bg-white border-2 border-slate-100 rounded-3xl p-2 h-20 shadow-sm focus-within:border-primary-500 transition-all font-bold"
                                />
                            </div>

                            <button
                                onClick={() => handleUpload(activeTab === 'students' ? '/api/upload-students' : '/api/upload-teachers')}
                                disabled={!file || uploading}
                                className={`btn w-full py-6 rounded-[1.5rem] tracking-wide text-xl font-black shadow-22xl mb-4 ${activeTab === 'students' ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        جاري معالجة البيانات...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <Upload size={24} /> بدء الرفع والاستيراد
                                    </span>
                                )}
                            </button>
                        </div>

                        {message && (
                            <div className={`p-6 rounded-[1.5rem] font-black text-center flex items-center justify-center gap-3 animate-slide-up ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-100' : 'bg-red-50 text-red-800 border-2 border-red-100'}`}>
                                {message.type === 'success' ? <CheckCircle className="text-emerald-500" /> : <Info className="text-red-500" />}
                                {message.text}
                            </div>
                        )}
                    </div>
                )}

                {/* Honor Board Tab */}
                {activeTab === 'honor' && (
                    <div className="animate-fade-in grid lg:grid-cols-2 gap-16">
                        {/* Add New Honor Form */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-amber-100 text-amber-600 rounded-[1.5rem] shadow-sm"><Medal size={32} /></div>
                                <h3 className="text-3xl font-black text-slate-800">إضافة تكريم جديد</h3>
                            </div>

                            <form onSubmit={handleHonorSubmit} className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                                <div className="space-y-2">
                                    <label className="block text-slate-600 font-black mr-2">عنوان التكريم</label>
                                    <input type="text" placeholder="مثلاً: الطالب المتميز لهذا الشهر" className="w-full p-5 rounded-2xl border-2 border-white bg-white/60 focus:bg-white focus:border-amber-500 outline-none transition-all font-bold text-lg" value={newHonor.title} onChange={e => setNewHonor({ ...newHonor, title: e.target.value })} required />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-slate-600 font-black mr-2">الفئة</label>
                                    <select className="w-full p-5 rounded-2xl border-2 border-white bg-white focus:border-amber-500 outline-none font-bold text-lg appearance-none" value={newHonor.category} onChange={e => setNewHonor({ ...newHonor, category: e.target.value })}>
                                        <option value="academic">🌟 التميز الأكاديمي</option>
                                        <option value="activity">🏀 النشاطات والمواهب</option>
                                        <option value="behavior">🤝 السلوك والانضباط</option>
                                        <option value="other">🏆 إنجازات أخرى</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-slate-600 font-black mr-2">وصف التكريم</label>
                                    <textarea placeholder="اكتب تفاصيل الإنجاز..." className="w-full p-5 rounded-2xl border-2 border-white bg-white focus:border-amber-500 outline-none h-40 resize-none font-bold text-lg" value={newHonor.description} onChange={e => setNewHonor({ ...newHonor, description: e.target.value })} required></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-slate-600 font-black mr-2">صورة الطالب</label>
                                    <div className="relative border-2 border-dashed border-amber-200 bg-white rounded-2xl p-6 text-center group hover:border-amber-500 transition-all cursor-pointer">
                                        <input type="file" onChange={e => setHonorImage(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        <div className="text-slate-400 group-hover:text-amber-600 font-bold flex flex-col items-center gap-3">
                                            <Upload size={32} />
                                            <span>{honorImage ? <span className="text-amber-600 font-black">{honorImage.name}</span> : 'اضغط لاختيار صورة الطالب'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="btn bg-amber-500 hover:bg-amber-600 text-white w-full py-5 text-xl rounded-2xl shadow-xl shadow-amber-500/20 font-black mt-4">نشر في لوحة الشرف</button>
                            </form>
                        </div>

                        {/* Honor List Display */}
                        <div className="space-y-8">
                            <h3 className="text-3xl font-black text-slate-800">المكرمون حالياً</h3>
                            <div className="space-y-5 max-h-[850px] overflow-y-auto pr-4 custom-scrollbar">
                                {honorList.map((item) => (
                                    <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                {item.image_path ? (
                                                    <img src={item.image_path} className="w-24 h-24 rounded-2xl object-cover shadow-md" />
                                                ) : (
                                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-200 uppercase font-black text-2xl">{item.title.charAt(0)}</div>
                                                )}
                                                <div className="absolute -top-3 -right-3 p-2 bg-amber-500 text-white rounded-lg shadow-lg rotate-12"><Medal size={16} /></div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-800 text-xl mb-1">{item.title}</h4>
                                                <p className="text-slate-500 font-bold line-clamp-2 max-w-sm text-sm mb-3 leading-relaxed">{item.description}</p>
                                                <span className={`text-xs font-black px-4 py-1.5 rounded-full ${item.category === 'academic' ? 'bg-amber-100 text-amber-700' : 'bg-primary-50 text-primary-700'}`}>
                                                    {item.category === 'academic' ? 'التميز الأكاديمي' : item.category === 'activity' ? 'نشاط طلابي' : 'تميز سلوكي'}
                                                </span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteHonor(item.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all" title="حذف المكرم">
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                ))}
                                {honorList.length === 0 && (
                                    <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                        <p className="text-slate-400 font-bold">لا يوجد طلاب مكرمون حالياً</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages/Notes Log Tab */}
                {activeTab === 'messages' && (
                    <div className="animate-fade-in space-y-10 py-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h3 className="text-4xl font-black text-slate-800 mb-2">سجل المراسلات</h3>
                                <p className="text-slate-500 text-lg font-bold">مراقبة ورصد كافة الملاحظات المرسلة في النظام</p>
                            </div>
                            <div className="bg-emerald-50 text-emerald-700 px-8 py-4 rounded-[1.5rem] font-black text-2xl border border-emerald-100 shadow-sm">
                                {messagesList.length} <span className="text-sm font-bold opacity-80">رسالة إجمالية</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="p-6 font-black tracking-wide">المعلم</th>
                                            <th className="p-6 font-black tracking-wide">الطالب</th>
                                            <th className="p-6 font-black tracking-wide">نوع الملاحظة</th>
                                            <th className="p-6 font-black tracking-wide">نص الرسالة</th>
                                            <th className="p-6 font-black tracking-wide">التاريخ</th>
                                            <th className="p-6 font-black tracking-wide">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 italic-off">
                                        {messagesList.map((msg) => (
                                            <tr key={msg.id} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-6">
                                                    <div className="font-black text-slate-800">{msg.teacher_name}</div>
                                                    <div className="text-xs text-slate-400 font-bold">{msg.teacher_subject}</div>
                                                </td>
                                                <td className="p-6 font-black text-slate-800">{msg.student_name}</td>
                                                <td className="p-6">
                                                    <span className={`px-4 py-2 rounded-xl text-xs font-black inline-flex items-center gap-1.5
                                                        ${msg.type === 'star' ? 'bg-amber-100 text-amber-700' :
                                                            msg.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                        {msg.type === 'star' ? '🌟 نجمة تميز' : msg.sentiment === 'positive' ? '✅ إيجابية' : '⚠️ تطويرية'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-slate-600 font-bold max-w-sm truncate group-hover:text-clip group-hover:whitespace-normal transition-all">{msg.content}</td>
                                                <td className="p-6 text-sm text-slate-400 font-black">{new Date(msg.created_at).toLocaleDateString()}</td>
                                                <td className="p-6">
                                                    {msg.is_read ?
                                                        <span className="text-emerald-600 font-black text-[10px] bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">تمت القراءة</span> :
                                                        <span className="text-slate-400 font-black text-[10px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">لم تقرأ</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {messagesList.length === 0 && (
                                <div className="text-center py-24">
                                    <div className="text-6xl mb-4">🌑</div>
                                    <p className="text-slate-400 text-xl font-black">لا توجد مراسلات سابقة للعرض</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
