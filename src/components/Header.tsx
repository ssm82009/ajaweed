import { School, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="glass sticky top-0 z-50 border-b border-white/20 transition-all duration-300">
            <div className="container mx-auto py-3 px-6">
                <div className="flex justify-between items-center">

                    {/* Brand / Logo */}
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="bg-gradient-to-tr from-primary-600 to-primary-400 p-3 rounded-2xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                            <School size={28} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-display font-bold text-xl text-slate-800 leading-tight group-hover:text-primary-700 transition-colors">
                                مدرسة الأجاويد
                            </h1>
                            <span className="text-xs text-slate-500 font-medium">بوابة المستقبل التعليمية</span>
                        </div>
                    </Link>

                    {/* Official Data - Desktop */}
                    <div className="hidden md:flex flex-col items-end text-xs font-semibold text-slate-600 opacity-80 select-none">
                        <span>المملكة العربية السعودية</span>
                        <span>وزارة التعليم</span>
                        <span>الإدارة العامة للتعليم بمحافظة جدة</span>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-slate-100 animate-slide-up">
                        <div className="flex flex-col gap-2">
                            <div className="text-center text-xs text-slate-400 mb-2">بيانات رسمية</div>
                            <div className="text-center text-slate-600 text-sm">المملكة العربية السعودية</div>
                            <div className="text-center text-slate-600 text-sm">وزارة التعليم</div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
