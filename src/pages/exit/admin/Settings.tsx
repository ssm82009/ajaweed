import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Lock, Layout, CheckCircle } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        header_line1: '',
        header_line2: '',
        header_line3: '',
        header_line4: ''
    });
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/exit/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data) setSettings(prev => ({ ...prev, ...res.data }));
        } catch (err) { console.error(err); }
    };

    const handleSettingsSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/exit/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('تم حفظ إعدادات الهيدر بنجاح');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || err.message || 'فشل حفظ الإعدادات';
            setError(errMsg);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setError('كلمات المرور غير متطابقة');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/exit/change-password', {
                password: passwords.current, // API might not verify current password if logic is simplified, but let's assume security best practice. Wait, index.js implementation only takes newPassword? Let's check. 
                // Checking index.js: app.post('/api/exit/change-password', ... const { newPassword } = req.body; ... const hash = await bcrypt.hash(newPassword, 10);
                // It does NOT verify old password in the code I saw earlier. It relies on being authenticated.
                // I will just send newPassword.
                newPassword: passwords.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('تم تغيير كلمة المرور بنجاح');
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('حدث خطأ أثناء تغيير كلمة المرور');
        }
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layout /> الإعدادات العامة
            </h2>

            {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> {message}</div>}
            {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

            <div style={{ display: 'grid', gap: '2rem' }}>
                <section style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>تخصيص الهيدر (الترويسة)</h3>
                    <form onSubmit={handleSettingsSave}>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label>السطر الأول</label>
                                <input value={settings.header_line1} onChange={e => setSettings({ ...settings, header_line1: e.target.value })} placeholder="المملكة العربية السعودية" />
                            </div>
                            <div>
                                <label>السطر الثاني</label>
                                <input value={settings.header_line2} onChange={e => setSettings({ ...settings, header_line2: e.target.value })} placeholder="وزارة التعليم" />
                            </div>
                            <div>
                                <label>السطر الثالث</label>
                                <input value={settings.header_line3} onChange={e => setSettings({ ...settings, header_line3: e.target.value })} placeholder="الإدارة العامة..." />
                            </div>
                            <div>
                                <label>السطر الرابع</label>
                                <input value={settings.header_line4} onChange={e => setSettings({ ...settings, header_line4: e.target.value })} placeholder="اسم المدرسة" />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary"><Save size={18} /> حفظ التغييرات</button>
                            </div>
                        </div>
                    </form>
                </section>

                <section style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={18} /> الأمان وتغيير كلمة المرور
                    </h3>
                    <form onSubmit={handlePasswordChange}>
                        {/* Note: The API only requires new password as per current view, but for UX adding current/confirm is good practice even if backend handles less */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label>كلمة المرور الجديدة</label>
                                <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} required minLength={6} />
                            </div>
                            <div>
                                <label>تأكيد كلمة المرور</label>
                                <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} required minLength={6} />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ background: 'var(--warning)', color: 'white' }}>تغيير كلمة المرور</button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
