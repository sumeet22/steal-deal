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
