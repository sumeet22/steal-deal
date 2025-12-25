import React from 'react';
import { motion } from 'framer-motion';

const ComingSoon: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 px-4">
            <div className="max-w-4xl mx-auto text-center">
                {/* Animated Logo/Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", duration: 1, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12">
                        <svg className="w-16 h-16 text-white transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </motion.div>

                {/* Christmas Greeting */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.3 }}
                    className="mb-6 flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800/50 mx-auto max-w-md"
                >
                    <div className="text-4xl mb-2 animate-bounce">🎄 🎅 🎁</div>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 font-serif italic">
                        Merry Christmas!
                    </h2>
                    <p className="text-red-500/80 dark:text-red-300 text-sm mt-1">
                        Wishing all our customers a season full of joy!
                    </p>
                </motion.div>

                {/* Main Text */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h1 className="text-5xl sm:text-2xl md:text-7xl font-extrabold mb-4 pb-[5px] bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                        Coming Soon
                    </h1>
                    <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto font-light">
                        We're working on something amazing! Our store will be launching shortly with exciting products.
                    </p>
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-12"
                >
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Premium Quality</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Authentic and exclusive merchandise</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quick shipping to your doorstep</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                        <div className="text-4xl mb-3">💎</div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Best Prices</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Steal deals on your favorites</p>
                    </div>
                </motion.div>

                {/* Store Location Map */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="mb-12 w-full max-w-4xl mx-auto"
                >
                    <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <h3 className="text-xl font-bold mb-4 mt-2 text-gray-900 dark:text-white">Visit Our Store</h3>
                        <div className="relative w-full h-[300px] sm:h-[400px] rounded-xl overflow-hidden">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.4995033142227!2d72.85300207553554!3d19.304119581947983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b1c885e40a19%3A0xe616e3d891e50f0f!2sSteal%20Deal!5e0!3m2!1sen!2sin!4v1766661542828!5m2!1sen!2sin"
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Steal Deal Store Location"
                            ></iframe>
                        </div>
                        <p className="mt-4 mb-2 text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                            <span className="text-red-500">📍</span>
                            Steal Deal, Mumbai
                        </p>
                    </div>
                </motion.div>

                {/* Animated Dots */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex justify-center items-center gap-2 mt-8"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-3 h-3 rounded-full bg-indigo-500"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-3 h-3 rounded-full bg-purple-500"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-3 h-3 rounded-full bg-pink-500"
                    />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="text-sm text-gray-500 dark:text-gray-400 mt-4"
                >
                    Stay tuned for updates...
                </motion.p>
            </div>
        </div>
    );
};

export default ComingSoon;
