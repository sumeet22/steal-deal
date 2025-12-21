import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface PaymentCallbackProps {
    onNavigateHome: () => void;
}

const PaymentCallback: React.FC<PaymentCallbackProps> = ({ onNavigateHome }) => {
    const { createOrder } = useAppContext();
    const { showToast } = useToast();
    const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const transactionId = params.get('transactionId');

                if (!transactionId) {
                    setStatus('failed');
                    showToast('Error', 'Invalid payment callback', 'error');
                    setTimeout(() => onNavigateHome(), 3000);
                    return;
                }

                // Check payment status
                const response = await fetch('/api/payment/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId })
                });

                const data = await response.json();

                if (data.success && data.status === 'PAYMENT_SUCCESS') {
                    // Retrieve pending order from sessionStorage
                    const pendingOrderStr = sessionStorage.getItem('pendingOrder');

                    if (pendingOrderStr) {
                        const pendingOrder = JSON.parse(pendingOrderStr);

                        // Create the order
                        await createOrder({
                            ...pendingOrder.customerInfo,
                            items: pendingOrder.cart,
                            total: pendingOrder.subtotal,
                            paymentMethod: 'PhonePe',
                            status: 'New',
                            paymentId: data.data.transactionId,
                        } as any);

                        // Clear pending order
                        sessionStorage.removeItem('pendingOrder');

                        setStatus('success');
                        showToast('Success', 'Payment Successful! Order Placed.', 'success');

                        // Redirect to home after 2 seconds
                        setTimeout(() => onNavigateHome(), 2000);
                    } else {
                        setStatus('failed');
                        showToast('Error', 'Order details not found', 'error');
                        setTimeout(() => onNavigateHome(), 3000);
                    }
                } else {
                    setStatus('failed');
                    showToast('Error', data.message || 'Payment verification failed', 'error');
                    setTimeout(() => onNavigateHome(), 3000);
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setStatus('failed');
                showToast('Error', 'Payment verification failed', 'error');
                setTimeout(() => onNavigateHome(), 3000);
            }
        };

        verifyPayment();
    }, [createOrder, showToast, onNavigateHome]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                {status === 'processing' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
                        <p className="text-gray-600 dark:text-gray-400">Please wait while we verify your payment.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
                        <p className="text-gray-600 dark:text-gray-400">Your order has been placed successfully.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">Redirecting to home...</p>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="text-red-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-red-600">Payment Failed</h2>
                        <p className="text-gray-600 dark:text-gray-400">There was an issue with your payment.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">Redirecting to home...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
