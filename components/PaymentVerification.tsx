import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { LoadingSpinner } from './Icons';

const PaymentVerification: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
    const [status, setStatus] = useState<'verifying' | 'success' | 'failure'>('verifying');
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const { showToast } = useToast();
    const { clearCart } = useAppContext();

    const [retryCount, setRetryCount] = useState(0);
    const [cfStatus, setCfStatus] = useState<string | null>(null);

    const verifyPayment = async () => {
        const params = new URLSearchParams(window.location.search);
        let orderId = params.get('order_id');

        // Fallback for path-based order_id if search param is missing
        if (!orderId && window.location.pathname.startsWith('/payment-verification/')) {
            orderId = window.location.pathname.split('/').pop() || null;
        }

        if (!orderId) {
            setStatus('failure');
            return;
        }

        setStatus('verifying');

        try {
            console.log(`[PaymentVerification] Verifying order: ${orderId} (Attempt ${retryCount + 1})`);
            const res = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId }),
            });

            const data = await res.json();
            console.log("[PaymentVerification] Result:", { status: res.status, data });

            if (res.ok) {
                setStatus('success');
                setOrderDetails(data.order);
                showToast('Success', 'Payment verified successfully!', 'success');
                clearCart();
            } else {
                setCfStatus(data.status);
                // If order is still ACTIVE and we haven't exhausted retries, try again after a delay
                if (data.status === 'ACTIVE' && retryCount < 3) {
                    console.log(`[PaymentVerification] Order still ACTIVE. Retrying in 3s...`);
                    setTimeout(() => setRetryCount(prev => prev + 1), 3000);
                } else {
                    setStatus('failure');
                    showToast('Error', data.message || 'Payment verification failed.', 'error');
                }
            }
        } catch (error) {
            console.error("[PaymentVerification] Error:", error);
            setStatus('failure');
            showToast('Error', 'An unexpected error occurred.', 'error');
        }
    };

    useEffect(() => {
        verifyPayment();
    }, [clearCart, showToast, retryCount]);

    return (
        <div className="max-w-xl mx-auto p-1 sm:p-4 my-8">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-8 sm:p-12 text-center">
                    {status === 'verifying' && (
                        <div className="space-y-8 py-12">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
                                <LoadingSpinner className="w-24 h-24 text-indigo-600 animate-spin-slow" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black tracking-tight">Verifying Payment</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">Please keep this window open while we confirm your transaction...</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/30">
                                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white">Order Confirmed!</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">Success! We've received your payment and your order is being prepared.</p>
                            </div>

                            {orderDetails && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-6 text-left border border-gray-100 dark:border-gray-800 space-y-4"
                                >
                                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800">
                                        <span className="text-gray-500 font-medium">Order ID</span>
                                        <span className="font-mono font-bold text-indigo-600">#{orderDetails.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Amount Paid</span>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">₹{orderDetails.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">Payment Method</span>
                                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Cashfree Online
                                        </span>
                                    </div>
                                    <div className="pt-2 text-xs text-center text-gray-400 uppercase tracking-widest font-bold">
                                        A confirmation email has been sent
                                    </div>
                                </motion.div>
                            )}

                            <button onClick={onBackToStore} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]">
                                Continue Shopping
                            </button>
                        </motion.div>
                    )}

                    {status === 'failure' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                            <div className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-red-500/30">
                                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </div>
                            <div className="space-y-6">
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white leading-tight">Payment Unsuccessful</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-lg mx-auto max-w-sm">
                                    We couldn't confirm your transaction at this moment.
                                </p>
                            </div>

                            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 p-6 rounded-3xl border-2 border-rose-100 dark:border-rose-900/50 space-y-2">
                                <p className="font-bold text-base">Your payment could not be completed</p>
                                <p className="text-sm opacity-90">Please try again. If any amount was deducted, it will be refunded within 3-5 days.</p>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => setRetryCount(prev => prev + 1)}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98]"
                                >
                                    Retry Verification
                                </button>
                                <button onClick={onBackToStore} className="w-full py-5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-extrabold rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
                                    Return to Store
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentVerification;
