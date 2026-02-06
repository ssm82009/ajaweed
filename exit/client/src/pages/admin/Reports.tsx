import { useEffect, useState } from 'react';
import axios from 'axios';
import { Printer, Search } from 'lucide-react';

export default function Reports() {
    const [dailyPermissions, setDailyPermissions] = useState<any[]>([]);
    const [studentId, setStudentId] = useState('');
    const [studentHistory, setStudentHistory] = useState<any>(null);
    const [tab, setTab] = useState<'daily' | 'individual'>('daily');

    const [headerSettings, setHeaderSettings] = useState<any>({});

    useEffect(() => {
        if (tab === 'daily') {
            fetchDaily();
            fetchSettings();
        }
    }, [tab]);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
            setHeaderSettings(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchDaily = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/permissions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDailyPermissions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const searchStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/student/${studentId}/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudentHistory(res.data);
            fetchSettings(); // Also fetch settings for individual report
        } catch (err) {
            alert('لم يتم العثور على الطالب');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const ReportHeader = () => (
        <div className="report-header" style={{ display: 'none', position: 'absolute', top: 0, right: 0, padding: '2rem', textAlign: 'right', fontSize: '0.8rem', lineHeight: '1.5', zIndex: 10 }}>
            {headerSettings.header_line1 && <div>{headerSettings.header_line1}</div>}
            {headerSettings.header_line2 && <div>{headerSettings.header_line2}</div>}
            {headerSettings.header_line3 && <div>{headerSettings.header_line3}</div>}
            {headerSettings.header_line4 && <div style={{ fontWeight: 'bold' }}>{headerSettings.header_line4}</div>}
        </div>
    );

    return (
        <div className="glass-panel animate-fade-in" style={{ position: 'relative' }}>
            <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${tab === 'daily' ? 'btn-primary' : ''}`}
                    onClick={() => setTab('daily')}
                    style={{ background: tab !== 'daily' ? 'transparent' : undefined, border: tab !== 'daily' ? '1px solid #ccc' : undefined, color: tab !== 'daily' ? '#666' : undefined }}
                >
                    التقرير اليومي
                </button>
                <button
                    className={`btn ${tab === 'individual' ? 'btn-primary' : ''}`}
                    onClick={() => setTab('individual')}
                    style={{ background: tab !== 'individual' ? 'transparent' : undefined, border: tab !== 'individual' ? '1px solid #ccc' : undefined, color: tab !== 'individual' ? '#666' : undefined }}
                >
                    تقرير طالب فردي
                </button>
            </div>

            {tab === 'daily' ? (
                <div className="printable-area">
                    <ReportHeader />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ width: '100%', textAlign: 'center', marginTop: '2rem' }}>التقرير اليومي للاستئذان</h2>
                        <button className="btn btn-primary no-print" onClick={handlePrint} style={{ position: 'absolute', left: 0, top: 0 }}><Printer size={18} /> طباعة</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>اسم الطالب</th>
                                <th>الصف</th>
                                <th>الفصل</th>
                                <th>وقت الخروج</th>
                                <th>سبب الخروج</th>
                                <th>الحالة</th>
                                <th>اسم المسؤول</th>
                                <th>التوقيع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyPermissions.map(p => (
                                <tr key={p.id}>
                                    <td>{p.student_name}</td>
                                    <td>{p.grade}</td>
                                    <td>{p.class_name}</td>
                                    <td>{p.exit_time ? new Date(p.exit_time).toLocaleTimeString('ar-SA') : '-'}</td>
                                    <td>{p.reason}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            background: p.status === 'confirmed' ? '#e5e7eb' : '#d1fae5',
                                            color: p.status === 'confirmed' ? '#374151' : '#065f46',
                                            fontWeight: 'bold'
                                        }}>
                                            {p.status === 'confirmed' ? 'تم الخروج' : 'جاري الانتظار'}
                                        </span>
                                    </td>
                                    <td>{p.officer_name}</td>
                                    <td><img src={p.signature_data} alt="sig" style={{ maxHeight: '40px' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>
                    <div className="no-print">
                        <form onSubmit={searchStudent} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <input
                                placeholder="أدخل رقم الهوية"
                                value={studentId}
                                onChange={e => setStudentId(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary"><Search size={18} /> عرض</button>
                        </form>
                    </div>

                    {studentHistory && (
                        <div className="printable-area animate-fade-in">
                            <ReportHeader />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ width: '100%', textAlign: 'center', marginTop: '2rem' }}>سجل استئذانات الطالب: {studentHistory.student.name}</h3>
                                <button className="btn btn-primary no-print" onClick={handlePrint} style={{ position: 'absolute', left: 0, top: 0 }}><Printer size={18} /> طباعة</button>
                            </div>
                            <div style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px' }}>
                                <div><strong>رقم الهوية:</strong> {studentHistory.student.id_number}</div>
                                <div><strong>الصف:</strong> {studentHistory.student.grade}</div>
                                <div><strong>الفصل:</strong> {studentHistory.student.class_name}</div>
                                <div><strong>عدد مرات الاستئذان:</strong> {studentHistory.permissions.length}</div>
                            </div>

                            <table>
                                <thead>
                                    <tr>
                                        <th>تاريخ الطلب</th>
                                        <th>سبب الخروج</th>
                                        <th>المستلم</th>
                                        <th>وقت الخروج الفعلي</th>
                                        <th>المسؤول</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentHistory.permissions.map((p: any) => (
                                        <tr key={p.id}>
                                            <td>{new Date(p.created_at).toLocaleDateString('ar-SA')}</td>
                                            <td>{p.reason}</td>
                                            <td>{p.departure_with}</td>
                                            <td>{p.exit_time ? new Date(p.exit_time).toLocaleTimeString('ar-SA') : 'لم يخرج'}</td>
                                            <td>{p.officer_name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @media print {
          @page { size: landscape; }
          .no-print { display: none !important; }
          .glass-panel { box-shadow: none; border: none; }
          body { background: white; }
          .printable-area { width: 100%; }
          .report-header { display: block !important; }
        }
      `}</style>
        </div>
    );
}
