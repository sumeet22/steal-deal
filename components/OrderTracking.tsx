import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LoadingSpinner, TruckIcon, ShieldCheckIcon, CreditCardIcon, FireIcon } from './Icons';
import { Order, CartItem, OrderStatus } from '../types';

interface OrderTrackingProps {
    orderIdFromUrl?: string | null;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderIdFromUrl }) => {
    const [orderId, setOrderId] = useState(orderIdFromUrl || '');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(!!orderIdFromUrl);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderIdFromUrl) {
            fetchOrder(orderIdFromUrl);
        }
    }, [orderIdFromUrl]);

    const fetchOrder = async (id: string) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/orders/track/${id}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error('Order not found. Please check your Order ID.');
                throw new Error('Failed to fetch order details');
            }
            const data = await res.json();
            setOrder(data);
        } catch (err: any) {
            setError(err.message);
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderId.trim()) {
            fetchOrder(orderId.trim());
            // Update URL without full refresh
            const params = new URLSearchParams(window.location.search);
            params.set('orderId', orderId.trim());
            params.set('view', 'order-tracking');
            window.history.pushState({}, '', `?${params.toString()}`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Accepted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
            case 'Shipped': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const formatAddress = (addr: any) => {
        if (!addr) return 'N/A';
        if (typeof addr === 'string') return addr;
        return `${addr.addressLine1}, ${addr.addressLine2 ? addr.addressLine2 + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl font-black italic tracking-tighter text-brand-600 dark:text-brand-400 mb-2">TRACK YOUR ORDER</h1>
                <p className="text-slate-500 dark:text-slate-400">Enter your order ID from your email to see live status</p>
            </motion.div>

            <form onSubmit={handleSearch} className="mb-12">
                <div className="relative group">
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Order ID (e.g. 65ef...)"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-500/30"
                    >
                        {loading ? <LoadingSpinner /> : 'TRACK'}
                    </button>
                </div>
            </form>

            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-center mb-8"
                >
                    {error}
                </motion.div>
            )}

            {loading && !order && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner className="w-12 h-12 text-brand-600" />
                </div>
            )}

            {order && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
                >
                    {/* Status Header */}
                    <div className="bg-brand-600 p-8 text-white">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <p className="text-brand-100 text-sm font-bold uppercase tracking-widest mb-1">Order Status</p>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl font-black italic">{order.status.toUpperCase()}</h2>
                                    <span className="w-2 h-2 rounded-full bg-brand-200 animate-pulse"></span>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                                <p className="text-brand-100 text-xs font-bold uppercase tracking-tighter mb-1">Order Identifier</p>
                                <p className="font-mono text-sm leading-none">#{order.id}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Timeline - Simple Version */}
                        <div className="relative flex justify-between mb-12 px-4">
                            {['New', 'Accepted', 'Shipped', 'Completed'].map((s, i) => {
                                const statuses = ['New', 'Accepted', 'Shipped', 'Completed'];
                                const currentIdx = statuses.indexOf(order.status);
                                const stepIdx = i;
                                const isPast = stepIdx <= currentIdx;
                                const isCurrent = stepIdx === currentIdx;

                                return (
                                    <div key={s} className="relative flex flex-col items-center flex-1">
                                        {/* Line */}
                                        {i < 3 && (
                                            <div className={`absolute top-4 left-1/2 w-full h-1 z-0 ${stepIdx < currentIdx ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                        )}
                                        {/* Dot */}
                                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isPast ? 'bg-brand-600 scale-110' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                            {isPast ? <ShieldCheckIcon className="w-5 h-5 text-white" /> : <div className="w-2 h-2 rounded-full bg-slate-400"></div>}
                                        </div>
                                        <span className={`mt-3 text-[10px] font-black uppercase tracking-tighter transition-colors ${isPast ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
                                            {s}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Items List */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                                    <FireIcon className="text-orange-500" /> Items Summary
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400"><FireIcon /></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</p>
                                                <p className="text-sm text-slate-500">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-brand-600 dark:text-brand-400">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Subtotal</span>
                                        <span>₹{(order.total - (order.shippingCost || 0) + (order.appliedCoupon?.discountAmount || 0)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 text-sm">
                                        <span>Shipping</span>
                                        <span>{order.shippingCost > 0 ? `₹${order.shippingCost.toFixed(2)}` : 'FREE'}</span>
                                    </div>
                                    {order.appliedCoupon && (
                                        <div className="flex justify-between text-emerald-500 text-sm font-bold">
                                            <span>Discount ({order.appliedCoupon.code})</span>
                                            <span>-₹{order.appliedCoupon.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-xl font-black uppercase tracking-tighter pt-4 border-t dark:border-slate-800">
                                        <span>Total Amount</span>
                                        <span className="text-brand-600 dark:text-brand-400 text-2xl">₹{order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="space-y-8">
                                <section className="space-y-3">
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                                        <TruckIcon className="text-blue-500" /> Delivery To
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <p className="font-bold text-slate-900 dark:text-white mb-2">{order.customerName}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {formatAddress(order.shippingAddress)}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 font-mono">
                                            Phone: {order.customerPhone}
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase flex items-center gap-2">
                                        <CreditCardIcon className="text-emerald-500" /> Payment Info
                                    </h3>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">Method</p>
                                                <p className="font-bold">{order.paymentMethod === 'Online Payment' ? 'Cashfree Online' : order.paymentMethod}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">Date</p>
                                                <p className="font-bold text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Footer Promo */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 text-center border-t border-slate-100 dark:border-slate-800">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-widest">
                            Experiencing issues? <a href="/?view=contact" className="text-brand-600 hover:underline">Contact Support</a>
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default OrderTracking;
