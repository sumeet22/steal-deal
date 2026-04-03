import React, { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { BellIcon, XIcon, ExternalLinkIcon } from '../Icons';

interface OrderNotificationProps {
  onViewOrders: () => void;
}

const OrderNotification: React.FC<OrderNotificationProps> = ({ onViewOrders }) => {
  const { orders, fetchOrders } = useAppContext();
  const [showNotification, setShowNotification] = useState(false);
  const [newOrder, setNewOrder] = useState<any>(null);
  const lastOrderIdRef = useRef<string | null>(localStorage.getItem('lastNotifiedOrderId'));

  // Polling for new orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Check for new orders when the orders list updates
  useEffect(() => {
    if (orders.length > 0) {
      const latestOrder = orders[0]; // Assuming orders are sorted by newest first
      
      // If we have a new order that hasn't been notified yet
      if (lastOrderIdRef.current !== latestOrder.id) {
        // Only notify if it's a "Pending" order and not just a status change of an old order
        // (Wait, if it's the very first order ever seen in this session, we might want to skip or show)
        // Let's only show if it's truly a new ID.
        
        if (lastOrderIdRef.current !== null && latestOrder.status === 'Pending') {
          setNewOrder(latestOrder);
          setShowNotification(true);
        }
        
        // Update the ref and localStorage
        lastOrderIdRef.current = latestOrder.id;
        localStorage.setItem('lastNotifiedOrderId', latestOrder.id);
      }
    } else {
        // If there are no orders, just set the ref to a sentinel value to start tracking
        if (lastOrderIdRef.current === null) {
            lastOrderIdRef.current = 'NONE';
        }
    }
  }, [orders]);

  if (!showNotification || !newOrder) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-4 w-80 md:w-96 overflow-hidden relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <BellIcon className="w-6 h-6 text-blue-400 animate-bounce" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
              New Order!
              <span className="bg-blue-500 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full text-white font-black">
                NEW
              </span>
            </h3>
            <p className="text-slate-400 text-sm mb-3">
              {newOrder.customerName} just placed an order for <span className="text-emerald-400 font-semibold">₹{newOrder.total.toLocaleString()}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  onViewOrders();
                  setShowNotification(false);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                View Order
              </button>
              <button 
                onClick={() => setShowNotification(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderNotification;
