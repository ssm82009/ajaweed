import { useState } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, Medal, MessageSquare, Users, Trash2, CheckCircle, Info, Sparkles, ChevronDown, Calendar } from 'lucide-react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState<'honor' | 'students' | 'teachers' | 'messages'>('students');

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

    const [honorList, setHonorList] = useState<any[]>([]);
    const [newHonor, setNewHonor] = useState({ title: '', description: '', category: 'academic' });
    const [honorImage, setHonorImage] = useState<File | null>(null);
    const [messagesList, setMessagesList] = useState<any[]>([]);

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
        <div className="py-16 animate-entrance max-w-7xl mx-auto px-6 min-h-screen">
            <div className="text-center mb-20 space-y-6">
                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
                    لوحة <span className="text-royal">التحكم</span> والإدارة
                </h1>
                <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed opacity-80">إدارة بيانات الطلاب، المعلمين، والمراسلات المدرسية والأنظمة التقنية للمدرسة</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center flex-wrap gap-6 mb-16">
                <button onClick={() => setActiveTab('students')} className={`px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-4 shadow-xl shadow-primary/5 ${activeTab === 'students' ? 'btn-school scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 hover:border-primary/20'}`}>
                    <Users size={24} /> إدارة الطلاب
                </button>
                <button onClick={() => setActiveTab('teachers')} className={`px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-4 shadow-xl shadow-primary/5 ${activeTab === 'teachers' ? 'bg-indigo-600 text-white scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 hover:border-indigo-200'}`}>
                    <Users size={24} /> إدارة المعلمين
                </button>
                <button onClick={() => { setActiveTab('honor'); loadData('honor'); }} className={`px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-4 shadow-xl shadow-amber-500/5 ${activeTab === 'honor' ? 'bg-amber-500 text-white scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 hover:border-amber-200'}`}>
                    <Medal size={24} /> لوحة الشرف
                </button>
                <button onClick={() => { setActiveTab('messages'); loadData('messages'); }} className={`px-12 py-5 rounded-[2rem] font-black transition-all flex items-center gap-4 shadow-xl shadow-emerald-500/5 ${activeTab === 'messages' ? 'bg-emerald-600 text-white scale-105' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100 hover:border-emerald-200'}`}>
                    <MessageSquare size={24} /> المراسلات
                </button>
            </div>

            <div className="school-card min-h-[600px] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] bg-white/90 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-20"></div>

                {/* Import Sections (Students/Teachers) */}
                {(activeTab === 'students' || activeTab === 'teachers') && (
                    <div className="max-w-4xl mx-auto space-y-16 animate-entrance py-12">
                        <div className="text-center space-y-6">
                            <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl transition-transform hover:rotate-12 duration-500 ${activeTab === 'students' ? 'bg-blue-50 text-primary border border-blue-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                <FileSpreadsheet size={56} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                استيراد بيانات {activeTab === 'students' ? 'الطلاب' : 'المعلمين'}
                            </h2>
                            <p className="text-slate-400 text-xl font-bold max-w-2xl mx-auto">تحديث قاعدة البيانات المركزية للمدرسة عبر ملفات Excel بشكل جماعي وتلقائي</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-200/50 shadow-inner ring-8 ring-slate-50/30">
                            <div className="space-y-6">
                                <h4 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-primary/5 rounded-lg"><Info size={24} className="text-primary" /></div>
                                    تعليمات الملف:
                                </h4>
                                <ul className="text-slate-500 font-bold space-y-4">
                                    <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                                        <CheckCircle size={18} className="text-emerald-500" />
                                        <span>صيغة الملف: <code className="bg-slate-100 px-3 py-1 rounded text-primary font-black">XLSX</code></span>
                                    </li>
                                    {activeTab === 'students' ? (
                                        <>
                                            <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الأول: الاسم الكامل للطالب</span></li>
                                            <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الثاني: رقم الهوية الوطنية (10 أرقام)</span></li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الأول: الاسم الكامل للمعلم</span></li>
                                            <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الثاني: رقم السجل المدني</span></li>
                                        </>
                                    )}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h4 className="font-black text-slate-800 invisible md:visible flex items-center gap-3 text-lg">&nbsp;</h4>
                                <ul className="text-slate-500 font-bold space-y-4">
                                    {activeTab === 'students' ? (
                                        <>
                                            <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الثالث: المرحلة والصف الدراسي</span></li>
                                            <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الرابع: رقم الفصل الدراسي</span></li>
                                        </>
                                    ) : (
                                        <li className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100"><CheckCircle size={18} className="text-emerald-500" /> <span>العمود الثالث: مادة التخصص والتدريس</span></li>
                                    )}
                                    <li className="flex items-center gap-3 px-4 py-3 bg-primary/5 text-primary text-sm rounded-xl border border-primary/10">
                                        <Sparkles size={18} className="shrink-0" />
                                        <span>سيقوم النظام بتحديث البيانات تلقائياً في حال وجود الرقم مسجلاً سابقاً</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-lg text-slate-500 file:ml-8 file:py-5 file:px-12 file:rounded-[1.5rem] file:border-0 file:bg-slate-900 file:text-white file:font-black file:text-lg hover:file:bg-black cursor-pointer bg-white border-4 border-slate-100 rounded-[2.5rem] p-3 h-24 shadow-sm focus-within:border-primary transition-all font-bold"
                                />
                                {!file && <div className="absolute right-60 top-1/2 -translate-y-1/2 text-slate-200 font-black pointer-events-none text-xl">لم يتم اختيار ملف بعد...</div>}
                            </div>

                            <button
                                onClick={() => handleUpload(activeTab === 'students' ? '/api/upload-students' : '/api/upload-teachers')}
                                disabled={!file || uploading}
                                className={`btn-school w-full py-7 rounded-[2rem] tracking-wide text-2xl font-black shadow-2xl transition-all active:scale-95 group ${activeTab === 'students' ? 'from-primary to-secondary' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent shadow-lg"></div>
                                        جاري تحليل ومعالجة البيانات...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-4">
                                        <Upload size={28} className="group-hover:-translate-y-1 transition-transform" />
                                        بدء عملية الربط والاستيراد
                                    </span>
                                )}
                            </button>
                        </div>

                        {message && (
                            <div className={`p-8 rounded-[2rem] font-black text-center flex items-center justify-center gap-4 animate-slide-up border-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100 shadow-xl shadow-emerald-500/5' : 'bg-red-50 text-red-800 border-red-100 shadow-xl shadow-red-500/5'}`}>
                                <div className={`p-3 rounded-2xl ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                    {message.type === 'success' ? <CheckCircle className="text-emerald-600" size={32} /> : <Info className="text-red-600" size={32} />}
                                </div>
                                <span className="text-2xl">{message.text}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Honor Board Tab */}
                {activeTab === 'honor' && (
                    <div className="animate-entrance grid lg:grid-cols-2 gap-20 p-6 md:p-12">
                        {/* Add New Honor Form */}
                        <div className="space-y-12">
                            <div className="flex items-center gap-5">
                                <div className="p-5 bg-amber-50 text-amber-600 rounded-[2rem] shadow-xl shadow-amber-500/10 border border-amber-100"><Medal size={40} /></div>
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">إضافة تكريم جديد</h3>
                            </div>

                            <form onSubmit={handleHonorSubmit} className="space-y-8 bg-slate-50/50 p-12 rounded-[3.5rem] border border-slate-200/50 shadow-inner ring-12 ring-slate-50/30">
                                <div className="space-y-4">
                                    <label className="block text-slate-500 font-black text-sm mr-4 uppercase tracking-[0.2em]">عنوان التكريم</label>
                                    <input type="text" placeholder="مثلاً: الطالب المتميز لهذا الشهر" className="w-full p-6 rounded-[1.75rem] border-4 border-white/60 bg-white/80 focus:bg-white focus:border-amber-400 outline-none transition-all font-black text-xl placeholder:text-slate-200 shadow-sm" value={newHonor.title} onChange={e => setNewHonor({ ...newHonor, title: e.target.value })} required />
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-slate-500 font-black text-sm mr-4 uppercase tracking-[0.2em]">التصنيف الرسمي</label>
                                    <div className="relative">
                                        <select className="w-full p-6 pr-8 rounded-[1.75rem] border-4 border-white/60 bg-white/80 focus:border-amber-400 outline-none font-black text-xl appearance-none shadow-sm cursor-pointer" value={newHonor.category} onChange={e => setNewHonor({ ...newHonor, category: e.target.value })}>
                                            <option value="academic">🌟 التميز الأكاديمي</option>
                                            <option value="activity">🏀 النشاطات والمواهب</option>
                                            <option value="behavior">🤝 السلوك والانضباط</option>
                                            <option value="other">🏆 إنجازات أخرى</option>
                                        </select>
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500"><ChevronDown size={24} /></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-slate-500 font-black text-sm mr-4 uppercase tracking-[0.2em]">نص وسبب التكريم</label>
                                    <textarea placeholder="اكتب تفاصيل الإنجاز والتميز بدقة..." className="w-full p-8 rounded-[2rem] border-4 border-white/60 bg-white/80 focus:bg-white focus:border-amber-400 outline-none h-48 resize-none font-bold text-xl leading-relaxed placeholder:text-slate-200 shadow-sm" value={newHonor.description} onChange={e => setNewHonor({ ...newHonor, description: e.target.value })} required></textarea>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-slate-500 font-black text-sm mr-4 uppercase tracking-[0.2em]">الصورة الشخصية</label>
                                    <div className="relative border-4 border-dashed border-amber-200 bg-white/60 backdrop-blur-sm rounded-[2rem] p-10 text-center group hover:border-amber-400 hover:bg-white transition-all cursor-pointer shadow-sm">
                                        <input type="file" onChange={e => setHonorImage(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        <div className="text-slate-300 group-hover:text-amber-500 font-black flex flex-col items-center gap-5 transition-colors">
                                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform"><Upload size={40} /></div>
                                            <span className="text-lg">{honorImage ? <span className="text-amber-600 font-black px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">{honorImage.name}</span> : 'اسحب الصورة هنا أو اضغط للاختيار'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-6 text-2xl bg-amber-500 hover:bg-amber-600 text-white rounded-[2rem] shadow-2xl shadow-amber-500/20 font-black mt-6 transition-all active:scale-95 flex items-center justify-center gap-4">
                                    <Sparkles size={28} /> نشر في منصة التميز
                                </button>
                            </form>
                        </div>

                        {/* Honor List Display */}
                        <div className="space-y-12">
                            <div className="flex items-center justify-between">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight">سجل المكرمين</h3>
                                <div className="bg-slate-50 px-6 py-2.5 rounded-full border border-slate-200 font-black text-slate-400 text-sm">{honorList.length} طالب مكرم</div>
                            </div>

                            <div className="space-y-6 max-h-[950px] overflow-y-auto pr-6 custom-scrollbar group">
                                {honorList.map((item) => (
                                    <div key={item.id} className="school-card p-0 overflow-hidden bg-white hover:-translate-x-2 transition-all duration-300 flex items-center border-slate-100 shadow-xl shadow-slate-200/50 group/item">
                                        <div className="w-32 h-40 shrink-0 relative overflow-hidden">
                                            {item.image_path ? (
                                                <img src={item.image_path} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt={item.title} />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200 font-black text-4xl border-l border-slate-100">{item.title.charAt(0)}</div>
                                            )}
                                            <div className="absolute top-0 right-0 p-3 bg-amber-500 text-white rounded-bl-3xl shadow-lg ring-4 ring-white/20"><Medal size={20} /></div>
                                        </div>

                                        <div className="p-8 flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-black text-slate-900 text-2xl group-hover/item:text-primary transition-colors">{item.title}</h4>
                                                <button onClick={() => handleDeleteHonor(item.id)} className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-sm ring-1 ring-slate-100" title="إلغاء التكريم">
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                            <p className="text-slate-500 font-bold line-clamp-2 text-lg mb-6 leading-relaxed opacity-80">{item.description}</p>
                                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black shadow-sm border
                                                ${item.category === 'academic' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    item.category === 'activity' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                        'bg-emerald-50 text-emerald-800 border-emerald-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.category === 'academic' ? 'bg-amber-500' : 'bg-primary-500'}`}></div>
                                                {item.category === 'academic' ? 'تميز أكاديمي رسمي' : item.category === 'activity' ? 'مواهب ونشاطات لاصفية' : 'انضباط وسلوك مثالي'}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {honorList.length === 0 && (
                                    <div className="text-center py-24 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-200/50">
                                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300 shadow-inner">
                                            <Medal size={48} />
                                        </div>
                                        <p className="text-slate-400 text-xl font-black">سجل التكريم فارغ حالياً</p>
                                        <p className="text-slate-300 font-bold mt-2">ابدأ بإضافة أول مكرم من القائمة الجانبية</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages/Notes Log Tab */}
                {activeTab === 'messages' && (
                    <div className="animate-entrance space-y-12 p-6 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b-4 border-slate-50 pb-12">
                            <div className="space-y-3">
                                <h3 className="text-5xl font-black text-slate-900 tracking-tight">رصد الملاحظات والرسائل</h3>
                                <p className="text-slate-400 text-xl font-bold">متابعة سجل التواصل اليومي بين الكادر التعليمي والطلاب</p>
                            </div>
                            <div className="bg-emerald-600 text-white px-12 py-7 rounded-[2.5rem] font-black shadow-2xl shadow-emerald-600/20 border-4 border-emerald-500/30 group">
                                <div className="text-center">
                                    <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{messagesList.length}</div>
                                    <div className="text-xs font-bold uppercase tracking-widest opacity-80">رسالة تم رصدها</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right border-collapse">
                                    <thead className="bg-slate-900 text-white h-24">
                                        <tr>
                                            <th className="px-8 font-black tracking-wider text-lg">المعلم</th>
                                            <th className="px-8 font-black tracking-wider text-lg">الطالب</th>
                                            <th className="px-8 font-black tracking-wider text-lg text-center">نوع الملاحظة</th>
                                            <th className="px-8 font-black tracking-wider text-lg">مختصر النص</th>
                                            <th className="px-8 font-black tracking-wider text-lg">التاريخ</th>
                                            <th className="px-8 font-black tracking-wider text-lg text-center">الحالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-2 divide-slate-50">
                                        {messagesList.map((msg) => (
                                            <tr key={msg.id} className="hover:bg-slate-50/80 transition-all group h-24 font-bold border-r-8 border-transparent hover:border-primary">
                                                <td className="px-8">
                                                    <div className="font-black text-primary text-xl mb-1">{msg.teacher_name}</div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{msg.teacher_subject}</div>
                                                </td>
                                                <td className="px-8 font-black text-slate-800 text-lg">{msg.student_name}</td>
                                                <td className="px-8 text-center">
                                                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black inline-flex items-center gap-2 border shadow-sm
                                                        ${msg.type === 'star' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            msg.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${msg.type === 'star' ? 'bg-amber-500' : msg.sentiment === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-sm`}></div>
                                                        {msg.type === 'star' ? '🌟 نجمة تميز' : msg.sentiment === 'positive' ? '✅ سلوك إيجابي' : '⚠️ بحاجة تطوير'}
                                                    </span>
                                                </td>
                                                <td className="px-8 text-slate-600 font-bold text-lg max-w-sm">
                                                    <div className="line-clamp-1 group-hover:line-clamp-none transition-all leading-relaxed bg-white/50 px-4 py-2 rounded-xl border border-slate-100 shadow-inner group-hover:shadow-md">
                                                        {msg.content}
                                                    </div>
                                                </td>
                                                <td className="px-8">
                                                    <div className="text-slate-400 font-black flex items-center gap-2 text-sm">
                                                        <Calendar size={18} className="opacity-40" />
                                                        {new Date(msg.created_at).toLocaleDateString('ar-SA')}
                                                    </div>
                                                </td>
                                                <td className="px-8 text-center">
                                                    {msg.is_read ?
                                                        <span className="text-emerald-500 font-black text-[10px] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 shadow-sm">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> تمت القراءة
                                                        </span> :
                                                        <span className="text-slate-300 font-black text-[10px] bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center justify-center gap-2">
                                                            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div> في الانتظار
                                                        </span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {messagesList.length === 0 && (
                                <div className="text-center py-40 bg-slate-50/50">
                                    <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl border border-slate-100 ring-20 ring-primary/5 group transition-transform hover:rotate-12 duration-500">
                                        <MessageSquare size={64} className="text-slate-200" />
                                    </div>
                                    <p className="text-slate-400 text-2xl font-black">سجل المراسلات خالي تماماً</p>
                                    <p className="text-slate-300 font-bold mt-4 text-lg">لم يتم رصد أي ملاحظات في قاعدة البيانات حتى هذه اللحظة</p>
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
