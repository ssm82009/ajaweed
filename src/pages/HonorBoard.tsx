import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Star, Medal, Crown, Sparkles, Calendar, Shield } from 'lucide-react';

const HonorBoard = () => {
    const [honors, setHonors] = useState<any[]>([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHonors = async () => {
            try {
                const res = await axios.get('/api/honor');
                setHonors(res.data.data);
                setError(false);
            } catch (err) {
                console.error(err);
                setError(true);
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
        <div className="py-16 animate-entrance max-w-7xl mx-auto px-6 min-h-screen relative">

            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-amber-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-60"></div>
            </div>

            {/* Header Section */}
            <div className="text-center mb-28 space-y-8">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-sm animate-bounce-slow">
                    <Sparkles size={20} />
                    <span className="text-xs font-black tracking-[0.2em] uppercase">نفتخر بمبدعي الأجاويد</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
                    لوحة <span className="text-royal">الشرف</span> والتميّز
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-3xl mx-auto leading-relaxed h-auto opacity-80">
                    نحتفي بطلابنا المبدعين الذين رسموا طريق التميز بإرادتهم.
                    <span className="block text-primary/60 mt-2 font-black">بيئة تعليمية تصنع القادة!</span>
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="school-card p-10 h-[650px] animate-pulse">
                            <div className="w-full h-80 bg-slate-50 rounded-[2.5rem] mb-10 border border-slate-100"></div>
                            <div className="h-4 bg-slate-50 rounded-full w-3/4 mb-6"></div>
                            <div className="h-3 bg-slate-50 rounded-full w-full mb-3"></div>
                            <div className="h-3 bg-slate-50 rounded-full w-full mb-3"></div>
                            <div className="h-3 bg-slate-50 rounded-full w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="school-card py-32 text-center max-w-4xl mx-auto border-red-100 bg-red-50/30">
                    <div className="w-40 h-40 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-red-100 shadow-xl">
                        <Shield size={80} className="text-red-300" />
                    </div>
                    <h3 className="text-4xl font-black text-red-500">مشكلة في الاتصال</h3>
                    <p className="text-slate-400 font-bold mt-6 text-xl">تعذر جلب البيانات من الخادم، يرجى إعادة المحاولة لاحقاً</p>
                </div>
            ) : honors.length === 0 ? (
                <div className="school-card py-32 text-center max-w-4xl mx-auto border-dashed border-4 border-slate-200">
                    <div className="w-40 h-40 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-slate-100 shadow-inner group transition-transform hover:rotate-12 duration-500">
                        <Award size={80} className="text-slate-200" />
                    </div>
                    <h3 className="text-4xl font-black text-slate-300 text-center w-full">سجل التميز قيد التحديث</h3>
                    <p className="text-slate-400 font-bold mt-6 text-xl text-center w-full">كن أول من يسطر اسمه هنا بالاجتهاد والمثابرة!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {honors.map((item) => {
                        const style = categories[item.category as keyof typeof categories] || categories['other'];
                        return (
                            <div key={item.id} className="school-card p-0 group flex flex-col h-[650px] overflow-hidden hover:-translate-y-4 transition-all duration-700 shadow-2xl shadow-primary/5 border-none bg-white">

                                {/* Image Container */}
                                <div className="relative h-80 shrink-0 overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/40 to-transparent z-10"></div>
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
                                            <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${style.from} ${style.to} text-white shadow-2xl ${style.shadow} group-hover:scale-110 transition-transform`}>
                                                {style.icon}
                                            </div>
                                        </div>
                                    )}

                                    {/* Category Floating Badge */}
                                    <div className={`absolute bottom-8 right-8 z-20 px-4 py-2 rounded-[1.25rem] font-black text-sm shadow-xl backdrop-blur-xl border border-white/60 flex items-center gap-2 group-hover:scale-105 transition-transform
                                        ${style.color === 'amber' ? 'bg-amber-50/90 text-amber-700 border-amber-200' :
                                            style.color === 'blue' ? 'bg-indigo-50/90 text-indigo-700 border-indigo-200' :
                                                style.color === 'emerald' ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200' :
                                                    'bg-purple-50/90 text-purple-700 border-purple-200'}`}>
                                        {style.icon}
                                        {style.label}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-10 flex-1 flex flex-col relative -mt-10 bg-white z-20">
                                    <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight group-hover:text-primary transition-colors pt-6 drop-shadow-sm">
                                        {item.title}
                                    </h3>

                                    <div className={`w-20 h-2.5 bg-gradient-to-r ${style.from} ${style.to} rounded-full mb-8 shadow-sm`}></div>

                                    <p className="text-slate-500 leading-relaxed font-bold mb-10 flex-1 text-lg line-clamp-4 italic opacity-90">
                                        "{item.description}"
                                    </p>

                                    <div className="flex items-center justify-between text-slate-400 border-t pt-8 border-slate-50 mt-auto">
                                        <div className="flex items-center gap-3 font-black bg-slate-50/50 px-5 py-2.5 rounded-2xl border border-slate-100 text-sm">
                                            <Calendar size={18} className="text-primary/40" />
                                            {new Date(item.date).toLocaleDateString('ar-SA')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="font-black text-slate-300 uppercase tracking-widest text-[10px]">Al-Ajaweed School</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Indicator */}
                                <div className={`h-2.5 w-full bg-gradient-to-r ${style.from} ${style.to} opacity-10 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HonorBoard;
