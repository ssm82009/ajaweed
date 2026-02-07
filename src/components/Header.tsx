import { Menu, X, Landmark, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 transition-all duration-300">
            <div className="container mx-auto py-4 px-6">
                <div className="flex justify-between items-center">

                    {/* Brand / Logo */}
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="bg-gradient-to-tr from-primary to-secondary p-3.5 rounded-[1.25rem] shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-300">
                            <Landmark size={28} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-display font-black text-2xl text-primary leading-tight tracking-tight">
                                مدرسة الأجاويد
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <GraduationCap size={14} className="text-secondary" />
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">بوابة المستقبل التعليمية</span>
                            </div>
                        </div>
                    </Link>

                    {/* Official Data - Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex flex-col items-end text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] select-none border-r-2 border-slate-100 pr-4">
                            <span>المملكة العربية السعودية</span>
                            <span>وزارة التعليم</span>
                        </div>
                        <div className="text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                            الإدارة العامة للتعليم بمحافظة جدة
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-slate-100 animate-entrance">
                        <div className="flex flex-col gap-3 py-2">
                            <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest text-center">بيانات رسمية</div>
                                <div className="text-center text-slate-800 font-bold text-sm">وزارة التعليم - جدة</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
