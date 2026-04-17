import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { ShippingAddress, Address, Order } from '../types';
import { LoadingSpinner } from './Icons';

interface CheckoutProps {
  onBackToStore: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
    Cashfree: any;
  }
}

let cashfree: any;
if (typeof window !== 'undefined' && window.Cashfree) {
  cashfree = window.Cashfree({
    mode: (import.meta as any).env.VITE_CASHFREE_MODE === 'production' ? "production" : "sandbox",
  });
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
  const { cart, createOrder, currentUser, setCurrentUser, addAddress, validateAndUpdateCart, shippingFee, freeShippingThreshold, validateCoupon, settingsLoaded } = useAppContext();
  const { showToast } = useToast();

  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerEmail: '',
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
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number; discountAmount: number } | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Strip +91 prefix from phone if present
      const phoneNumber = currentUser.phone?.startsWith('+91')
        ? currentUser.phone.slice(3)
        : currentUser.phone || '';

      setCustomerInfo(prev => ({
        ...prev,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
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
          ).join('\n');
          showToast('Price Update', `Some prices in your cart have changed:\n${priceMsg}`, 'info');
        }

        if (validation.stockIssues.length > 0) {
          showToast('Stock Issue', `Some items have limited stock: ${validation.stockIssues.join(', ')}`, 'warning');
        }
      }
    };

    validateCart();

    // Fetch public coupons
    const fetchPublicCoupons = async () => {
      try {
        const res = await fetch('/api/coupons/public');
        if (res.ok) {
          const data = await res.json();
          setAvailableCoupons((data || []).map((c: any) => ({
            id: c._id || c.id,
            ...c
          })));
        }
      } catch (err) {
        console.error('Failed to fetch public coupons');
      }
    };
    fetchPublicCoupons();
  }, [validateAndUpdateCart, showToast]);

  // If settings haven't loaded yet, show a clean loading state to avoid price flicker
  if (!settingsLoaded && cart.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <LoadingSpinner className="w-12 h-12 text-brand-600" />
        <p className="text-slate-400 font-medium animate-pulse italic uppercase tracking-widest text-xs">Finalizing Prices...</p>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate Market Price (Sum of original prices)
  const marketPrice = cart.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);

  // Calculate Shipping
  const isFreeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingCost = (customerInfo.deliveryMethod === 'home_delivery' && !isFreeShipping) ? shippingFee : 0;

  // Calculate Discount (5% on subtotal, excluding shipping)
  const onlineDiscount = customerInfo.paymentMethod === 'Online Payment' ? subtotal * 0.05 : 0;

  // Calculate Coupon Discount
  const couponDiscount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercentage / 100)) : 0;

  // Final Total
  const total = subtotal + shippingCost - onlineDiscount - couponDiscount;

  // Total Savings Calculation
  const totalSavings = marketPrice - total;

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

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code) return;

    setIsCheckingCoupon(true);
    try {
      const coupon = await validateCoupon(code, subtotal);
      const discountVal = (subtotal * (coupon.discountPercentage / 100));
      setAppliedCoupon({
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount: discountVal
      });
      setCouponCode('');
      showToast('Coupon Applied!', `${coupon.code} applied successfully`, 'success');
    } catch (err: any) {
      showToast('Invalid Coupon', err.message, 'error');
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon Removed', '', 'info');
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

    if (!currentUser && !customerInfo.customerEmail.trim()) {
      showToast('Error', 'Please enter your Email Address.', 'error');
      return;
    }

    if (!currentUser && !/^\S+@\S+\.\S+$/.test(customerInfo.customerEmail)) {
      showToast('Error', 'Please enter a valid Email Address.', 'error');
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

    if (customerInfo.paymentMethod === 'Online Payment') {
      try {
        setIsProcessing(true);

        // 1. Create a "Pending" order in our database first
        const pendingOrder = await createOrder({
          customerName: customerInfo.customerName,
          customerEmail: customerInfo.customerEmail,
          customerPhone: customerInfo.customerPhone,
          shippingAddress: finalShippingAddress,
          deliveryMethod: customerInfo.deliveryMethod,
          shippingCost: shippingCost,
          items: cart,
          total: total,
          paymentMethod: customerInfo.paymentMethod as any,
          status: 'Pending',
          appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount } : undefined,
        } as any);

        if (!pendingOrder) throw new Error('Order creation failed');

        // 2. Create order on Cashfree via our backend
        const cfOrderRes = await fetch('/api/payment/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_amount: total,
            order_currency: 'INR',
            order_id: pendingOrder.id,
            customer_details: {
              customer_id: currentUser?.id || `guest_${Date.now()}`,
              customer_email: currentUser?.email || customerInfo.customerEmail || 'customer@example.com',
              customer_phone: customerInfo.customerPhone
            }
          }),
        });

        if (!cfOrderRes.ok) {
          const errorText = await cfOrderRes.text();
          let errorMessage = 'Cashfree session creation failed';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
          } catch (e) { }
          throw new Error(errorMessage);
        }
        const cfOrderData = await cfOrderRes.json();

        // 3. Open Cashfree Checkout
        if (cfOrderData.payment_session_id) {
          const checkoutOptions = {
            paymentSessionId: cfOrderData.payment_session_id,
            redirectTarget: "_self",
          };

          cashfree.checkout(checkoutOptions).then((result: any) => {
            if (result.error) {
              console.error("Cashfree error:", result.error);
              showToast('Error', result.error.message, 'error');
              setIsProcessing(false);
            }
          });
          return;
        }
      } catch (error: any) {
        console.error("Cashfree flow error:", error);
        showToast('Error', 'Failed to initialize payment gateway.', 'error');
        setIsProcessing(false);
        return;
      }
    }

    // COD Flow
    setTimeout(async () => {
      const order = await createOrder({
        customerName: customerInfo.customerName,
        customerEmail: customerInfo.customerEmail,
        customerPhone: customerInfo.customerPhone,
        shippingAddress: finalShippingAddress,
        deliveryMethod: customerInfo.deliveryMethod,
        shippingCost: shippingCost,
        items: cart,
        total: total,
        paymentMethod: customerInfo.paymentMethod as any,
        status: 'New',
        appliedCoupon: appliedCoupon ? { code: appliedCoupon.code, discountAmount: appliedCoupon.discountAmount } : undefined,
      } as any);

      setIsProcessing(false);
      if (order) {
        setOrderComplete(order);
      } else {
        onBackToStore();
      }
    }, 1500);
  };

  if (orderComplete) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl text-center border-t-8 border-indigo-600"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black mb-2 tracking-tighter">Order Placed!</h2>
          <p className="text-gray-500 mb-8 font-medium">Thank you for your purchase, {orderComplete.customerName}. Your order #{orderComplete.id.slice(-6).toUpperCase()} is being processed.</p>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Total Paid</span>
              <span className="font-bold">₹{orderComplete.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Method</span>
              <span className="font-bold">{orderComplete.paymentMethod}</span>
            </div>
          </div>

          {!currentUser && (
            <div className="border-t pt-8 mt-8 border-dashed border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">Want to track your order easily?</h3>
              <p className="text-sm text-gray-500 mb-6 font-medium">Create an account with 1 click using your order details.</p>

              <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const password = (e.target as any).password.value;
                    if (!password) return;

                    try {
                      const res = await fetch('/api/auth/post-checkout-register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: orderComplete.customerName,
                          email: orderComplete.customerEmail,
                          phone: orderComplete.customerPhone,
                          password
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.msg || 'Registration failed');

                      setCurrentUser(data, data.token);
                      showToast('Account Created!', 'Welcome to Steal Deal!', 'success');
                    } catch (err: any) {
                      showToast('Error', err.message, 'error');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="text-left">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 px-1">Choose a Password</label>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-gray-800 p-3 rounded-xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl shadow-lg transition-all">
                    Create Account & Login
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4">
            <button
              onClick={onBackToStore}
              className="text-gray-500 hover:text-indigo-600 font-bold text-sm tracking-tight transition-colors uppercase"
            >
              ← Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
              </div>
              {!currentUser && (
                <div className="sm:col-span-2">
                  <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={customerInfo.customerEmail}
                    onChange={handleChange}
                    required={!currentUser}
                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-gray-400 mt-1">Order updates will be sent here</p>
                </div>
              )}
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
                    🎉 You saved ₹{onlineDiscount.toFixed(2)} using Online Payment!
                  </p>
                </div>

                <div className="text-center p-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    You will be redirected to our secure payment gateway to complete your transaction.
                  </p>
                  <div className="flex justify-center gap-4 mt-4 opacity-70 grayscale">
                    <span className="text-xs">UPI • Cards • NetBanking</span>
                  </div>
                </div>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Order Summary</h2>
          {totalSavings > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter shadow-lg shadow-green-500/20"
            >
              Total Savings: ₹{totalSavings.toFixed(0)}
            </motion.div>
          )}
        </div>

        {/* Market Price Excitement Bar */}
        {marketPrice > total && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl mb-6 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex items-center gap-4">
            <div className="text-3xl">🚀</div>
            <div>
              <p className="text-xs font-black uppercase text-indigo-400 tracking-widest">You're Getting a Steal Deal!</p>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                Market Price: <span className="line-through text-gray-400">₹{marketPrice.toFixed(0)}</span>
                <span className="ml-2 text-indigo-600 dark:text-indigo-400">Your Deal: ₹{total.toFixed(0)}</span>
              </p>
            </div>
          </div>
        )}
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
              <div className="text-right">
                {item.originalPrice && item.originalPrice > item.price && (
                  <span className="text-[10px] text-gray-400 line-through block italic">
                    MRP ₹{(item.originalPrice * item.quantity).toFixed(0)}
                  </span>
                )}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Code Section */}
        <div className="mb-6 space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest px-1">Have a Coupon?</h3>
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border-2 border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                <span className="font-black tracking-tighter">{appliedCoupon.code}</span>
                <span className="text-xs font-bold bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded-lg">-{appliedCoupon.discountPercentage}%</span>
              </div>
              <button onClick={removeCoupon} className="text-xs font-black text-red-500 uppercase hover:underline">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl font-black tracking-tighter border-2 border-transparent focus:border-indigo-500 outline-none transition-all uppercase"
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={isCheckingCoupon || !couponCode}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isCheckingCoupon ? '...' : 'Apply'}
              </button>
            </div>
          )}

          {/* Available Coupons List */}
          {!appliedCoupon && availableCoupons.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Available Coupons</p>
              <div className="flex flex-wrap gap-2">
                {availableCoupons.map(coupon => (
                  <button
                    key={coupon.id}
                    type="button"
                    onClick={() => handleApplyCoupon(coupon.code)}
                    className="group bg-white dark:bg-gray-700 border border-indigo-100 dark:border-indigo-800 px-3 py-2 rounded-xl text-left hover:border-indigo-500 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-tighter text-indigo-600">{coupon.code}</span>
                      <span className="text-[10px] font-bold text-gray-400">({coupon.discountPercentage}%)</span>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-tight mt-1">{coupon.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
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
            ) : isFreeShipping ? (
              <div className="text-right">
                <span className="text-green-600 font-black block text-sm">FREE SHIPPING</span>
                <span className="text-[10px] text-gray-400">Order above ₹{freeShippingThreshold}</span>
              </div>
            ) : (
              <span>₹{shippingCost.toFixed(2)}</span>
            )}
          </div>

          {onlineDiscount > 0 && (
            <div className="flex justify-between text-base mb-2 text-green-600 dark:text-green-400 font-medium">
              <span>Online Discount (5%)</span>
              <span>-₹{onlineDiscount.toFixed(2)}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex justify-between text-base mb-2 text-green-600 dark:text-green-400 font-medium">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>-₹{couponDiscount.toFixed(2)}</span>
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