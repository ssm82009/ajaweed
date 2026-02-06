import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
    const [creds, setCreds] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:3001/api/admin/login', creds);
            if (res.data.success) {
                navigate('/admin/dashboard');
            } else {
                setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        } catch (err) {
            console.error(err);
            setError('فشل الاتصال بالخادم. تأكد من تشغيل ملف server/index.js');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2>دخول المسؤول</h2>
            <div className="input-group">
                <label>اسم المستخدم</label>
                <input type="text" value={creds.username} onChange={e => setCreds({ ...creds, username: e.target.value })} />
            </div>
            <div className="input-group">
                <label>كلمة المرور</label>
                <input type="password" value={creds.password} onChange={e => setCreds({ ...creds, password: e.target.value })} />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="primary-btn" onClick={handleLogin}>دخول</button>
            <button className="secondary-btn" onClick={() => navigate('/')}>عودة للرئيسية</button>
        </div>
    );
};

export default AdminLogin;
