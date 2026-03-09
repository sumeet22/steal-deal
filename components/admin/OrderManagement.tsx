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
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const filteredOrders = orders
    .filter(order => order.status === filterStatus)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleVerifyPayment = async (orderId: string) => {
    setVerifyingId(orderId);
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Payment verified! Status updated to New.');
        // The endpoint already updates the DB, so we just need to refresh/sync local state
        // Re-fetching orders or updating local state would be ideal
        window.location.reload();
      } else {
        alert(`Payment verification failed: ${data.message || 'Inactive or Failed'}`);
      }
    } catch (error) {
      alert('Error verifying payment.');
    } finally {
      setVerifyingId(null);
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prevId: string | null) => (prevId === orderId ? null : orderId));
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200';
      case OrderStatus.New: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case OrderStatus.Accepted: return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case OrderStatus.Shipped: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200';
      case OrderStatus.Cancelled: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case OrderStatus.Completed: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Orders</h2>
          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            Total {filteredOrders.length} {filterStatus} Orders
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
          {Object.values(OrderStatus).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredOrders.length > 0 ? filteredOrders.map((order: Order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className={`p-4 border rounded-3xl dark:border-gray-700 transition-all duration-300 ${isExpanded ? 'bg-gray-50 dark:bg-gray-900/50 shadow-md border-indigo-200 dark:border-indigo-900' : 'shadow-sm'}`}>
                <div
                  className="flex flex-wrap justify-between items-center cursor-pointer gap-4"
                  onClick={() => toggleExpand(order.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 dark:text-white">Order #{order.id}</p>
                      {order.paymentMethod === 'Online Payment' && (
                        <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-800 rounded-full font-black uppercase tracking-wider">Online</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-sm font-black text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <ChevronDownIcon className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-600 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Customer & Shipping</h4>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2 text-sm shadow-sm">
                          <p><strong className="text-gray-500 font-medium">Name:</strong> {order.customerName}</p>
                          <p><strong className="text-gray-500 font-medium">Phone:</strong> {order.customerPhone}</p>
                          <p><strong className="text-gray-500 font-medium">Method:</strong> {order.deliveryMethod === 'home_delivery' ? '🚚 Home Delivery' : '🏪 Store Pickup'}</p>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic border-t pt-2 mt-2">
                            {formatAddress(order)}
                          </p>
                        </div>

                        {order.status === OrderStatus.Pending && order.paymentMethod === 'Online Payment' && (
                          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mb-3 uppercase tracking-tighter">⚠️ Waiting for Payment</p>
                            <button
                              onClick={() => handleVerifyPayment(order.id)}
                              disabled={verifyingId === order.id}
                              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                            >
                              {verifyingId === order.id ? 'VERIFYING...' : 'FORCE VERIFY FROM CASHFREE'}
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Order Items</h4>
                        <div className="space-y-3">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                              <div className="flex-1">
                                <p className="text-sm font-bold truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">{item.quantity} Unit{item.quantity > 1 ? 's' : ''} • ₹{Number(item.price).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-gray-100 dark:bg-gray-800/80 p-4 rounded-3xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase text-gray-500">Fast Actions:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold p-2 px-4 border-2 border-indigo-100 dark:border-indigo-900 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 ring-indigo-500 outline-none"
                        >
                          {Object.values(OrderStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        {order.status === OrderStatus.New && (
                          <button
                            onClick={() => handleStatusChange(order.id, OrderStatus.Accepted)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-black rounded-xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                            ACCEPT & PREPARE
                          </button>
                        )}
                        {order.status === OrderStatus.Accepted && (
                          <button
                            onClick={() => handleStatusChange(order.id, OrderStatus.Shipped)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                            MARK AS SHIPPED
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(order.id, OrderStatus.Cancelled)}
                          className="px-6 py-2 border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-black rounded-xl transition-all"
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          }) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="text-5xl mb-4 opacity-20">📦</div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">No {filterStatus} Orders Found</h3>
            </div>
          )}
        </div>
      </div>

      {/* Payment Proof Modal (Kept for compatibility) */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setSelectedProof(null)}>
          <img src={selectedProof} alt="Proof" className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl" />
        </div>
      )}
    </>
  );
};

export default OrderManagement;