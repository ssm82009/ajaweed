import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import QRCode from 'react-qr-code';

const ExitScanner: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [msg, setMsg] = useState('جاري تسجيل الخروج...');
    // const [debugIp, setDebugIp] = useState('');

    // Auto-checkout on component mount
    useEffect(() => {
        handleCheckout();
    }, []);

    const handleCheckout = async () => {
        try {
            // Determine API URL based on current window location
            const API_URL = `http://${window.location.hostname}:3001/api`;

            const res = await axios.post(`${API_URL}/check-out-ip`);
            setStatus('success');
            setMsg(`تم تسجيل الخروج بنجاح. شكراً لزيارتكم.\nالرقم التسلسلي: ${res.data.serial_number}`);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            if (err.response && err.response.status === 404) {
                setMsg('لم يتم العثور على زيارة نشطة لهذا الجهاز.\nتأكد من أنك متصل بنفس شبكة WiFi الخاصة بالمدرسة.');
            } else {
                setMsg('حدث خطأ أثناء الاتصال بالنظام.');
            }
        }
    };

    // Helper to print the QR code that visitors should scan
    // const exitLink = `${window.location.protocol}//${window.location.host}/exit`;

    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <h2>تسجيل الخروج الذكي</h2>

            <div style={{ margin: '2rem 0', minHeight: '100px', alignContent: 'center' }}>
                {status === 'loading' && <div className="spinner"></div>}
                <p style={{
                    whiteSpace: 'pre-line',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: status === 'success' ? '#4ade80' : status === 'error' ? '#f87171' : 'white'
                }}>
                    {status === 'loading' ? 'جاري التحقق من هويتك...' : msg}
                </p>
            </div>

            <button className="primary-btn" onClick={() => navigate('/')}>العودة للرئيسية</button>
        </div>
    );
};

export default ExitScanner;
