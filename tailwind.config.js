/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: 'hsl(235, 85%, 97%)',
                    100: 'hsl(235, 85%, 93%)',
                    200: 'hsl(235, 85%, 85%)',
                    300: 'hsl(235, 85%, 75%)',
                    400: 'hsl(235, 85%, 65%)',
                    500: 'hsl(235, 85%, 60%)', // Primary
                    600: 'hsl(235, 85%, 50%)',
                    700: 'hsl(235, 85%, 40%)',
                    800: 'hsl(235, 85%, 30%)',
                    900: 'hsl(235, 85%, 15%)',
                },
                surface: {
                    light: 'hsl(230, 20%, 98%)',
                    dark: 'hsl(230, 25%, 8%)',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'Inter', 'sans-serif'],
            },
            boxShadow: {
                'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 5px 15px -5px rgba(0, 0, 0, 0.03)',
                'premium-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -10px rgba(0, 0, 0, 0.05)',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            },
            animation: {
                'blob': 'blob 7s infinite',
                'shimmer': 'shimmer 2s infinite',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                }
            }
        },
    },
    plugins: [],
}
