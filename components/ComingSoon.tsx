import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ComingSoon: React.FC = () => {
    const [wish, setWish] = useState('');
    const [dayName, setDayName] = useState('');

    useEffect(() => {
        const today = new Date();
        const month = today.getMonth(); // 0-indexed (1 is Feb)
        const date = today.getDate();

        if (month === 1) { // February
            switch (date) {
                case 7:
                    setDayName("Rose Day");
                    setWish("May your life be as beautiful and fragrant as a rose. 🌹");
                    break;
                case 8:
                    setDayName("Propose Day");
                    setWish("Express your love to the ones who matter most. 💍");
                    break;
                case 9:
                    setDayName("Chocolate Day");
                    setWish("Adding some sweetness to your day! 🍫 Follow us @stealdeals.co");
                    break;
                case 10:
                    setDayName("Teddy Day");
                    setWish("Sending you a warm bear hug! 🧸");
                    break;
                case 11:
                    setDayName("Promise Day");
                    setWish("We promise to bring you the best deals soon! 🤝");
                    break;
                case 12:
                    setDayName("Hug Day");
                    setWish("Embrace the joy of savings coming your way! 🤗");
                    break;
                case 13:
                    setDayName("Kiss Day");
                    setWish("Sealed with love and great anticipation! 💋");
                    break;
                case 14:
                    setDayName("Valentine's Day");
                    setWish("Celebrating love, friendship, and great shopping! ❤️");
                    break;
                default:
                    if (date >= 7 && date <= 14) {
                        // Covered by cases
                    } else {
                        setDayName("Valentine's Week Special");
                        setWish("Love is in the air, and so are great deals! ✨");
                    }
                    break;
            }
        } else {
            setDayName("Coming Soon");
            setWish("We are crafting something special just for you.");
        }
    }, []);

    // Helper to determine if we are in the specific week to show the special card
    const isValentinesWeek = () => {
        const today = new Date();
        return today.getMonth() === 1 && today.getDate() >= 7 && today.getDate() <= 14;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 font-serif">
            <div className="max-w-4xl mx-auto text-center relative z-10">

                {/* Elegant Decorative Elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-20 opacity-10 pointer-events-none">
                    <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#BE185D" d="M45.7,-76.3C58.9,-69.3,69.1,-58.3,77.3,-46.3C85.5,-34.3,91.7,-21.3,89.5,-9.3C87.3,2.7,76.7,13.7,68.2,25.4C59.7,37.1,53.3,49.5,43.3,58.6C33.3,67.7,19.7,73.5,4.8,65.2C-10.1,56.9,-26.3,34.5,-40.3,18.3C-54.3,2.1,-66.1,-7.9,-68.6,-20.9C-71.1,-33.9,-64.3,-49.9,-53.4,-57.8C-42.5,-65.7,-27.5,-65.5,-13.7,-64.7C0.1,-63.9,13.9,-62.5,27.7,-61.1L45.7,-76.3Z" transform="translate(100 100)" />
                    </svg>
                </div>

                {/* Main Content */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    {/* Logo / Brand Area */}
                    <div className="mb-10">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-rose-400 to-pink-600 rounded-full flex items-center justify-center shadow-xl mb-6">
                            <span className="text-3xl text-white">SD</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-white tracking-tight mb-2 font-sans">
                            Steal Deal
                        </h1>
                        <div className="h-1 w-24 bg-rose-500 mx-auto rounded-full my-4"></div>
                    </div>

                    {/* Valentine's Day Special Message */}
                    {isValentinesWeek() && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="mb-12 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-rose-100 dark:border-rose-900 max-w-lg mx-auto"
                        >
                            <span className="text-sm font-bold uppercase tracking-widest text-rose-500 mb-2 block">{dayName}</span>
                            <h2 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 italic font-serif leading-relaxed">
                                "{wish}"
                            </h2>
                        </motion.div>
                    )}

                    <h2 className="text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto font-sans tracking-wide">
                        Our premium collection is being curated. <br /> Something beautiful is on the horizon.
                    </h2>

                    {/* Notify / Action */}
                    <div className="flex justify-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                            onClick={() => window.location.reload()}
                        >
                            Explore
                        </motion.button>
                    </div>

                </motion.div>

                {/* Footer / Location */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="mt-16 text-gray-400 dark:text-gray-500 text-sm font-sans"
                >
                    <p>Steal Deal, Mumbai</p>
                </motion.div>
            </div>
        </div>
    );
};

export default ComingSoon;
