import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

interface CheckoutProps {
  onBackToStore: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onBackToStore }) => {
  const { cart, createOrder, currentUser } = useAppContext();
  const { showToast } = useToast();
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    paymentMethod: 'COD' as 'COD' | 'Bank Transfer',
  });

  useEffect(() => {
    if (currentUser) {
      setCustomerInfo(prev => ({
        ...prev,
        customerName: currentUser.name,
        customerPhone: currentUser.phone
      }));
    }
  }, [currentUser]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.customerName || !customerInfo.customerPhone || !customerInfo.shippingAddress) {
      showToast('Error', 'Please fill in all required fields.', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Error', 'Your cart is empty.', 'error');
      return;
    }
    createOrder({
      ...customerInfo,
      items: cart,
      total: subtotal,
    });
    // After successful order, navigate back to store. AppContext handles toast.
    onBackToStore();
  };

  if (cart.length === 0) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty.</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">There's nothing to check out. Please add some products to your cart first.</p>
        <button onClick={onBackToStore} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
          Return to Store
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 order-2 lg:order-1">
        <h2 className="text-2xl font-bold mb-6">Shipping & Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" id="customerName" name="customerName" value={customerInfo.customerName} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
            <input type="tel" id="customerPhone" name="customerPhone" value={customerInfo.customerPhone} onChange={handleChange} required className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label htmlFor="shippingAddress" className="block text-sm font-medium mb-1">Shipping Address</label>
            <textarea id="shippingAddress" name="shippingAddress" value={customerInfo.shippingAddress} onChange={handleChange} required rows={3} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"></textarea>
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">Payment Method</label>
            <select id="paymentMethod" name="paymentMethod" value={customerInfo.paymentMethod} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
            Place Order
          </button>
        </form>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 order-1 lg:order-2">
        <h2 className="text-2xl font-bold mb-6">Your Order Summary</h2>
        <div className="space-y-3 mb-6">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={item.image || 'https://placehold.co/40x40'} alt={item.name} className="w-10 h-10 rounded object-cover" />
                <span>{item.name} x {item.quantity}</span>
              </div>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 dark:border-gray-700">
          <p className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;