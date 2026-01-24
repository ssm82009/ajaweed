
const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto py-6">
            <div className="container mx-auto text-center">
                <p className="text-text-light font-medium flex items-center justify-center gap-2">
                    <span>الحقوق الفكرية والبرمجية محفوظة لـ <span className="text-primary font-bold">ماجد عثمان الزهراني</span> © 2026</span>
                    <a href="/admin" className="opacity-0 hover:opacity-10 w-2 h-2">.</a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
