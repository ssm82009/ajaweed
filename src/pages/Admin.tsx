import { useState } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, Medal, MessageSquare, Users } from 'lucide-react';

// Simplified Admin Dashboard merging previous Honor Board with new Teacher/Notes features
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
        try {
            const response = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMessage({ type: 'success', text: `تم الرفع بنجاح! عدد السجلات: ${response.data.success}` });
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
            alert('تمت الإضافة بنجاح');
            setNewHonor({ title: '', description: '', category: 'academic' });
            setHonorImage(null);
            loadData('honor');
        } catch (error) {
            alert('حدث خطأ أثناء الإضافة');
        }
    };

    const handleDeleteHonor = async (id: number) => {
        if (confirm('هل أنت متأكد من الحذف؟')) {
            try {
                await axios.post(`/api/honor/delete/${id}`);
                loadData('honor');
            } catch (error) { alert('فشل الحذف'); }
        }
    };

    return (
        <div className="py-12 animate-fade-in max-w-7xl mx-auto px-4 min-h-screen">
            <h1 className="text-4xl font-black text-primary-dark text-center mb-10">لوحة التحكم والإدارة</h1>

            {/* Tabs */}
            <div className="flex justify-center flex-wrap gap-4 mb-12">
                <button onClick={() => setActiveTab('students')} className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-primary text-white shadow-xl scale-105' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                    <Users size={20} /> إدارة الطلاب
                </button>
                <button onClick={() => setActiveTab('teachers')} className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'teachers' ? 'bg-primary text-white shadow-xl scale-105' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                    <Users size={20} /> إدارة المعلمين
                </button>
                <button onClick={() => { setActiveTab('honor'); loadData('honor'); }} className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'honor' ? 'bg-amber-500 text-white shadow-xl scale-105' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                    <Medal size={20} /> لوحة الشرف
                </button>
                <button onClick={() => { setActiveTab('messages'); loadData('messages'); }} className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'messages' ? 'bg-teal-600 text-white shadow-xl scale-105' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}>
                    <MessageSquare size={20} /> المراسلات
                </button>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 min-h-[500px]">

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="max-w-2xl mx-auto space-y-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-primary">
                            <FileSpreadsheet size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">استيراد بيانات الطلاب</h2>
                            <p className="text-gray-500">قم برفع ملف Excel يحتوي على بيانات الطلاب لتحديث قاعدة البيانات</p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-right">
                            <h4 className="font-bold text-gray-700 mb-2">تعليمات الملف:</h4>
                            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                                <li>صيغة الملف يجب أن تكون .xlsx</li>
                                <li>الأعمدة المطلوبة: (اسم الطالب), (رقم الهوية), (الصف), (الفصل)</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-primary file:text-white file:font-bold hover:file:bg-primary-dark cursor-pointer bg-gray-50 rounded-xl border border-gray-200" />
                            <button onClick={() => handleUpload('/api/upload-students')} disabled={!file || uploading} className="btn bg-green-600 hover:bg-green-700 text-white w-full py-4 rounded-xl text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                {uploading ? 'جاري الرفع والمعالجة...' : 'بدء رفع الملف'}
                            </button>
                        </div>

                        {message && <div className={`p-4 rounded-xl font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{message.text}</div>}
                    </div>
                )}

                {/* Teachers Tab */}
                {activeTab === 'teachers' && (
                    <div className="max-w-2xl mx-auto space-y-8 text-center animate-fade-in">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                            <FileSpreadsheet size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">استيراد بيانات المعلمين</h2>
                            <p className="text-gray-500">تحديث قاعدة بيانات الكادر التعليمي عبر ملف Excel</p>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-right">
                            <h4 className="font-bold text-gray-700 mb-2">تعليمات الملف:</h4>
                            <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                                <li>صيغة الملف يجب أن تكون .xlsx</li>
                                <li>الأعمدة المطلوبة: (اسم المعلم), (رقم الهوية), (مادة التدريس)</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white file:font-bold hover:file:bg-indigo-700 cursor-pointer bg-gray-50 rounded-xl border border-gray-200" />
                            <button onClick={() => handleUpload('/api/upload-teachers')} disabled={!file || uploading} className="btn bg-primary hover:bg-primary-dark text-white w-full py-4 rounded-xl text-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                {uploading ? 'جاري الرفع والمعالجة...' : 'بدء رفع الملف'}
                            </button>
                        </div>

                        {message && <div className={`p-4 rounded-xl font-bold ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>{message.text}</div>}
                    </div>
                )}

                {/* Honor Board Tab */}
                {activeTab === 'honor' && (
                    <div className="animate-fade-in">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Form */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <span className="bg-amber-100 text-amber-600 p-2 rounded-lg"><Medal size={24} /></span>
                                    إضافة طالب للوحة الشرف
                                </h3>
                                <form onSubmit={handleHonorSubmit} className="space-y-4 bg-gray-50 p-6 rounded-3xl border border-gray-200">
                                    <input type="text" placeholder="عنوان التكريم (مثلاً: الطالب المثالي)" className="w-full p-4 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all" value={newHonor.title} onChange={e => setNewHonor({ ...newHonor, title: e.target.value })} required />

                                    <select className="w-full p-4 rounded-xl border border-gray-200 focus:border-amber-500 outline-none bg-white" value={newHonor.category} onChange={e => setNewHonor({ ...newHonor, category: e.target.value })}>
                                        <option value="academic">التميز الدراسي</option>
                                        <option value="activity">النشاط اللاصفي</option>
                                        <option value="behavior">الانضباط والسلوك</option>
                                        <option value="other">إنجازات أخرى</option>
                                    </select>

                                    <textarea placeholder="وصف الإنجاز..." className="w-full p-4 rounded-xl border border-gray-200 focus:border-amber-500 outline-none h-32 resize-none" value={newHonor.description} onChange={e => setNewHonor({ ...newHonor, description: e.target.value })} required></textarea>

                                    <div className="relative border-2 border-dashed border-amber-200 bg-amber-50 rounded-xl p-4 text-center cursor-pointer hover:bg-amber-100 transition-colors">
                                        <input type="file" onChange={e => setHonorImage(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        <div className="text-amber-800 font-bold flex flex-col items-center gap-2">
                                            <Upload size={24} />
                                            <span>{honorImage ? honorImage.name : 'اضغط لاختيار صورة الطالب'}</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn bg-amber-500 hover:bg-amber-600 text-white w-full py-4 text-lg rounded-xl shadow-lg">حفظ ونشر في اللوحة</button>
                                </form>
                            </div>

                            {/* List */}
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-6">قائمة المكرمين الحالية</h3>
                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {honorList.map((item) => (
                                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                {item.image_path ? (
                                                    <img src={item.image_path} className="w-16 h-16 rounded-xl object-cover" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Medal /></div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 inline-block ${item.category === 'academic' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {item.category === 'academic' ? 'تميز دراسي' : item.category === 'activity' ? 'نشاط' : 'سلوك'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteHonor(item.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                حذف
                                            </button>
                                        </div>
                                    ))}
                                    {honorList.length === 0 && <p className="text-gray-400 text-center py-10">لا يوجد بيانات حالياً</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Tab */}
                {activeTab === 'messages' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800">سجل المراسلات والملاحظات</h3>
                                <p className="text-gray-500">مراقبة جميع الملاحظات المرسلة بين المعلمين والطلاب</p>
                            </div>
                            <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl font-bold">
                                {messagesList.length} رسالة مسجلة
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 text-gray-500 font-bold">
                                    <tr>
                                        <th className="p-4 rounded-r-xl">المعلم المرسل</th>
                                        <th className="p-4">الطالب المستلم</th>
                                        <th className="p-4">نوع الملاحظة</th>
                                        <th className="p-4">نص الرسالة</th>
                                        <th className="p-4">التاريخ</th>
                                        <th className="p-4 rounded-l-xl">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {messagesList.map((msg) => (
                                        <tr key={msg.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-gray-800">{msg.teacher_name || 'غير معروف'}</td>
                                            <td className="p-4 text-gray-600">{msg.student_name || 'غير معروف'}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold 
                                                    ${msg.type === 'positive' ? 'bg-green-100 text-green-700' :
                                                        msg.type === 'negative' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'}`}>
                                                    {msg.type === 'positive' ? 'إيجابية' : msg.type === 'negative' ? 'تطويرية' : 'نجمة تميز'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600 max-w-xs truncate">{msg.content}</td>
                                            <td className="p-4 text-sm text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {msg.is_read ?
                                                    <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">مقروءة</span> :
                                                    <span className="text-gray-400 text-xs font-bold bg-gray-100 px-2 py-1 rounded">جديدة</span>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
