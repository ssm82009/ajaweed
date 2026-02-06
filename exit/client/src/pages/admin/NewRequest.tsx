import React, { useState } from 'react';
import axios from 'axios';
import SignaturePad from '../../components/SignaturePad';
import { Search, UserCheck, Upload } from 'lucide-react';

export default function NewRequest() {
    const [searchParams, setSearchParams] = useState({
        name: '',
        id_number: '',
        mobile: '',
        grade: '',
        class_name: ''
    });
    const [filters, setFilters] = useState<{ grades: string[], classes: string[] }>({ grades: [], classes: [] });
    const [results, setResults] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [formData, setFormData] = useState({
        departure_with: '',
        reason: '',
        officer_name: '',
        signature: ''
    });
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !formData.signature) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/permissions', {
                student_id: selectedStudent.id,
                reason: formData.reason,
                departure_with: formData.departure_with,
                officer_name: formData.officer_name,
                signature_data: formData.signature
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage('تم إرسال طلب الاستئذان بنجاح');
            setSelectedStudent(null);
            setFormData({ departure_with: '', reason: '', officer_name: '', signature: '' });
            setResults([]);
            setSearchParams({ name: '', id_number: '', mobile: '', grade: '', class_name: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            alert('حدث خطأ');
        }
    };

    // Load filters
    React.useEffect(() => {
        const fetchFilters = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/students/filters', { headers: { Authorization: `Bearer ${token}` } });
                setFilters(res.data);
            } catch (err) { console.error(err); }
        };
        fetchFilters();
    }, []);

    const search = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow empty search to show all
        // if (!Object.values(searchParams).some(val => val)) return;

        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams(searchParams as any).toString();
            const res = await axios.get(`/api/students/search?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResults(res.data);
            setSelectedStudent(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearchChange = (key: string, value: string) => {
        setSearchParams(prev => ({ ...prev, [key]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:3000/api/import-students', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage(res.data.message);
            // Reload filters after import
            const resFilters = await axios.get('/api/students/filters', { headers: { Authorization: `Bearer ${token}` } });
            setFilters(resFilters.data);
            setTimeout(() => setMessage(''), 5000);
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.message || err.message || 'حدث خطأ أثناء الاستيراد';
            setMessage(`خطأ: ${errorMsg}`);
        }
    };

    return (
        <div className="glass-panel animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2><UserCheck style={{ marginLeft: '10px' }} />طلب استئذان جديد</h2>
                <div>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="import-btn"
                    />
                    <label htmlFor="import-btn" className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: 'var(--primary-color)', cursor: 'pointer' }}>
                        <Upload size={16} /> استيراد بيانات
                    </label>
                </div>
            </div>

            {/* Search Section */}
            <div style={{ marginBottom: '2rem' }}>
                <form onSubmit={search} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                    <div>
                        <label>اسم الطالب</label>
                        <input value={searchParams.name} onChange={e => handleSearchChange('name', e.target.value)} placeholder="بحث بالاسم..." />
                    </div>
                    <div>
                        <label>رقم الهوية</label>
                        <input value={searchParams.id_number} onChange={e => handleSearchChange('id_number', e.target.value)} placeholder="بحث بالهوية..." />
                    </div>
                    <div>
                        <label>رقم الجوال</label>
                        <input value={searchParams.mobile} onChange={e => handleSearchChange('mobile', e.target.value)} placeholder="بحث بالجوال..." />
                    </div>
                    <div>
                        <label>الصف</label>
                        <select value={searchParams.grade} onChange={e => handleSearchChange('grade', e.target.value)}>
                            <option value="">الكل</option>
                            {filters.grades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>الفصل</label>
                        <select value={searchParams.class_name} onChange={e => handleSearchChange('class_name', e.target.value)}>
                            <option value="">الكل</option>
                            {filters.classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '46px' }}><Search size={18} /> بحث</button>
                </form>

                {results.length > 0 && !selectedStudent && (
                    <div style={{ marginTop: '1rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px' }}>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th>اسم الطالب</th>
                                    <th>رقم الهوية</th>
                                    <th>رقم الجوال</th>
                                    <th>الصف</th>
                                    <th>الفصل</th>
                                    <th>اختيار</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.name}</td>
                                        <td>{s.id_number}</td>
                                        <td>{s.mobile}</td>
                                        <td>{s.grade}</td>
                                        <td>{s.class_name}</td>
                                        <td>
                                            <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedStudent(s)}>
                                                اختيار
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Section */}
            {selectedStudent && (
                <form onSubmit={handleSubmit} className="animate-fade-in" style={{ borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label>الطالب المستأذن</label>
                            <input value={selectedStudent.name} disabled style={{ background: '#f9fafb' }} />
                        </div>
                        <div>
                            <label>الصف / الفصل</label>
                            <input value={`${selectedStudent.grade} - ${selectedStudent.class_name}`} disabled style={{ background: '#f9fafb' }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label>الانصراف المبكر مع</label>
                            <input value={formData.departure_with} onChange={e => setFormData({ ...formData, departure_with: e.target.value })} required placeholder="مثال: ولي الأمر" />
                        </div>
                        <div>
                            <label>سبب الاستئذان</label>
                            <input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label>اسم المسؤول</label>
                            <input value={formData.officer_name} onChange={e => setFormData({ ...formData, officer_name: e.target.value })} required />
                        </div>
                        <div>
                            <label>توقيع المسؤول</label>
                            <SignaturePad onEnd={(sig) => setFormData({ ...formData, signature: sig })} />
                            <input type="hidden" required value={formData.signature} /> {/* For validation */}
                        </div>
                    </div>

                    <div className="flex-center">
                        <button type="submit" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
                            إرسال
                        </button>
                    </div>
                </form>
            )}

            {message && <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--success)', color: 'white', borderRadius: '8px', textAlign: 'center' }}>{message}</div>}
        </div>
    );
}
