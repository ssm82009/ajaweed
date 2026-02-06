import { useState } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';

export default function ImportData() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/exit/import-students', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage(res.data.message);
            setFile(null);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || 'حدث خطأ أثناء الاستيراد';
            setMessage(`خطأ: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel animate-fade-in">
            <h2><FileSpreadsheet style={{ marginLeft: '10px', verticalAlign: 'middle' }} />استيراد بيانات الطلاب</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                قم برفع ملف Excel يحتوي على الأعمدة التالية: اسم الطالب، رقم الهوية، الصف، الفصل، رقم الجوال.
            </p>

            <div style={{
                border: '2px dashed #ccc',
                padding: '3rem',
                borderRadius: '16px',
                textAlign: 'center',
                background: file ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
            }}>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                    id="file-upload"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    {file ? <CheckCircle size={48} color="var(--success)" /> : <Upload size={48} color="var(--primary-color)" />}
                    <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                        {file ? file.name : 'اضغط هنا لاختيار الملف'}
                    </span>
                </label>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>
                    {loading ? 'جاري الرفع...' : 'استيراد البيانات'}
                </button>
            </div>

            {message && <p style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold', color: message.includes('خطأ') ? 'var(--danger)' : 'var(--success)' }}>{message}</p>}
        </div>
    );
}
