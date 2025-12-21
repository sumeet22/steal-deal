import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { ShippingAddress, Address } from '../types';

interface CheckoutProps {
  onBackToStore: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry",
  "Ladakh", "Jammu and Kashmir"
];

const Checkout: React.FC<CheckoutProps> = ({ onBackToStore }) => {
  const { cart, createOrder, currentUser, addAddress, validateAndUpdateCart } = useAppContext();
  const { showToast } = useToast();

  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerPhone: '',
    deliveryMethod: 'store_pickup' as 'store_pickup' | 'home_delivery',
    paymentMethod: 'COD' as 'COD' | 'Online Payment',
    paymentProof: '' as string,
  });

  const [address, setAddress] = useState<ShippingAddress>({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: 'Maharashtra', // Default state
    pincode: '',
    country: 'India',
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Strip +91 prefix from phone if present
      const phoneNumber = currentUser.phone?.startsWith('+91')
        ? currentUser.phone.slice(3)
        : currentUser.phone || '';

      setCustomerInfo(prev => ({
        ...prev,
        customerName: currentUser.name,
        customerPhone: phoneNumber
      }));

      // Pre-select default address if available
      if (currentUser.addresses && currentUser.addresses.length > 0) {
        const defaultAddr = currentUser.addresses.find(a => a.isDefault) || currentUser.addresses[0];
        setAddress(defaultAddr);
        setSelectedAddressId(defaultAddr.id);
        if (customerInfo.deliveryMethod === 'store_pickup') {
          // Keep store pickup as default if set initially, or maybe switch to home delivery if they have an address?
          // Let's not force switch delivery method, but if they switch to home delivery, the address will be ready.
        } else {
          // If already home delivery or undefined, ensure address is populated
        }
      }
    }
  }, [currentUser]); // Run only on mount or user change

  // Validate cart on mount and show notifications
  useEffect(() => {
    const validateCart = async () => {
      const validation = await validateAndUpdateCart();

      if (validation.hasChanges) {
        // Show notifications for changes
        if (validation.removedItems.length > 0) {
          showToast('Warning', `Removed from cart: ${validation.removedItems.join(', ')}`, 'error');
        }

        if (validation.priceChanges.length > 0) {
          const priceMsg = validation.priceChanges.map(pc =>
            `${pc.name}: ₹${pc.oldPrice} → ₹${pc.newPrice}`
          ).join(', ');
          showToast('Info', `Price updated: ${priceMsg}`, 'info');
        }

        if (validation.stockIssues.length > 0 && validation.removedItems.length === 0) {
          showToast('Warning', validation.stockIssues.join(', '), 'error');
        }
      }
    };

    validateCart();
  }, [validateAndUpdateCart, showToast]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate Shipping
  let shippingCost = 0;
  if (customerInfo.deliveryMethod === 'home_delivery') {
    shippingCost = subtotal > 799 ? 0 : 150;
  }

  // Calculate Discount (5% on subtotal, excluding shipping)
  const discount = customerInfo.paymentMethod === 'Online Payment' ? subtotal * 0.05 : 0;

  // Final Total
  const total = subtotal + shippingCost - discount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
    if (selectedAddressId !== 'new') {
      setSelectedAddressId('new'); // Switch to 'new' if user starts editing a saved address to avoid confusion, or keep it "editing"
      // Better to treat any edit as a "potential new address" or just let them edit.
      // For simplicity, if they edit, we treat it as "new" for saving purposes if it differs from the saved one. 
      // But visually, let's keep it 'new' to imply it's not the saved one anymore.
    }
  };

  const handleSavedAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAddressId(val);
    if (val === 'new') {
      setAddress({
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        country: 'India',
      });
    } else {
      const addr = currentUser?.addresses?.find(a => a.id === val);
      if (addr) {
        setAddress({
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 || '',
          landmark: addr.landmark || '',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
        });
      }
    }
  };

  const setDeliveryMethod = (method: 'store_pickup' | 'home_delivery') => {
    setCustomerInfo(prev => ({ ...prev, deliveryMethod: method }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Error', 'File size too large. Please upload an image smaller than 2MB.', 'error');
        e.target.value = '';
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Error', 'Invalid file type. Only standard images (JPEG, PNG, WebP) are allowed.', 'error');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const img = new Image();
        img.onload = () => {
          setCustomerInfo(prev => ({ ...prev, paymentProof: result }));
        };
        img.onerror = () => {
          showToast('Error', 'The uploaded file does not appear to be a valid image.', 'error');
          setCustomerInfo(prev => ({ ...prev, paymentProof: '' }));
          e.target.value = '';
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePincode = (pincode: string) => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(pincode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cart before proceeding with payment
    setIsProcessing(true);
    const validation = await validateAndUpdateCart();

    if (validation.hasChanges) {
      setIsProcessing(false);

      let errorMessage = 'Cart has been updated. Please review before proceeding.\\n\\n';

      if (validation.removedItems.length > 0) {
        errorMessage += `Removed items: ${validation.removedItems.join(', ')}\\n`;
      }

      if (validation.priceChanges.length > 0) {
        const priceChanges = validation.priceChanges.map(pc =>
          `${pc.name}: ₹${pc.oldPrice} → ₹${pc.newPrice}`
        ).join('\\n');
        errorMessage += `Price changes:\\n${priceChanges}\\n`;
      }

      if (validation.stockIssues.length > 0) {
        errorMessage += `Stock issues:\\n${validation.stockIssues.join('\\n')}`;
      }

      showToast('Error', errorMessage, 'error');
      return;
    }

    // Check if cart is empty after validation
    if (cart.length === 0) {
      setIsProcessing(false);
      showToast('Error', 'Your cart is empty.', 'error');
      return;
    }

    setIsProcessing(false);

    if (!customerInfo.customerName.trim()) {
      showToast('Error', 'Please enter your Full Name.', 'error');
      return;
    }

    if (!customerInfo.customerPhone) {
      showToast('Error', 'Please enter your Phone Number.', 'error');
      return;
    }

    if (!validatePhoneNumber(customerInfo.customerPhone)) {
      showToast('Error', 'Please enter a valid 10-digit Phone Number.', 'error');
      return;
    }

    if (customerInfo.deliveryMethod === 'home_delivery') {
      if (!address.addressLine1.trim()) {
        showToast('Error', 'Please enter Address Line 1.', 'error');
        return;
      }
      if (!address.city.trim()) {
        showToast('Error', 'Please enter City.', 'error');
        return;
      }
      if (!address.state) {
        showToast('Error', 'Please select a State.', 'error');
        return;
      }
      if (!address.pincode) {
        showToast('Error', 'Please enter Pincode.', 'error');
        return;
      }

      if (!validatePincode(address.pincode)) {
        showToast('Error', 'Please enter a valid 6-digit Pincode.', 'error');
        return;
      }
    }

    if (cart.length === 0) {
      showToast('Error', 'Your cart is empty.', 'error');
      return;
    }

    if (customerInfo.paymentMethod === 'Online Payment' && !customerInfo.paymentProof) {
      showToast('Error', 'Please upload a screenshot of your payment.', 'error');
      return;
    }

    const outOfStockItems = cart.filter(item => item.outOfStock || item.stockQuantity <= 0);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.name).join(', ');
      showToast('Error', `The following items are out of stock and cannot be ordered: ${itemNames}. Please remove them from your cart.`, 'error');
      return;
    }

    setIsProcessing(true);

    // Save Address Logic
    if (currentUser && customerInfo.deliveryMethod === 'home_delivery') {
      // Check if this address is essentially new
      const isNew = !currentUser.addresses?.some(a =>
        a.addressLine1.toLowerCase() === address.addressLine1.toLowerCase() &&
        a.pincode === address.pincode &&
        a.city.toLowerCase() === address.city.toLowerCase()
      );

      if (isNew) {
        // Automatically save the new address
        await addAddress({
          ...address,
          isDefault: currentUser.addresses?.length === 0 // Make default if it's the first one
        });
      }
    }

    const finalShippingAddress = customerInfo.deliveryMethod === 'store_pickup'
      ? {
        addressLine1: 'Store Pickup',
        city: 'N/A',
        state: 'N/A',
        pincode: 'N/A',
        country: 'India'
      } as ShippingAddress
      : address;

    setTimeout(() => {
      createOrder({
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        shippingAddress: finalShippingAddress,
        deliveryMethod: customerInfo.deliveryMethod,
        shippingCost: shippingCost,
        items: cart,
        total: total,
        paymentMethod: customerInfo.paymentMethod as any,
        paymentProof: customerInfo.paymentMethod === 'Online Payment' ? customerInfo.paymentProof : undefined,
        status: 'New',
      } as any);

      setIsProcessing(false);
      onBackToStore();
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty.</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">There's nothing to check out.</p>
        <button onClick={onBackToStore} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          Return to Store
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Helmet>
        <title>Checkout | Steal Deal</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 order-2 lg:order-1"
      >
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Contact Info */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium mb-1">Full Name</label>
                <input type="text" id="customerName" name="customerName" value={customerInfo.customerName} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-24"
                    value="+91"
                    disabled
                  >
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={customerInfo.customerPhone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="9876543210"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">10-digit mobile number</p>
              </div>
            </div>
          </section>

          {/* Delivery Method */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Delivery Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setDeliveryMethod('store_pickup')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${customerInfo.deliveryMethod === 'store_pickup' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                  </div>
                  <span className="font-bold">Pick from Store</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Collect your order from our store.</p>
                <p className="text-sm font-bold text-green-600 mt-2">Free Delivery</p>
              </div>

              <div
                onClick={() => setDeliveryMethod('home_delivery')}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${customerInfo.deliveryMethod === 'home_delivery' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" /></svg>
                  </div>
                  <span className="font-bold">Home Delivery</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get your order delivered to your doorstep.</p>
                {subtotal > 799 ? (
                  <p className="text-sm font-bold text-green-600 mt-2">Free Shipping</p>
                ) : (
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-2">+ ₹150 Shipping</p>
                )}
              </div>
            </div>

            {/* Structured Shipping Address (Only for Home Delivery) */}
            {customerInfo.deliveryMethod === 'home_delivery' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 mt-4"
              >
                {/* Saved Address Selector */}
                {currentUser && currentUser.addresses && currentUser.addresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select a Saved Address</label>
                    <select
                      value={selectedAddressId}
                      onChange={handleSavedAddressSelect}
                      className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
                    >
                      {currentUser.addresses.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.type || 'Home'} - {addr.addressLine1}, {addr.city}
                        </option>
                      ))}
                      <option value="new">+ Add New Address</option>
                    </select>
                  </div>
                )}

                <h4 className="font-medium text-gray-900 dark:text-white">Shipping Address</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium mb-1">Pincode <span className="text-red-500">*</span></label>
                    <input type="text" id="pincode" name="pincode" value={address.pincode} onChange={handleAddressChange} maxLength={6} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 110001" />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
                    <input type="text" id="city" name="city" value={address.city} onChange={handleAddressChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">Address Line 1 (House No, Building) <span className="text-red-500">*</span></label>
                  <input type="text" id="addressLine1" name="addressLine1" value={address.addressLine1} onChange={handleAddressChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">Address Line 2 (Area, Sector)</label>
                  <input type="text" id="addressLine2" name="addressLine2" value={address.addressLine2} onChange={handleAddressChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div>
                  <label htmlFor="landmark" className="block text-sm font-medium mb-1">Landmark</label>
                  <input type="text" id="landmark" name="landmark" value={address.landmark} onChange={handleAddressChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
                    <select id="state" name="state" value={address.state} onChange={handleAddressChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500">
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
                    <input type="text" id="country" name="country" value={address.country} disabled required className="w-full p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700 cursor-not-allowed" />
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* Payment Method */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">Payment Method</h3>
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">Select Payment Method</label>
              <select id="paymentMethod" name="paymentMethod" value={customerInfo.paymentMethod} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500">
                <option value="COD">
                  {customerInfo.deliveryMethod === 'store_pickup' ? 'Pay at Counter (Cash/UPI)' : 'Cash on Delivery (COD)'}
                </option>
                <option value="Online Payment">Online Payment (QR Code) - 5% OFF</option>
              </select>
            </div>

            {/* Online Payment UI */}
            {customerInfo.paymentMethod === 'Online Payment' && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 text-center animate-pulse-slow">
                  <p className="text-green-700 dark:text-green-300 font-bold text-sm">
                    🎉 You saved ₹{discount.toFixed(2)} using Online Payment!
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold mb-2">Scan & Pay ₹{total.toFixed(2)}</p>
                  <div className="bg-white p-2 inline-block rounded-lg shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=pkt-9987266028@okbizaxis&pn=StealDeal&am=${total.toFixed(2)}`}
                      alt="Payment QR Code"
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">UPI: pkt-9987266028@okbizaxis</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Upload Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={customerInfo.paymentMethod === 'Online Payment'}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                  />
                  <p className="text-xs text-gray-400 mt-1">Supported formats: JPEG, PNG, WebP (Max 2MB)</p>
                </div>
                {customerInfo.paymentProof && (
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span>✓ Screenshot attached (Verified)</span>
                  </div>
                )}
              </div>
            )}
          </section>

          <button type="submit" disabled={isProcessing} className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isProcessing ? 'Processing Order...' : `Place Order (₹${total.toFixed(2)})`}
          </button>

        </form>
      </motion.div>

      {/* Order Summary Side */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 sm:p-8 order-1 lg:order-2 h-fit"
      >
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <img src={item.image || (item.images && item.images[0]?.url) || 'https://placehold.co/40x40'} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-6 dark:border-gray-700">
          <div className="flex justify-between text-base mb-2">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base mb-2">
            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
            {customerInfo.deliveryMethod === 'store_pickup' ? (
              <span className="text-green-600 font-medium">Free (Pickup)</span>
            ) : (
              shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : <span>₹{shippingCost.toFixed(2)}</span>
            )}
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-base mb-2 text-green-600 dark:text-green-400 font-medium">
              <span>Online Discount (5%)</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-2xl font-bold mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-right">
            (Includes all taxes)
          </p>
        </div>

      </motion.div >
    </div >
  );
};

export default Checkout;