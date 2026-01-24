import { School } from 'lucide-react';

const Header = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto py-4 px-6 flex justify-between items-center">
                {/* Left Side (Logo/Brand) */}
                <div className="hidden md:flex flex-col items-center">
                    <div className="text-primary font-bold text-xl flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <School size={32} className="text-primary" />
                        </div>
                    </div>
                </div>

                {/* Right Side (Official Data) */}
                <div className="text-right">
                    <h4 className="font-bold text-sm md:text-base text-primary-dark">المملكة العربية السعودية</h4>
                    <h4 className="font-bold text-sm md:text-base text-text">وزارة التعليم</h4>
                    <h4 className="font-bold text-sm md:text-base text-text">الإدارة العامة للتعليم بمحافظة جدة</h4>
                    <h4 className="font-bold text-sm md:text-base text-primary">مدرسة الأجاويد الأولى المتوسطة</h4>
                </div>
            </div>
        </header>
    );
};

export default Header;
