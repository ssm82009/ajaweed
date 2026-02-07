import '../../../assets/styles/visiting.css';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SuccessPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { serial } = location.state || { serial: '---' };

    return (
        <div className="visiting-system-scope">
            <div className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                <h2>تم التسجيل بنجاح</h2>
                <p>الرقم التسلسلي للزائر</p>
                <div style={{
                    background: '#fff',
                    color: '#333',
                    padding: '1rem',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    borderRadius: '0.5rem',
                    margin: '2rem 0',
                    letterSpacing: '2px'
                }}>
                    {serial}
                </div>
                <p className="pulse-text" style={{ color: '#fca5a5', fontWeight: 'bold' }}>يرجى إبراز شاشة جوالك لرجل الأمن</p>

                <button className="primary-btn" onClick={() => navigate('/')}>عودة للرئيسية</button>
            </div>
        </div>
    );
};

export default SuccessPage;
