/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,tsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1e3a8a',
                    dark: '#172554',
                    light: '#3b82f6',
                },
                secondary: '#f8fafc',
                accent: '#f59e0b',
            },
            fontFamily: {
                sans: ['Cairo', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
