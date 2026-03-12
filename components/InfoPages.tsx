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
        <div className="prose dark:prose-invert max-w-none space-y-4">
            <p>Welcome to Steal Deal. By accessing our website, you agree to these terms and conditions. These terms govern your use of our website and services provided by SUMIT KESHAB DAS.</p>

            <section>
                <h3 className="text-xl font-bold">1. Agreement to Terms</h3>
                <p>By using our Services, you agree to be bound by these Terms. If you don't agree to be bound by these Terms, do not use the Services. If you are accessing and using the Services on behalf of a company (such as your employer) or other legal entity, you represent and warrant that you have the authority to bind that entity to these Terms. In that case, "you" and "your" will refer to that entity.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">2. Use of the Site</h3>
                <p>You must be at least 18 years old or visiting under the supervision of a parent or guardian. We grant you a non-transferable and revocable license to use the Site for the purpose of shopping for personal items sold on the Site.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">3. User Submissions</h3>
                <p>Anything that you submit to the Site and/or provide to us, including but not limited to, questions, reviews, comments, and suggestions will become our sole and exclusive property and shall not be returned to you. We reserve the right to remove any submission that is deemed inappropriate or violates these terms.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">4. Order Acceptance and Pricing</h3>
                <p>Please note that there are cases when an order cannot be processed for various reasons. The Site reserves the right to refuse or cancel any order for any reason at any given time. Pricing errors may occur, and we reserve the right to cancel orders placed with incorrect prices.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">5. Governing Law</h3>
                <p>These terms and conditions are governed by and construed in accordance with the laws of India. Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.</p>
            </section>
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
        <div className="prose dark:prose-invert max-w-none space-y-4">
            <p>At Steal Deal, we take your privacy seriously. This privacy policy describes how we collect, use, and protect your personal information when you use our services provided by SUMIT KESHAB DAS.</p>

            <section>
                <h3 className="text-xl font-bold">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, place an order, subscribe to our newsletter, or contact us for support. This may include your name, email address, phone number, shipping address, and payment information.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">2. How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-5">
                    <li>Process and fulfill your orders.</li>
                    <li>Communicate with you about your orders and our services.</li>
                    <li>Send you marketing communications (if you've opted in).</li>
                    <li>Improve our website and customer service.</li>
                    <li>Detect and prevent fraud.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-xl font-bold">3. Sharing of Information</h3>
                <p>We do not share your personal information with third parties except as necessary to provide our services (e.g., payment processors like Cashfree, shipping providers) or as required by law. We ensure that our partners adhere to strict privacy standards.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">4. Data Security</h3>
                <p>We implement a variety of security measures, including SSL encryption, to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">5. Your Rights</h3>
                <p>You have the right to access, correct, or delete your personal information. You can manage your account settings or contact us directly for assistance.</p>
            </section>
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
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Refund and Cancellation Policy</h1>
        <div className="prose dark:prose-invert max-w-none space-y-4">
            <p>At Steal Deal, customer satisfaction is our top priority. Please read our policy regarding refunds and cancellations carefully.</p>

            <section>
                <h3 className="text-xl font-bold">Cancellations</h3>
                <p>Orders can only be cancelled within 12 hours of placement. Once an order has been processed or shipped, it cannot be cancelled. To request a cancellation, please contact us immediately at <a href="mailto:thestealdeal.co@gmail.com" className="text-indigo-600 dark:text-indigo-400 hover:underline">thestealdeal.co@gmail.com</a>.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">Returns & Eligibility</h3>
                <p>To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging. You have **7 calendar days** to return an item from the date you received it.</p>
                <p>Certain items, such as intimate apparel or clearance sale items, may not be eligible for return.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">Refund Process</h3>
                <p>Once we receive your item, we will inspect it and notify you of the status of your refund. If approved, we will initiate a refund to your original method of payment (via Cashfree). You will receive the credit within **5-7 business days**, depending on your card issuer's policies.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">Shipping Costs</h3>
                <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of initial shipping will be deducted from your refund.</p>
            </section>
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
        <div className="prose dark:prose-invert max-w-none space-y-4">
            <p>We aim to deliver your order as quickly and safely as possible within India.</p>

            <section>
                <h3 className="text-xl font-bold">Processing Time</h3>
                <p>All orders are processed within **1-2 business days**. Orders are not shipped or delivered on weekends or public holidays. In case of high order volume, shipments may be delayed by a few days.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">Shipping Rates & Estimates</h3>
                <p>Shipping charges for your order will be calculated and displayed at checkout. Standard delivery typically takes **3-7 business days** across India.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">Shipment Confirmation & Tracking</h3>
                <p>You will receive a Shipment Confirmation email/SMS once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">Damages</h3>
                <p>Steal Deal is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.</p>
            </section>

            <section>
                <h3 className="text-xl font-bold">International Shipping</h3>
                <p>We currently only ship within India. We do not support international shipping at this time.</p>
            </section>
        </div>
    </motion.div>
);

export const ContactUs: React.FC = () => {
    const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success'>('idle');
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                alert("Failed to send message. Please try again.");
                setStatus('idle');
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("An error occurred. Please check your connection.");
            setStatus('idle');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Get in Touch</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Have questions about an order or our products? Fill out the form and our team will get back to you within 24 hours.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Legal Entity Name</p>
                                <p className="text-gray-500 text-sm">SDX DIGITAL SOLUTIONS</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Email</p>
                                <p className="text-gray-500 text-sm">
                                    <a href="mailto:thestealdeal.co@gmail.com" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                                        thestealdeal.co@gmail.com
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Phone</p>
                                <p className="text-gray-500 text-sm">
                                    <a href="tel:+919321166028" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                                        +91 93211 66028
                                    </a>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">Registered Address</p>
                                <div className="space-y-2">
                                    <p className="text-gray-500 text-xs leading-relaxed">
                                        Shop no. 4, Narmada Terrace, Cabin Cross Rd, B Wing, Kharegaon,<br />
                                        Bhayandar East, Bhayandar, Mira Bhayandar, Maharashtra 401105
                                    </p>
                                    <a 
                                        href="https://share.google/sPUGk0XkQvpY8iT2O" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:underline group"
                                    >
                                        Show Directions
                                        <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-green-500/30 rounded-2xl bg-green-50 dark:bg-green-900/10">
                            <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-4 text-2xl">✓</div>
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
                                <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="john@example.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subject</label>
                                <input required name="subject" value={formData.subject} onChange={handleChange} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="How can we help?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="Your message here..."></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
