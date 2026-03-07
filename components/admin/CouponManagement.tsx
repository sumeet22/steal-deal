import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Coupon } from '../../types';
import { PlusIcon, TrashIcon, TagIcon, CalendarIcon, EyeIcon, EyeOffIcon } from '../Icons';

const CouponManagement: React.FC = () => {
    const { coupons, addCoupon, deleteCoupon } = useAppContext();
    const [isAdding, setIsAdding] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discountPercentage: 10,
        minOrderAmount: 0,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isPublic: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addCoupon({
            ...newCoupon,
            isActive: true,
        } as any);
        setIsAdding(false);
        setNewCoupon({
            code: '',
            description: '',
            discountPercentage: 10,
            minOrderAmount: 0,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isPublic: true,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Coupon Management</h2>
                    <p className="text-gray-500 text-sm">Manage discount codes and promotional offers.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    {isAdding ? 'Cancel' : (
                        <>
                            <PlusIcon />
                            Create Coupon
                        </>
                    )}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border-4 border-indigo-50 dark:border-indigo-900/30 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top duration-300">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Coupon Code</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. STEAL10"
                            value={newCoupon.code}
                            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Discount (%)</label>
                        <input
                            required
                            type="number"
                            min="1"
                            max="100"
                            value={newCoupon.discountPercentage}
                            onChange={e => setNewCoupon({ ...newCoupon, discountPercentage: parseInt(e.target.value) })}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Description</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Get 10% off on all orders"
                            value={newCoupon.description}
                            onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Min Order Amount (₹)</label>
                        <input
                            type="number"
                            value={newCoupon.minOrderAmount}
                            onChange={e => setNewCoupon({ ...newCoupon, minOrderAmount: parseInt(e.target.value) })}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest pl-1">Expiry Date</label>
                        <input
                            required
                            type="date"
                            value={newCoupon.expiryDate}
                            onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-end pb-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={newCoupon.isPublic}
                                onChange={e => setNewCoupon({ ...newCoupon, isPublic: e.target.checked })}
                                className="w-6 h-6 rounded-lg accent-indigo-600"
                            />
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Show in "Available Coupons" at checkout</span>
                        </label>
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20">
                            Generate Coupon
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-indigo-50 dark:border-indigo-900/30 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${coupon.isPublic ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                            {coupon.isPublic ? 'Public' : 'Secret'}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                                <TagIcon size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl tracking-tight">{coupon.code}</h3>
                                <p className="text-xs text-indigo-600 font-bold">{coupon.discountPercentage}% OFF</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">{coupon.description}</p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <CalendarIcon size={14} />
                                Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <PlusIcon size={14} />
                                Min Order: ₹{coupon.minOrderAmount}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                                <EyeIcon size={14} />
                                Used: {coupon.usageCount} times
                            </div>
                        </div>

                        <button
                            onClick={() => deleteCoupon(coupon.id)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        >
                            <TrashIcon size={16} />
                            Delete Coupon
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CouponManagement;
