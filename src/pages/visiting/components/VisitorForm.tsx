import '../../../assets/styles/visiting.css';
import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VisitorForm: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const sigPad = useRef<SignatureCanvas>(null);
    const [errors, setErrors] = useState<string>('');

    const [formData, setFormData] = useState({
        visitor_name: '',
        id_number: '',
        mobile_number: '',
        reason: '',
        declaration: false,
        signature: '',
    });

    const [verificationCode, setVerificationCode] = useState('');
    const [userCode, setUserCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Fix Canvas coordinates for mouse/touch
    useEffect(() => {
        if (step === 7) {
            // Small delay to ensure the element is rendered and has size
            const timer = setTimeout(() => {
                const canvas = sigPad.current?.getCanvas();
                if (canvas) {
                    const ratio = Math.max(window.devicePixelRatio || 1, 1);
                    canvas.width = canvas.offsetWidth * ratio;
                    canvas.height = canvas.offsetHeight * ratio;
                    canvas.getContext("2d")?.scale(ratio, ratio);
                    sigPad.current?.clear(); // Clear to initialize with correct size
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Use the hostname of the current page to determine the backend IP (assuming running on same machine)
    const API_URL = `/api/visiting`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors('');
    };

    const nextStep = async () => {
        if (await validateStep()) {
            setStep((prev) => prev + 1);
        }
    };

    const validateStep = async () => {
        switch (step) {
            case 1: // Name
                if (formData.visitor_name.length < 3) return setError('الرجاء إدخال الاسم كاملاً');
                break;
            case 2: // ID
                if (formData.id_number.length < 5) return setError('الرجاء إدخال رقم هوية صحيح');
                break;
            case 3: // Mobile
                if (formData.mobile_number.length < 9) return setError('الرجاء إدخال رقم جوال صحيح');
                break;
            case 4: // Verify Code
                try {
                    const res = await axios.post(`${API_URL}/verify-otp`, {
                        mobile_number: formData.mobile_number,
                        code: userCode
                    });
                    if (!res.data.success) return setError('الرمز غير صحيح');
                } catch (e) {
                    return setError('الرمز غير صحيح أو متنهي الصلاحية');
                }
                break;
            case 5: // Reason
                if (formData.reason.length < 3) return setError('الرجاء كتابة سبب الزيارة');
                break;
            case 6: // Declaration
                if (!formData.declaration) return setError('يجب الموافقة على الإقرار للمتابعة');
                break;
        }
        return true;
    };

    const setError = (msg: string) => {
        setErrors(msg);
        return false;
    };

    const startVerification = async () => {
        setIsVerifying(true);
        try {
            const res = await axios.post(`${API_URL}/send-otp`, { mobile_number: formData.mobile_number });
            if (res.data.success) {
                if (res.data.debug_code) {
                    alert(`(محاكاة) رمز التحقق هو: ${res.data.debug_code}`);
                } else {
                    alert('تم إرسال رمز التحقق إلى جوالك');
                }
                setVerificationCode(res.data.debug_code);
                setStep(4);
            } else {
                setError('فشل إرسال الرمز');
            }
        } catch (err) {
            console.error(err);
            setError('حدث خطأ في الاتصال');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!sigPad.current || sigPad.current.isEmpty()) {
            alert('الرجاء التوقيع في المربع المخصص قبل التأكيد');
            return;
        }

        setLoading(true);

        try {
            // Capture signature
            const sigData = sigPad.current.toDataURL('image/png');

            const res = await axios.post(`${API_URL}/check-in`, {
                ...formData,
                signature: sigData
            }, { timeout: 20000 }); // 20 seconds timeout

            console.log('Success:', res.data);
            navigate('/visiting/success', { state: { serial: res.data.serial_number } });
        } catch (err: any) {
            console.error("Save failed:", err);
            setLoading(false);

            let msg = 'حدث خطأ غير معروف';
            if (err.code === 'ECONNABORTED') msg = 'انتهت مهلة الاتصال (بطء الشبكة)';
            else if (err.response) msg = err.response.data.error || err.message;
            else msg = err.message;

            alert(`فشل الحفظ في النظام: ${msg}\n\nيرجى المحاولة مرة أخرى.`);
            // Do NOT navigate to success on error, so we don't create "fake" visits
        }
    };

    return (
        <div className="visiting-system-scope">
            <div className="card">
                {step > 0 && (
                    <div className="step-indicator">
                        {[1, 2, 3, 4, 5, 6, 7].map(s => (
                            <div key={s} className={`step-dot ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`} />
                        ))}
                    </div>
                )}

                {step === 0 && (
                    <div style={{ textAlign: 'center' }}>
                        <h1>نظام زائر المدرسي</h1>
                        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>تسجيل الدخول بيسر وأمان</p>
                        <button className="primary-btn" onClick={() => setStep(1)}>بدء تسجيل زائر</button>
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <h2>أهلاً بك</h2>
                        <div className="input-group">
                            <label>اسم الزائر</label>
                            <input
                                type="text"
                                name="visitor_name"
                                value={formData.visitor_name}
                                onChange={handleChange}
                                autoFocus
                                placeholder="الاسم الثلاثي"
                            />
                        </div>
                        <button className="primary-btn" onClick={nextStep}>التالي</button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2>رقم الهوية</h2>
                        <div className="input-group">
                            <label>السجل المدني / الإقامة</label>
                            <input
                                type="number"
                                name="id_number"
                                value={formData.id_number}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>
                        <button className="primary-btn" onClick={nextStep}>التالي</button>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2>رقم الجوال</h2>
                        <div className="input-group">
                            <label>مثال: 0501234567</label>
                            <input
                                type="tel"
                                name="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>
                        <button className="primary-btn" onClick={startVerification} disabled={isVerifying}>
                            {isVerifying ? 'جاري إرسال الرمز...' : 'إرسال رمز التحقق'}
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div>
                        <h2>التحقق</h2>
                        <div className="input-group">
                            <label>أدخل الكود المرسل لجوالك <small style={{ color: '#818cf8' }}>({verificationCode})</small></label>
                            <input
                                type="number"
                                value={userCode}
                                onChange={(e) => setUserCode(e.target.value)}
                                autoFocus
                                placeholder="----"
                            />
                        </div>
                        <button className="primary-btn" onClick={nextStep}>تحقق</button>
                    </div>
                )}

                {step === 5 && (
                    <div>
                        <h2>سبب الزيارة</h2>
                        <div className="input-group">
                            <label>السبب</label>
                            <input
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                autoFocus
                            />
                        </div>
                        <button className="primary-btn" onClick={nextStep}>التالي</button>
                    </div>
                )}

                {step === 6 && (
                    <div>
                        <h2>إقرار هام</h2>
                        <div className="declaration-box">
                            أقر بالعلم أن عقوبة الاعتداء على المعلم أو المعلمة بأي شكل من أشكال الاعتداء سواءً الاعتداء اللفظي أو الجسدي أو عبر وسائل الإعلام أو التواصل الاجتماعي ؛ يُعاقب المعتدي بغرامة تصل إلى مليون ريال والسجن 10 سنوات. كما أقر بالعلم بمنع التصوير والتسجيل داخل المنشأة التعليمية
                        </div>
                        <div className="input-group">
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={formData.declaration}
                                    onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })}
                                />
                                <span>قرأت وأتعهد بما ورد أعلاه</span>
                            </label>
                        </div>
                        <button className="primary-btn" onClick={nextStep}>التالي</button>
                    </div>
                )}

                {step === 7 && (
                    <div>
                        <h2>تأكيد البيانات والتوقيع</h2>
                        <div className="confirmation-box">
                            <p><strong>الاسم:</strong> {formData.visitor_name}</p>
                            <p><strong>الهوية:</strong> {formData.id_number}</p>
                            <p><strong>سبب الزيارة:</strong> {formData.reason}</p>
                        </div>

                        <div className="input-group center-items">
                            <label>التوقيع:</label>
                            <div className="signature-pad">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor="#1e3a8a"
                                    canvasProps={{ className: 'sigCanvas' }}
                                />
                            </div>
                            <button className="secondary-btn" onClick={() => sigPad.current?.clear()}>مسح التوقيع</button>
                        </div>

                        {errors && <div className="error-msg" style={{ marginBottom: '1rem', fontWeight: 'bold' }}>{errors}</div>}
                        <button className="primary-btn" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'جاري التسجيل...' : 'تأكيد الزيارة'}
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.3 }}>
                    <small onClick={() => navigate('/visiting/exit')}>تسجيل خروج (QR Scan)</small>
                </div>
            </div>
        </div>
    );
};

export default VisitorForm;
