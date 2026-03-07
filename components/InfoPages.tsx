import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const TermsAndConditions: React.FC = () => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg my-8"
    >
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Terms and Conditions</h1>
        <div className="prose dark:prose-invert max-w-none">
            <p>Welcome to Steal Deal. By accessing our website, you agree to these terms and conditions.</p>

            <h3>1. Use of the Site</h3>
            <p>You must be at least 18 years old or visiting under the supervision of a parent or guardian. We grant you a non-transferable and revocable license to use the Site, under the Terms and Conditions described, for the purpose of shopping for personal items sold on the Site.</p>

            <h3>2. User Submissions</h3>
            <p>Anything that you submit to the Site and/or provide to us, including but not limited to, questions, reviews, comments, and suggestions will become our sole and exclusive property and shall not be returned to you.</p>

            <h3>3. Order Acceptance and Pricing</h3>
            <p>Please note that there are cases when an order cannot be processed for various reasons. The Site reserves the right to refuse or cancel any order for any reason at any given time.</p>

            <h3>4. Trademarks and Copyrights</h3>
            <p>All intellectual property rights, whether registered or unregistered, in the Site, information content on the Site and all the website design, including, but not limited to, text, graphics, software, photos, video, music, sound, and their selection and arrangement, and all software compilations, underlying source code and software shall remain our property.</p>
        </div>
    </motion.div>
);

export const PrivacyPolicy: React.FC = () => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg my-8"
    >
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Privacy Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
            <p>We take your privacy seriously. This privacy policy describes how we collect, use, and protect your personal information.</p>

            <h3>1. Information Collection</h3>
            <p>We collect information you provide directly to us, such as when you create an account, place an order, or subscribe to our newsletter.</p>

            <h3>2. Use of Information</h3>
            <p>We use the information we collect to process your orders, communicate with you, and improve our services.</p>

            <h3>3. Information Sharing</h3>
            <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., shipping providers) or as required by law.</p>

            <h3>4. Security</h3>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
        </div>
    </motion.div>
);

export const ReturnsPolicy: React.FC = () => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg my-8"
    >
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Returns Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
            <p>We want you to be completely satisfied with your purchase. If you're not, we're here to help.</p>

            <h3>Return Eligibility</h3>
            <p>To be eligible for a return, your item must be unused together with the original packaging. You have 30 calendar days to return an item from the date you received it.</p>

            <h3>Refunds</h3>
            <p>Once we receive your item, we will inspect it and notify you that we have received your returned item. We will immediately notify you on the status of your refund after inspecting the item. If your return is approved, we will initiate a refund to your original method of payment.</p>

            <h3>Shipping</h3>
            <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable.</p>
        </div>
    </motion.div>
);

export const ShippingPolicy: React.FC = () => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg my-8"
    >
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Shipping Policy</h1>
        <div className="prose dark:prose-invert max-w-none">
            <p>We aim to deliver your order as quickly and safely as possible.</p>

            <h3>Processing Time</h3>
            <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>

            <h3>Shipping Rates & Delivery Estimates</h3>
            <p>Shipping charges for your order will be calculated and displayed at checkout. Standard delivery typically takes 3-5 business days.</p>

            <h3>Shipment Confirmation & Order Tracking</h3>
            <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).</p>

            <h3>International Shipping</h3>
            <p>We currently only ship within India. We hope to expand to other countries soon.</p>
        </div>
    </motion.div>
);

export const ContactUs: React.FC = () => {
    const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate API call
        setTimeout(() => setStatus('success'), 1500);
    };

    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg my-8"
        >
            <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Contact Us</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Have questions about an order or our products? Fill out the form and our team will get back to you within 24 hours.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <p className="font-medium">Email</p>
                                <p className="text-gray-500 text-sm">support@stealdeal2025.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div>
                                <p className="font-medium">Phone</p>
                                <p className="text-gray-500 text-sm">+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <p className="font-medium">Office</p>
                                <p className="text-gray-500 text-sm">123 E-Commerce Plaza, Outer Ring Road, Bangalore - 560103</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-green-500/30 rounded-2xl bg-green-50 dark:bg-green-900/10">
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-2">Message Sent!</h3>
                            <p className="text-gray-600 dark:text-gray-400">Thank you for Reaching out. We'll get back to you soon.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input required type="email" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject</label>
                                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="How can we help?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea required rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="Your message here..."></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sending...
                                    </>
                                ) : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
