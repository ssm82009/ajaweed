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
            color: "emerald",
            gradient: "from-emerald-500/10 to-teal-500/10",
            iconColor: "text-emerald-600",
            borderColor: "border-emerald-200/50",
            hoverBg: "hover:bg-emerald-50/50"
        },
        {
            to: "/notes",
            title: "ملاحظات المعلمين",
            description: "توثيق ومتابعة ملاحظات المعلمين والتواصل الفعال بين الكادر التعليمي",
            icon: <BookOpen size={32} />,
            color: "indigo",
            gradient: "from-indigo-500/10 to-blue-500/10",
            iconColor: "text-indigo-600",
            borderColor: "border-indigo-200/50",
            hoverBg: "hover:bg-indigo-50/50"
        },
        {
            to: "/honor",
            title: "لوحة الشرف",
            description: "تكريم המتميزين وصناعة القدوة الحسنة للطلاب وتشجيع الإبداع",
            icon: <Medal size={32} />,
            color: "amber",
            gradient: "from-amber-500/10 to-orange-500/10",
            iconColor: "text-amber-600",
            borderColor: "border-amber-200/50",
            hoverBg: "hover:bg-amber-50/50"
        },
        {
            to: "/exit/login",
            title: "نظام الاستئذان",
            description: "إدارة إلكترونية شاملة لطلبات استئذان الطلاب وخروجهم المبكر",
            icon: <LogOut size={32} />,
            color: "rose",
            gradient: "from-rose-500/10 to-pink-500/10",
            iconColor: "text-rose-600",
            borderColor: "border-rose-200/50",
            hoverBg: "hover:bg-rose-50/50"
        },
        {
            to: "/visiting",
            title: "سجل الزوار",
            description: "تنظيم وتوثيق احترافي لدخول وخروج زوار المدرسة مع إشعارات",
            icon: <UserPlus size={32} />,
            color: "sky",
            gradient: "from-sky-500/10 to-blue-500/10",
            iconColor: "text-sky-600",
            borderColor: "border-sky-200/50",
            hoverBg: "hover:bg-sky-50/50"
        }
    ];

    return (
        <div className="min-h-[90vh] pb-12 pt-8 md:pt-12 px-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-amber-100/10 rounded-full blur-[80px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Header Content */}
            <div className="max-w-6xl mx-auto mb-16 relative z-10 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm mb-4 animate-fade-in">
                    <LayoutDashboard size={18} className="text-primary-600" />
                    <span className="text-sm font-bold text-slate-700">لوحة التحكم الشاملة</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight animate-slide-up">
                    منصة <span className="text-primary-600">الأجاويد</span> الرقمية
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-4 opacity-90 animate-slide-up">
                    تحكم ذكي، تواصل فعال، وبيئة تعليمية متطورة في مكان واحد
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
                {cards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.to}
                        className={`group relative flex flex-col p-8 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border ${card.borderColor} shadow-premium hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${card.hoverBg} animate-fade-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Inner Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className={`w-16 h-16 mb-6 rounded-2xl ${card.iconColor} bg-white shadow-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                {card.icon}
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-primary-700 transition-colors">
                                {card.title}
                            </h3>

                            <p className="text-slate-600 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity mb-8">
                                {card.description}
                            </p>

                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-primary-600 font-bold text-sm bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-primary-50">
                                    دخول النظام
                                </span>
                                <div className={`p-2 rounded-full ${card.iconColor} bg-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500`}>
                                    <ArrowLeft size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Animated Bottom Bar */}
                        <div className={`absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full bg-gradient-to-r ${card.gradient.replace('/10', '')} transition-all duration-500`}></div>
                    </Link>
                ))}

                {/* Info Card / Notification Area */}
                <div className="md:col-span-2 lg:col-span-1 p-8 bg-primary-600 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500 animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform -rotate-12 transition-transform duration-700 group-hover:rotate-0">
                        <Bell size={120} className="text-white" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <h3 className="text-2xl font-black text-white mb-4">تحديثات النظام</h3>
                        <p className="text-primary-100 font-medium mb-6">
                            تم إضافة أنظمة الاستئذان وسجل الزوار الجديدة لتسهيل الإجراءات اليومية.
                        </p>
                        <div className="flex gap-2">
                            <div className="h-1.5 w-12 bg-white/40 rounded-full"></div>
                            <div className="h-1.5 w-6 bg-white/20 rounded-full"></div>
                            <div className="h-1.5 w-6 bg-white/20 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
