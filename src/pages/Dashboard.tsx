import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, BookOpen, Medal, ArrowLeft, Star } from 'lucide-react';

const Dashboard = () => {
    const cards = [
        {
            to: "/attendance",
            title: "سجلات الحضور",
            description: "متابعة دقيقة للحضور والغياب اليومي للطلاب والتقارير",
            icon: <ClipboardList size={40} className="text-white" />,
            color: "from-emerald-500 to-teal-700",
            shadow: "shadow-emerald-500/40",
            delay: "0"
        },
        {
            to: "/notes",
            title: "ملاحظات المعلمين",
            description: "توثيق ومتابعة ملاحظات المعلمين والتواصل الفعال",
            icon: <BookOpen size={40} className="text-white" />,
            color: "from-primary-600 to-indigo-700",
            shadow: "shadow-primary-500/40",
            delay: "100"
        },
        {
            to: "/honor",
            title: "لوحة الشرف",
            description: "تكريم المتميزين وصناعة القدوة الحسنة للطلاب",
            icon: <Medal size={40} className="text-white" />,
            color: "from-amber-500 to-orange-600",
            shadow: "shadow-amber-500/40",
            delay: "200"
        }
    ];

    return (
        <div className="flex flex-col min-h-[85vh] justify-center items-center py-6 md:py-10 relative px-4 overflow-hidden">

            {/* Background Decorative Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animate-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-amber-200/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animate-delay-4000"></div>
            </div>

            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-4xl mx-auto mb-16 relative z-10 animate-fade-in">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm mb-4">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-slate-700">بوابة التواصل لمستقبلهم</span>
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                    نظام <span className="text-gradient">التواصل</span> المدرسي
                </h1>

                <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium px-2">
                    منصة متكاملة لتعزيز التواصل الفعال بين المدرسة والأسرة
                </p>
            </div>



            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4 relative z-10">
                {cards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.to}
                        className="group relative h-[280px] md:h-[320px] bg-white/70 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] shadow-premium hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden flex flex-col items-center justify-center text-center p-6 md:p-8 border border-white"
                        style={{ animationDelay: `${card.delay}ms` }}
                    >
                        <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${card.color}`}></div>
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                        <div className={`w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 rounded-2xl md:rounded-3xl bg-gradient-to-br ${card.color} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 shadow-xl ${card.shadow}`}>
                            {React.cloneElement(card.icon as React.ReactElement, { size: 32, className: "md:w-10 md:h-10 text-white" })}
                        </div>

                        <h3 className="text-xl md:text-2xl font-black text-slate-800 mb-2 md:mb-3 group-hover:text-primary-700 transition-colors">
                            {card.title}
                        </h3>
                        <p className="text-sm md:text-slate-600 font-medium leading-relaxed max-w-xs mx-auto opacity-80 group-hover:opacity-100 px-2">
                            {card.description}
                        </p>

                        <div className="mt-8 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                            <span className="text-primary-600 font-black flex items-center gap-2 text-sm bg-primary-50 px-5 py-2.5 rounded-full border border-primary-100">
                                دخول النظام <ArrowLeft size={16} />
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

        </div>
    );
};

export default Dashboard;
