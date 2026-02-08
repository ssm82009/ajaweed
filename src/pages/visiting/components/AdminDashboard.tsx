import '../../../assets/styles/visiting.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'report' | 'settings' | 'qr'>('report');
    const [visits, setVisits] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>({});
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));

    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Load data
    useEffect(() => {
        loadSettings(); // Always load settings to get header title
    }, []);

    useEffect(() => {
        if (tab === 'report') loadVisits();
    }, [tab, dateFilter]);

    const loadVisits = async () => {
        try {
            const res = await axios.get(`/api/visiting/admin/visits?date=${dateFilter}`);
            setVisits(res.data);
        } catch (err) { console.error(err); }
    };

    const loadSettings = async () => {
        try {
            const res = await axios.get('/api/visiting/admin/settings');
            setSettings(res.data);
        } catch (err) { console.error(err); }
    };

    const saveSettings = async () => {
        try {
            await axios.post('/api/visiting/admin/settings', settings);
            alert('تم الحفظ بنجاح');
        } catch (err) { alert('خطأ في الحفظ'); }
    };

    const printReport = () => {
        window.print();
    };

    const exitLink = `${window.location.protocol}//${window.location.host}/exit`;

    return (
        <div className="visiting-system-scope">
            <div className="dashboard-container">
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ margin: 0 }}>لوحة التحكم</h1>
                    <button className="secondary-btn" onClick={() => navigate('/visiting')} style={{ margin: 0 }}>خروج</button>
                </div>

                <div className="tabs no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button className={`tab-btn ${tab === 'report' ? 'active' : ''}`} onClick={() => setTab('report')}>التقرير اليومي</button>
                    <button className={`tab-btn ${tab === 'qr' ? 'active' : ''}`} onClick={() => setTab('qr')}>كود الخروج</button>
                    <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>الإعدادات</button>
                </div>

                {tab === 'report' && (
                    <div className="report-section">
                        <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', justifyContent: 'center' }}>
                            <label>تاريخ التقرير:</label>
                            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: 'auto' }} />
                            <button className="primary-btn" onClick={printReport} style={{ width: 'auto', padding: '0.5rem 1rem' }}>طباعة التقرير</button>
                        </div>

                        {/* Print Header */}
                        <div className="print-only header-print" style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {settings.header_title}
                            </div>
                            <br />
                        </div>

                        <div className="print-only" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h1 style={{ textDecoration: 'underline', margin: '1rem 0', fontSize: '28px', fontWeight: 'bold' }}>التقرير اليومي للزوار ({dateFilter})</h1>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }} className="report-table">
                            <thead>
                                <tr style={{ background: '#334155' }}>
                                    <th style={{ width: '5%' }}>#</th>
                                    <th style={{ width: '20%' }}>الاسم</th>
                                    <th style={{ width: '15%' }}>الهوية</th>
                                    <th style={{ width: '12%' }}>الجوال</th>
                                    <th style={{ width: '13%' }}>السبب</th>
                                    <th style={{ width: '10%' }}>الدخول</th>
                                    <th style={{ width: '10%' }}>الخروج</th>
                                    <th style={{ width: '5%' }}>الإقرار</th>
                                    <th style={{ width: '10%' }}>التوقيع</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visits.map((v) => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #475569' }}>
                                        <td>{v.serial_number}</td>
                                        <td>{v.visitor_name}</td>
                                        <td>{v.id_number}</td>
                                        <td>{v.mobile_number}</td>
                                        <td>{v.reason}</td>
                                        {/* Appending 'Z' to treat SQLite time as UTC, ensuring correct local time conversion */}
                                        <td>{new Date(v.check_in_time + 'Z').toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td>{v.check_out_time ? new Date(v.check_out_time + 'Z').toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                        <td>تم</td>
                                        <td>
                                            {v.signature ? (
                                                <img src={v.signature} alt="sig" style={{ maxHeight: '40px', maxWidth: '100px', display: 'block', margin: '0 auto' }} />
                                            ) : '-'}
                                        </td>
                                    </tr>
                                ))}
                                {visits.length === 0 && (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد زيارات مسجلة لهذا اليوم</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'qr' && (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h2>رمز الاستجابة السريعة (QR) للخروج</h2>
                        <p>قم بطباعة هذا الرمز وتعليقه عند بوابة الخروج</p>

                        <div style={{ background: 'white', padding: '2rem', width: 'fit-content', margin: '2rem auto', borderRadius: '12px' }}>
                            <QRCode value={exitLink} size={250} />
                        </div>

                        <p style={{ direction: 'ltr', fontFamily: 'monospace', color: '#94a3b8' }}>{exitLink}</p>
                        <button className="primary-btn" onClick={printReport}>طباعة الصفحة</button>

                        {/* Print Version of QR Page */}
                        <div className="print-only" style={{ marginTop: '2rem' }}>
                            <h3>امسح الكود لتسجيل الخروج</h3>
                        </div>
                    </div>
                )}

                {tab === 'settings' && (
                    <div className="card">
                        <h2>الإعدادات العامة</h2>

                        <div className="input-group">
                            <label>نص الهيدر (العنوان)</label>
                            <textarea
                                rows={4}
                                value={settings.header_title || ''}
                                onChange={e => setSettings({ ...settings, header_title: e.target.value })}
                            />
                        </div>

                        <h2>إعدادات الرسائل النصية (SMS)</h2>
                        <div className="input-group">
                            <label>تفعيل الرسائل</label>
                            <select
                                value={settings.sms_enabled || 'false'}
                                onChange={e => setSettings({ ...settings, sms_enabled: e.target.value })}
                                style={{ width: '100%', padding: '0.8rem', background: '#0f172a', color: 'white', border: '2px solid #334155', borderRadius: '0.75rem' }}
                            >
                                <option value="false">إيقاف (محاكاة)</option>
                                <option value="true">تفعيل (المدار)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>مفتاح API (Almadar)</label>
                            <input
                                type="text"
                                value={settings.sms_api_key || ''}
                                onChange={e => setSettings({ ...settings, sms_api_key: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label>اسم المرسل (Sender Name)</label>
                            <input
                                type="text"
                                value={settings.sms_sender || ''}
                                onChange={e => setSettings({ ...settings, sms_sender: e.target.value })}
                            />
                        </div>

                        <button className="primary-btn" onClick={saveSettings}>حفظ الإعدادات</button>
                    </div>
                )}

                <style>{`
                    .dashboard-container {
                        max-width: 900px;
                        margin: 0 auto;
                        padding: 1rem;
                    }
                    .tab-btn {
                        background: transparent;
                        border: none;
                        color: #94a3b8;
                        padding: 0.5rem 1rem;
                        cursor: pointer;
                        font-size: 1.1rem;
                        border-bottom: 2px solid transparent;
                    }
                    .tab-btn.active {
                        color: white;
                        border-color: #4F46E5;
                    }
                    .report-table th, .report-table td {
                        padding: 0.75rem;
                        text-align: right;
                    }
                    .print-only { display: none; }
                    @media print {
                        @page { size: portrait; margin: 0mm; } 
                        /* 0mm page margin gives us full control via body padding */

                        .no-print, .app-header { display: none !important; }
                        .print-only { display: block !important; }
                        
                        /* Enable background colors */
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }

                        body { 
                            background: white; 
                            color: black; 
                            margin: 0; 
                            display: block !important;
                            height: auto !important;
                            min-height: 0 !important;
                            padding: 10mm; /* 1cm padding on all sides */
                        }

                        #root, .app-container {
                            width: 100% !important;
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        
                        .dashboard-container {
                            max-width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100%;
                        }

                        .report-table { 
                            color: black !important; 
                            width: 100% !important; 
                            border-collapse: collapse;
                            border: 2px solid black; 
                            font-size: 12px;
                        }
                        .report-table th { 
                            background-color: #e2e8f0 !important; /* Visible generic gray for bw/color */
                            color: black !important; 
                            border: 1px solid black; 
                            text-align: center;
                        } 
                        .report-table td { 
                            border: 1px solid black; 
                            text-align: center;
                            vertical-align: middle;
                        }
                        .report-table tr { 
                            border: 1px solid black !important; 
                            break-inside: avoid;
                        }
                        
                        h1, h2, h3 { color: black !important; text-align: center; margin: 0.5rem 0; }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AdminDashboard;
