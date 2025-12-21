import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Address } from '../types';

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry",
    "Ladakh", "Jammu and Kashmir"
];

const UserProfile: React.FC = () => {
    const { currentUser, setCurrentUser, addAddress, token } = useAppContext();
    const { showToast } = useToast();
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
    const [newAddress, setNewAddress] = useState({
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        country: 'India',
        type: 'Home' as 'Home' | 'Work' | 'Other'
    });
    const formRef = useRef<HTMLDivElement>(null);

    const resetForm = () => {
        setNewAddress({
            addressLine1: '',
            addressLine2: '',
            landmark: '',
            city: '',
            state: 'Maharashtra',
            pincode: '',
            country: 'India',
            type: 'Home'
        });
        setEditingId(null);
    };

    const handleEdit = (addr: any) => {
        setEditingId(addr.id || addr._id);
        setNewAddress({
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            landmark: addr.landmark || '',
            city: addr.city || '',
            state: addr.state || 'Maharashtra',
            pincode: addr.pincode || '',
            country: addr.country || 'India',
            type: addr.type || 'Home'
        });
        setIsAddingAddress(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleCancel = () => {
        setIsAddingAddress(false);
        resetForm();
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        if (deletingId) return;
        const userId = currentUser?.id || (currentUser as any)?._id;
        if (!userId) return;

        setDeletingId(addressId);
        try {
            const headers: any = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(`/api/users/${userId}/addresses/${addressId}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error('Failed');
            const updatedAddresses = await res.json();
            setCurrentUser(currentUser ? { ...currentUser, addresses: updatedAddresses } : null, token);
            showToast('Success', 'Address deleted', 'success');
        } catch (error) {
            showToast('Error', 'Failed to delete address', 'error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (settingDefaultId) return;
        const userId = currentUser?.id || (currentUser as any)?._id;
        if (!userId) return;

        setSettingDefaultId(addressId);
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(`/api/users/${userId}/addresses/${addressId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ isDefault: true })
            });
            if (!res.ok) throw new Error('Failed');
            const updatedAddresses = await res.json();
            setCurrentUser(currentUser ? { ...currentUser, addresses: updatedAddresses } : null, token);
            showToast('Success', 'Default address updated', 'success');
        } catch (error) {
            showToast('Error', 'Failed to update default address', 'error');
        } finally {
            setSettingDefaultId(null);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        const userId = currentUser?.id || (currentUser as any)?._id;
        if (!userId) return;

        setIsSubmitting(true);
        try {
            if (editingId) {
                // Update existing address
                const headers: any = { 'Content-Type': 'application/json' };
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`/api/users/${userId}/addresses/${editingId}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(newAddress)
                });
                if (!res.ok) throw new Error('Failed to update address');
                const updatedAddresses = await res.json();
                setCurrentUser(currentUser ? { ...currentUser, addresses: updatedAddresses } : null, token);
                showToast('Success', 'Address updated successfully', 'success');
            } else {
                // Add new address
                await addAddress({ ...newAddress, isDefault: false });
            }
            setIsAddingAddress(false);
            resetForm();
        } catch (error) {
            showToast('Error', editingId ? 'Failed to update address' : 'Failed to add address', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    if (!currentUser) return <div className="p-8 text-center">Please log in to view your profile.</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            {/* Profile Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-8">
                <h2 className="text-xl font-bold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="font-medium text-lg">{currentUser.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                        <p className="font-medium text-lg">{currentUser.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                        <p className="font-medium text-lg">{currentUser.phone || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                            {currentUser.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Address Book */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm" ref={formRef}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Saved Addresses</h2>
                    <button
                        onClick={() => isAddingAddress ? handleCancel() : setIsAddingAddress(true)}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                        {isAddingAddress ? 'Cancel' : '+ Add Address'}
                    </button>
                </div>

                <AnimatePresence>
                    {isAddingAddress && (
                        <motion.form
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            onSubmit={handleAddSubmit}
                            className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-8"
                        >
                            <h3 className="font-semibold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Address Type</label>
                                    <select name="type" value={newAddress.type} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                        <option value="Home">Home</option>
                                        <option value="Work">Work</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pincode</label>
                                    <input type="text" name="pincode" value={newAddress.pincode} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Address Line 1</label>
                                    <input type="text" name="addressLine1" value={newAddress.addressLine1} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                                    <input type="text" name="addressLine2" value={newAddress.addressLine2} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">City</label>
                                    <input type="text" name="city" value={newAddress.city} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State</label>
                                    <select name="state" value={newAddress.state} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                        {INDIAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Landmark</label>
                                    <input type="text" name="landmark" value={newAddress.landmark} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country</label>
                                    <input type="text" name="country" value="India" disabled className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-50 cursor-not-allowed" />
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {isSubmitting && (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {isSubmitting ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Address' : 'Save Address')}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    {currentUser.addresses && currentUser.addresses.length > 0 ? (
                        currentUser.addresses.map((addr: any) => (
                            <div key={addr.id || addr._id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex justify-between items-start hover:border-indigo-500 transition-colors">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-gray-900 dark:text-white">{addr.type || 'Home'}</span>
                                        {addr.isDefault && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {addr.addressLine1}
                                        {addr.addressLine2 ? ', ' + addr.addressLine2 : ''}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {addr.landmark ? 'Near ' + addr.landmark + ', ' : ''}
                                        {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleEdit(addr)}
                                        disabled={isSubmitting || deletingId === (addr.id || addr._id) || settingDefaultId === (addr.id || addr._id)}
                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Edit
                                    </button>
                                    {!addr.isDefault && (
                                        <button
                                            onClick={() => handleSetDefault(addr.id || addr._id)}
                                            disabled={settingDefaultId !== null || deletingId !== null}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                        >
                                            {settingDefaultId === (addr.id || addr._id) && (
                                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            )}
                                            {settingDefaultId === (addr.id || addr._id) ? 'Setting...' : 'Set as Default'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id || addr._id)}
                                        disabled={deletingId !== null || settingDefaultId !== null}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {deletingId === (addr.id || addr._id) && (
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {deletingId === (addr.id || addr._id) ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No saved addresses yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
