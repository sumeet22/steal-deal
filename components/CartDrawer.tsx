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

  const drawerClasses = `fixed top-0 right-0 z-50 h-full w-full sm:max-w-md glass shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'
    }`;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 transition-opacity duration-500" onClick={onClose} aria-hidden="true"></div>}
      <div className={drawerClasses} role="dialog" aria-modal="true" aria-labelledby="cart-heading">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
            <h2 id="cart-heading" className="text-2xl font-black italic tracking-tighter uppercase text-brand-600 dark:text-brand-400">Bag</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close cart"><XIcon /></button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <ShoppingCartIcon />
              <p className="mt-4 font-semibold">Your cart is empty.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Looks like you haven't added anything yet.</p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-5 group">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-500">
                    {item.image ? <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full"></div>}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate tracking-tight">{item.name}</p>
                    <p className="text-brand-600 dark:text-brand-400 font-black text-sm">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-1">
                        <button
                          onClick={() => item.quantity > 1 && updateCartQuantity(item.id, item.quantity - 1)}
                          className="px-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >-</button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => item.quantity < (item.stockQuantity || 99) && updateCartQuantity(item.id, item.quantity + 1)}
                          className="px-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        >+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-rose-400 hover:text-rose-600 p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" aria-label={`Remove ${item.name}`}>
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-8 glass-dark border-t border-white/10 mt-auto backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Total payable</span>
              <span className="text-3xl font-black text-white tracking-tighter italic">₹{subtotal.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              disabled={cart.length === 0}
              className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl text-base uppercase tracking-widest hover:bg-brand-500 hover:text-white transition-all duration-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95"
            >
              Secure Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;