import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, BookOpen, Medal, Search } from 'lucide-react';

const Dashboard = () => {
    const [searchId, setSearchId] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Searching for:', searchId);
    };

    return (
        <div className="flex flex-col min-h-[85vh] justify-center items-center py-10 animate-fade-in relative px-4">

            {/* Decorative Blur Elements for "Filling" Voids */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* Hero Title - Centered and Big */}
            <div className="text-center space-y-6 max-w-4xl mx-auto mb-16 relative z-10">
                <h1 className="text-5xl md:text-7xl font-black text-text tracking-tight flex flex-col gap-2">
                    <span>نظام <span className="text-primary">التواصل</span> المدرسي</span>
                    <span className="text-2xl md:text-3xl text-text-light font-medium mt-2">بوابة المستقبل التعليمية</span>
                </h1>
            </div>

            {/* Main Grid - Spanning Width */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4 mb-16 relative z-10">

                {/* Attendance Card - Big & Bold */}
                <Link to="/attendance" className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-[300px] flex flex-col justify-center items-center text-center border-b-8 border-primary">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                    <div className="p-6 bg-primary/10 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                        <ClipboardList size={64} className="text-primary" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-800 mb-2">سجلات الحضور</h3>
                    <p className="text-gray-500 px-6">متابعة دقيقة للحضور والغياب والانضباط المدرسي</p>
                </Link>

                {/* Notes Card */}
                <Link to="/notes" className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-[300px] flex flex-col justify-center items-center text-center border-b-8 border-indigo-500">
                    <div className="absolute inset-0 bg-indigo-50/50 group-hover:bg-indigo-50 transition-colors"></div>
                    <div className="p-6 bg-indigo-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                        <BookOpen size={64} className="text-indigo-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-800 mb-2">ملاحظات المعلمين</h3>
                    <p className="text-gray-500 px-6">حلقة وصل فعالة بين المعلم والطالب وولي الأمر</p>
                </Link>

                {/* Honor Card */}
                <Link to="/honor" className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-[300px] flex flex-col justify-center items-center text-center border-b-8 border-yellow-400">
                    <div className="absolute inset-0 bg-yellow-50/50 group-hover:bg-yellow-50 transition-colors"></div>
                    <div className="p-6 bg-yellow-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Medal size={64} className="text-yellow-600" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-800 mb-2">لوحة الشرف</h3>
                    <p className="text-gray-500 px-6">تكريم المتميزين وصناعة القدوة الحسنة للطلاب</p>
                </Link>

            </div>

            {/* Search Bar - Prominent */}
            <div className="max-w-xl mx-auto transform hover:scale-105 transition-transform duration-300">
                <form onSubmit={handleSearch} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative flex bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden p-2 border border-white/50">
                        <input
                            type="text"
                            placeholder="أدخل رقم الهوية للاستعلام عن السجلات..."
                            className="flex-1 p-3 text-right bg-transparent border-none outline-none text-lg text-text placeholder-gray-400"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                        <button type="submit" className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-primary-dark transition-colors shadow-lg flex items-center gap-2">
                            <Search size={24} />
                            بحث
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Dashboard;
