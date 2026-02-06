import { Link } from 'react-router-dom';
import {
    ClipboardList,
    BookOpen,
    Medal,
    ArrowLeft,
    LogOut,
    UserPlus,
    LayoutDashboard,
    Bell
} from 'lucide-react';

const Dashboard = () => {
    const cards = [
        {
            to: "/attendance",
            title: "سجلات الحضور",
            description: "متابعة دقيقة للحضور والغياب اليومي للطلاب والتقارير المتقدمة",
            icon: <ClipboardList size={32} />,
            accent: "bg-emerald-600",
            lightAccent: "bg-emerald-50",
            textColor: "text-emerald-950"
        },
        {
            to: "/notes",
            title: "ملاحظات المعلمين",
            description: "توثيق ومتابعة ملاحظات المعلمين والتواصل الفعال بين الكادر التعليمي",
            icon: <BookOpen size={32} />,
            accent: "bg-indigo-600",
            lightAccent: "bg-indigo-50",
            textColor: "text-indigo-950"
        },
        {
            to: "/honor",
            title: "لوحة الشرف",
            description: "تكريم المتميزين وصناعة القدوة الحسنة للطلاب وتشجيع الإبداع",
            icon: <Medal size={32} />,
            accent: "bg-amber-600",
            lightAccent: "bg-amber-50",
            textColor: "text-amber-950"
        },
        {
            to: "/exit/login",
            title: "نظام الاستئذان",
            description: "إدارة إلكترونية شاملة لطلبات استئذان الطلاب وخروجهم المبكر",
            icon: <LogOut size={32} />,
            accent: "bg-rose-600",
            lightAccent: "bg-rose-50",
            textColor: "text-rose-950"
        },
        {
            to: "/visiting",
            title: "سجل الزوار",
            description: "تنظيم وتوثيق احترافي لدخول وخروج زوار المدرسة مع إشعارات",
            icon: <UserPlus size={32} />,
            accent: "bg-sky-600",
            lightAccent: "bg-sky-50",
            textColor: "text-sky-950"
        }
    ];

    return (
        <div className="min-h-screen py-16 px-4 animate-entrance">
            <div className="max-w-6xl mx-auto">

                {/* Clean Header */}
                <div className="text-center mb-24 space-y-8">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-slate-100 shadow-sm transform transition-all hover:scale-105">
                        <LayoutDashboard size={18} className="text-primary" />
                        <span className="text-sm font-black text-slate-800 tracking-tight uppercase">النظام الموحد للإدارة المدرسية</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
                        منصة <span className="text-royal">الأجاويد</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-bold leading-relaxed opacity-80">
                        نظام متكامل يجمع كافة الخدمات المدرسية في واجهة واحدة ذكية وغنية بالتفاصيل
                    </p>
                </div>

                {/* Solid Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {cards.map((card, index) => (
                        <Link
                            key={index}
                            to={card.to}
                            className="school-card group flex flex-col items-center text-center p-12 relative"
                        >
                            {/* Icon Container with Glass Effect */}
                            <div className={`w-24 h-24 mb-10 rounded-[2.5rem] ${card.accent} flex items-center justify-center text-white shadow-2xl shadow-primary/20 transform group-hover:rotate-12 transition-all duration-500`}>
                                {card.icon}
                            </div>

                            <h3 className="text-3xl font-black mb-6 group-hover:text-primary transition-colors">
                                {card.title}
                            </h3>

                            <p className="text-slate-500 font-bold leading-relaxed mb-12 opacity-90">
                                {card.description}
                            </p>

                            {/* Call to Action */}
                            <div className="mt-auto w-full">
                                <span className="btn-school w-full group-hover:px-10 transition-all duration-300">
                                    دخول النظام <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                                </span>
                            </div>

                            {/* Decorative Background Blob */}
                            <div className={`absolute -bottom-12 -left-12 w-48 h-48 ${card.lightAccent} rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 -z-10`}></div>
                        </Link>
                    ))}

                    {/* Announcement Card - High Contrast Official */}
                    <div className="md:col-span-2 lg:col-span-1 school-card bg-primary border-none p-12 flex flex-col justify-between text-white group overflow-hidden shadow-2xl shadow-primary/40">
                        <div className="absolute top-0 right-0 p-10 opacity-10 transform scale-150 rotate-12 transition-transform duration-700 group-hover:rotate-0">
                            <Bell size={200} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                <Bell size={32} className="text-amber-300" />
                            </div>
                            <h3 className="text-4xl font-black text-white !important">إعلانات هامة</h3>
                            <p className="text-blue-100 text-xl font-bold leading-relaxed">
                                تم تفعيل كافة الأنظمة الجديدة. يرجى مراجعة التقارير اليومية لضمان دقة البيانات المحفوظة.
                            </p>
                        </div>

                        <div className="relative z-10 flex gap-3 mt-16">
                            <div className="h-2 w-20 bg-white rounded-full"></div>
                            <div className="h-2 w-6 bg-white/30 rounded-full hover:bg-white/50 cursor-pointer transition-colors"></div>
                            <div className="h-2 w-6 bg-white/30 rounded-full hover:bg-white/50 cursor-pointer transition-colors"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
