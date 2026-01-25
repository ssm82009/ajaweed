import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Star, Medal, Crown, Sparkles, Calendar } from 'lucide-react';

const HonorBoard = () => {
    const [honors, setHonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHonors = async () => {
            try {
                const res = await axios.get('/api/honor');
                setHonors(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHonors();
    }, []);

    const categories = {
        'academic': { label: 'التميز الدراسي', icon: <Crown size={24} />, color: 'amber', from: 'from-amber-400', to: 'to-amber-600', shadow: 'shadow-amber-500/20' },
        'activity': { label: 'النشاط اللاصفي', icon: <Medal size={24} />, color: 'blue', from: 'from-indigo-400', to: 'to-blue-600', shadow: 'shadow-blue-500/20' },
        'behavior': { label: 'الانضباط والسلوك', icon: <Star size={24} />, color: 'emerald', from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/20' },
        'other': { label: 'إنجازات أخرى', icon: <Award size={24} />, color: 'purple', from: 'from-purple-400', to: 'to-fuchsia-600', shadow: 'shadow-purple-500/20' }
    };

    return (
        <div className="py-16 animate-fade-in max-w-7xl mx-auto px-4 min-h-screen relative">

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {/* Header Section */}
            <div className="text-center mb-24 space-y-6">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-sm animate-bounce-slow">
                    <Sparkles size={20} />
                    <span className="text-sm font-black tracking-widest uppercase">لوحة النجوم والمتميزين</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-none">
                    لوحة <span className="text-gradient">الشرف</span> والتميّز
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed h-auto">
                    نحتفي بطلابنا المبدعين الذين رسموا طريق التميز بإرادتهم.
                    <span className="block text-primary-600 mt-2">بيئة تعليمية تصنع القادة!</span>
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[3rem] p-8 h-[550px] shadow-premium border border-slate-50 animate-pulse">
                            <div className="w-full h-64 bg-slate-100 rounded-[2rem] mb-8"></div>
                            <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-4"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-full mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-full mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : honors.length === 0 ? (
                <div className="text-center py-32 bg-white/60 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-100 shadow-premium max-w-4xl mx-auto">
                    <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 border border-slate-100 shadow-inner">
                        <Award size={80} className="text-slate-200" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-300">لم يتم إضافة متميزين بعد</h3>
                    <p className="text-slate-400 font-bold mt-4">كن أول من يسطر اسمه هنا بالاجتهاد والمثابرة!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
                    {honors.map((item) => {
                        const style = categories[item.category as keyof typeof categories] || categories['other'];
                        return (
                            <div key={item.id} className="group relative bg-white/90 backdrop-blur-md rounded-[3rem] shadow-premium border border-white overflow-hidden hover:-translate-y-4 transition-all duration-500 hover:shadow-2xl flex flex-col h-[600px]">

                                {/* Top Image Section */}
                                <div className="relative h-72 overflow-hidden shrink-0">
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white via-white/40 to-transparent z-10"></div>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${style.from} ${style.to} opacity-10 group-hover:opacity-20 transition-opacity z-0`}></div>

                                    {item.image_path ? (
                                        <img
                                            src={item.image_path}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 relative z-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).onerror = null;
                                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=random&size=512`;
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-50 relative z-0">
                                            <div className={`p-8 rounded-[2rem] bg-gradient-to-br ${style.from} ${style.to} text-white shadow-xl ${style.shadow}`}>
                                                {style.icon}
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Badge - Glassmorphic */}
                                    <div className={`absolute bottom-6 right-6 z-20 px-3 py-1.5 rounded-xl font-black text-xs shadow-lg backdrop-blur-xl border border-white/40 flex items-center gap-1.5 group-hover:scale-110 transition-transform
                                        ${style.color === 'amber' ? 'bg-amber-100/90 text-amber-700' :
                                            style.color === 'blue' ? 'bg-indigo-100/90 text-indigo-700' :
                                                style.color === 'emerald' ? 'bg-emerald-100/90 text-emerald-800' :
                                                    'bg-purple-100/90 text-purple-700'}`}>
                                        {style.icon}
                                        {style.label}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-10 flex-1 flex flex-col relative z-20 -mt-10">
                                    <div className={`absolute top-4 left-10 w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-3xl transform -rotate-6 group-hover:rotate-0 transition-transform border border-slate-50`}>
                                        {style.color === 'amber' ? '✨' : style.color === 'blue' ? '🚀' : style.color === 'emerald' ? '🤝' : '🎖️'}
                                    </div>

                                    <h3 className="text-3xl font-black text-slate-800 mb-4 leading-tight group-hover:text-primary-600 transition-colors pt-4">
                                        {item.title}
                                    </h3>

                                    <div className={`w-16 h-2 bg-gradient-to-r ${style.from} ${style.to} rounded-full mb-6`}></div>

                                    <p className="text-slate-500 leading-relaxed font-bold mb-8 flex-1 text-lg line-clamp-4">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between text-slate-400 border-t pt-6 border-slate-100">
                                        <div className="flex items-center gap-3 font-bold bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                            <Calendar size={18} className="text-primary-400" />
                                            {new Date(item.date).toLocaleDateString('ar-SA')}
                                        </div>
                                        <div className="font-black text-primary-600/60 uppercase tracking-widest text-xs">Ajaweed School</div>
                                    </div>
                                </div>

                                {/* Bottom Decorative Line */}
                                <div className={`h-2 w-full bg-gradient-to-r ${style.from} ${style.to}`}></div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HonorBoard;
