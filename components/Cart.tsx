
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { TrashIcon } from './Icons';

interface CartProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout, onContinueShopping }) => {
  const { cart, removeFromCart, updateCartQuantity } = useAppContext();
  
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <button onClick={onContinueShopping} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
            Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Your Shopping Cart</h2>
      <div className="space-y-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 border-b dark:border-gray-700">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                max={item.stockQuantity}
                value={item.quantity}
                onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                className="w-16 p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              />
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-right">
        <p className="text-xl font-bold">Subtotal: ${subtotal.toFixed(2)}</p>
        <button onClick={onCheckout} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg">
            Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
