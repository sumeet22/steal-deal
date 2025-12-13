import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Order, OrderStatus, CartItem } from '../types';
import { ClipboardListIcon, ChevronDownIcon, UserCircleIcon } from './Icons';
import PullToRefresh from './shared/PullToRefresh';

const OrderHistory: React.FC = () => {
  const { orders, currentUser } = useAppContext();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    // Reload orders from server
    window.location.reload();
  }, []);

  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders
      .filter(order => order.customerPhone === currentUser.phone)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, currentUser]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prevId: string | null) => (prevId === orderId ? null : orderId));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.New: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case OrderStatus.Accepted: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case OrderStatus.Shipped: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case OrderStatus.Cancelled: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 text-center max-w-2xl mx-auto">
        <UserCircleIcon />
        <h2 className="text-2xl font-bold my-4">View Your Orders</h2>
        <p className="text-gray-600 dark:text-gray-400">Please select a user profile from the menu in the header to see your order history.</p>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">My Orders</h2>

        {userOrders.length > 0 ? (
          <div className="space-y-4">
            {userOrders.map((order: Order) => {
              const isExpanded = expandedOrderId === order.id;
              return (
                <div key={order.id} className={`p-4 border rounded-lg dark:border-gray-700 transition-all duration-300 ${isExpanded ? 'bg-gray-50 dark:bg-gray-900/50 shadow-md' : 'shadow-sm'}`}>
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-3"
                    onClick={() => toggleExpand(order.id)}
                    aria-expanded={isExpanded}
                  >
                    {/* Order ID and Date */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white truncate">Order #{order.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>

                    {/* Price, Status, and Chevron */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      <p className="font-semibold text-lg whitespace-nowrap">${(order.total || 0).toFixed(2)}</p>
                      <span className={`px-2.5 py-1 text-sm font-semibold rounded-full whitespace-nowrap ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <ChevronDownIcon className={`transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-600 animate-fade-in text-sm">
                      <h4 className="font-semibold mb-2">Items Ordered:</h4>
                      <ul className="space-y-2">
                        {order.items.map((item: CartItem) => (
                          <li key={item.id} className="flex items-center gap-2">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            <span>{item.name} x <strong>{item.quantity}</strong></span>
                            <span className="text-gray-600 dark:text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 pt-2 border-t dark:border-gray-600">
                        <p><strong className="font-medium">Shipping Address:</strong> {order.shippingAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardListIcon />
            <h3 className="text-xl font-medium mt-4">No Orders Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">You haven't placed any orders yet. Start shopping to see them here!</p>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default OrderHistory;