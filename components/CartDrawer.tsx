import React from 'react';
import { useAppContext } from '../context/AppContext';
// FIX: Import ShoppingCartIcon to fix 'Cannot find name' error.
import { TrashIcon, XIcon, ShoppingCartIcon } from './Icons';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity } = useAppContext();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const drawerClasses = `fixed top-0 right-0 z-50 h-full w-full sm:max-w-sm bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} aria-hidden="true"></div>}
      <div className={drawerClasses} role="dialog" aria-modal="true" aria-labelledby="cart-heading">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 id="cart-heading" className="text-xl font-bold">Your Cart</h2>
            <button onClick={onClose} aria-label="Close cart"><XIcon /></button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <ShoppingCartIcon />
              <p className="mt-4 font-semibold">Your cart is empty.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                    {item.image ? <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full"></div>}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <input
                        type="number"
                        min="1"
                        max={item.stockQuantity}
                        value={item.quantity}
                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                        className="w-16 p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={`Remove ${item.name}`}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border-t dark:border-gray-700 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Subtotal</span>
              <span className="text-lg font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Go to Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;