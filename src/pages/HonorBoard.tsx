import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Star, Medal, Crown } from 'lucide-react';

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
        'academic': { label: 'التميز الدراسي', icon: <Crown size={24} />, color: 'amber' },
        'activity': { label: 'النشاط اللاصفي', icon: <Medal size={24} />, color: 'blue' },
        'behavior': { label: 'الانضباط والسلوك', icon: <Star size={24} />, color: 'emerald' },
        'other': { label: 'إنجازات أخرى', icon: <Award size={24} />, color: 'purple' }
    };

    return (
        <div className="py-12 animate-fade-in max-w-7xl mx-auto px-4">

            {/* Header Section */}
            <div className="text-center mb-16 space-y-4 relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-100 rounded-full blur-3xl -z-10 opacity-50"></div>
                <h1 className="text-5xl font-black text-primary-dark tracking-tight drop-shadow-sm flex items-center justify-center gap-4">
                    <span className="text-amber-500 text-6xl">✨</span>
                    لوحة الشرف والتميز
                    <span className="text-amber-500 text-6xl">✨</span>
                </h1>
                <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
                    نفخر بطلابنا المتميزين الذين يسطرون قصص النجاح في مدرستنا.
                    <span className="block text-amber-600 font-bold mt-2">هنا نحتفي بإنجازاتهم!</span>
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl p-6 h-96 shadow-sm border border-gray-100 animate-pulse">
                            <div className="w-full h-48 bg-gray-200 rounded-2xl mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : honors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="text-7xl mb-6 grayscale opacity-50">🏆</div>
                    <h3 className="text-2xl font-bold text-gray-400">لا توجد سجلات في لوحة الشرف حالياً</h3>
                    <p className="text-gray-400 mt-2">سيتم إضافة المتميزين قريباً...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {honors.map((item) => {
                        const style = categories[item.category as keyof typeof categories] || categories['other'];
                        return (
                            <div key={item.id} className="group relative bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl flex flex-col h-full">

                                {/* Image Design */}
                                <div className="relative h-64 overflow-hidden bg-gray-50">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>

                                    {item.image_path ? (
                                        <img
                                            src={item.image_path}
                                            alt={item.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).onerror = null;
                                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Honor+Student&background=random&size=400';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                                            <Award size={64} className="text-primary/20" />
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-full font-bold text-sm shadow-lg backdrop-blur-md flex items-center gap-2
                                        ${style.color === 'amber' ? 'bg-amber-100/90 text-amber-800' :
                                            style.color === 'blue' ? 'bg-blue-100/90 text-blue-800' :
                                                style.color === 'emerald' ? 'bg-emerald-100/90 text-emerald-800' :
                                                    'bg-purple-100/90 text-purple-800'}`}>
                                        {style.icon}
                                        {style.label}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col relative bg-white">
                                    {/* Decorative Icon Watermark */}
                                    <div className="absolute top-4 left-4 opacity-5 transform rotate-12 pointer-events-none">
                                        <Crown size={80} />
                                    </div>

                                    <h3 className="text-2xl font-black text-gray-800 mb-3 leading-tight group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>

                                    <div className="w-12 h-1 bg-amber-400 rounded-full mb-4"></div>

                                    <p className="text-gray-600 leading-relaxed font-medium mb-6 flex-1 text-lg">
                                        {item.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-400 border-t pt-4 border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <span className="bg-gray-100 p-1 rounded">📅</span>
                                            {new Date(item.date).toLocaleDateString('ar-SA')}
                                        </div>
                                        <div className="font-bold text-primary/80">مدرسة الأجاويد</div>
                                    </div>
                                </div>

                                {/* Bottom Color Sentinel */}
                                <div className={`h-2 w-full ${style.color === 'amber' ? 'bg-amber-500' : style.color === 'blue' ? 'bg-blue-500' : style.color === 'emerald' ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HonorBoard;
