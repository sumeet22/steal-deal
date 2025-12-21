import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order, OrderStatus, ShippingAddress } from '../../types';
import { ChevronDownIcon } from '../Icons';

const formatAddress = (order: Order) => {
  if (order.deliveryMethod === 'store_pickup') {
    return 'Store Pickup (Customer will collect from store)';
  }
  const addr = order.shippingAddress;
  if (typeof addr === 'string') return addr;
  return `${addr.addressLine1}, ${addr.addressLine2 ? addr.addressLine2 + ', ' : ''}${addr.landmark ? 'Near ' + addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}, ${addr.country}`;
};

const OrderManagement: React.FC = () => {
  const { orders, updateOrderStatus } = useAppContext();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus>(OrderStatus.New);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  const filteredOrders = orders.filter(order => filterStatus === OrderStatus.New ? true : order.status === filterStatus);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prevId: string | null) => (prevId === orderId ? null : orderId));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.New: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case OrderStatus.Accepted: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case OrderStatus.Shipped: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case OrderStatus.Cancelled: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case OrderStatus.Completed: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <h2 className="text-2xl font-bold mb-6">Manage Orders</h2>
        <div className="mb-4">
          <label htmlFor="order-status-filter" className="sr-only">Filter by Status</label>
          <select
            id="order-status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus)}
            className="p-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {Object.values(OrderStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          {filteredOrders.map((order: Order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className={`p-4 border rounded-lg dark:border-gray-700 transition-all duration-300 ${isExpanded ? 'bg-gray-50 dark:bg-gray-900/50 shadow-md' : 'shadow-sm'}`}>
                <div
                  className="flex flex-wrap justify-between items-center cursor-pointer gap-4"
                  onClick={() => toggleExpand(order.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`order-details-${order.id}`}
                >
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
                      {order.paymentMethod === 'Online Payment' && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-800 rounded-full font-medium">Online Pay</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerName}</p>
                  </div>
                  <div className="flex-shrink-0 text-left sm:text-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{(order.total || 0).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <ChevronDownIcon className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div id={`order-details-${order.id}`} className="mt-4 pt-4 border-t dark:border-gray-600 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Customer Details</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p><strong>Name:</strong> {order.customerName}</p>
                          <p><strong>Phone:</strong> {order.customerPhone}</p>
                          <p><strong>Address:</strong> {formatAddress(order)}</p>
                        </div>

                        {/* Payment Proof Section */}
                        {order.paymentMethod === 'Online Payment' && order.paymentProof && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">Payment Proof</h4>
                            <div
                              className="relative group cursor-pointer w-fit"
                              onClick={() => setSelectedProof(order.paymentProof!)}
                            >
                              <img
                                src={order.paymentProof}
                                alt="Payment Proof"
                                className="w-32 h-32 object-cover rounded-lg border-2 border-indigo-100 dark:border-indigo-900 hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">View</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Click to enlarge</p>
                          </div>
                        )}

                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {order.items.map((item: any) => (
                            <li key={item.id} className="flex items-center gap-2">
                              <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                              <span>{item.name} x {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`status-${order.id}`} className="text-sm font-medium">Update Status:</label>
                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          onClick={(e: React.MouseEvent<HTMLSelectElement>) => e.stopPropagation()}
                          className="p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      {order.status === OrderStatus.New && (
                        <button
                          onClick={() => handleStatusChange(order.id, OrderStatus.Accepted)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
                        >
                          Accept Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Payment Proof Modal */}
      {selectedProof && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedProof(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedProof}
              alt="Payment Proof Fullscreen"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            />
            <button
              className="absolute -top-10 right-0 text-white font-bold text-xl hover:text-gray-300"
              onClick={() => setSelectedProof(null)}
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderManagement;