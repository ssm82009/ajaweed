import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 mt-auto py-8">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/exit/login"
                            className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1.5"
                        >
                            نظام الاستئذان
                        </Link>
                        <Link
                            to="/visiting"
                            className="text-xs font-medium text-slate-400 hover:text-sky-500 transition-colors flex items-center gap-1.5"
                        >
                            سجل الزوار
                        </Link>
                    </div>
                    <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                        <span>الحقوق الفكرية والبرمجية محفوظة لـ <span className="text-primary">ماجد عثمان الزهراني</span> © 2026</span>
                    </p>
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>نظام الإدارة المدرسية الموحد</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <span>v4.0.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
