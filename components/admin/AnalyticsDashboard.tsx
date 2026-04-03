import React, { useMemo, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Order, Product } from '../../types';

const AnalyticsDashboard: React.FC = () => {
  const { orders, products, fetchAllProductsForAdmin, pricePercentage } = useAppContext();

  useEffect(() => {
    // Ensure we have all products for admin to see base prices
    if (products.length === 0) {
      fetchAllProductsForAdmin();
    }
  }, [fetchAllProductsForAdmin, products.length]);

  const stats = useMemo(() => {
    if (!orders || orders.length === 0) return null;

    let totalRevenue = 0;
    let totalCost = 0;
    const productSales: { [id: string]: { name: string; quantity: number; revenue: number } } = {};
    const categorySales: { [id: string]: number } = {};
    const dailyStats: { [date: string]: { revenue: number; profit: number; orders: number } } = {};

    orders.forEach(order => {
      // Only count paid/completed/delivered orders for revenue/profit
      if (['cancelled'].includes(order.status)) return;

      const orderDate = new Date(order.createdAt).toLocaleDateString();
      if (!dailyStats[orderDate]) {
        dailyStats[orderDate] = { revenue: 0, profit: 0, orders: 0 };
      }
      dailyStats[orderDate].orders += 1;

      order.items.forEach(item => {
        const itemRevenue = item.price * item.quantity;
        totalRevenue += itemRevenue;

        // Try to find original base price
        const product = products.find(p => p.id === item.id);
        const basePrice = product ? product.basePrice : (item.price * 100) / pricePercentage;
        
        const itemCost = (basePrice || 0) * item.quantity;
        totalCost += itemCost;

        const itemProfit = itemRevenue - itemCost;
        dailyStats[orderDate].revenue += itemRevenue;
        dailyStats[orderDate].profit += itemProfit;

        // Track product sales
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += itemRevenue;
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Sort products by quantity
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Get last 7 days stats
    const chartData = Object.entries(dailyStats)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7);

    return {
      totalRevenue,
      totalProfit,
      profitMargin,
      totalOrders: orders.length,
      topProducts,
      chartData
    };
  }, [orders, products, pricePercentage]);

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-indigo-50 dark:border-indigo-900/30">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-black uppercase tracking-tighter">No Analytics Data Yet</h2>
        <p className="text-gray-500 max-w-xs text-center mt-2">Start taking orders to see your business growth metrics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-indigo-50 dark:border-indigo-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Total Revenue</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">₹{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-xs text-gray-400 mt-2 font-bold italic">Cumulative Sales</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl shadow-emerald-500/5 border border-emerald-50 dark:border-emerald-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Estimated Profit (PnL)</p>
          <h3 className="text-3xl font-black text-emerald-600">₹{stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-xs text-gray-400 mt-2 font-bold italic">Avg Margin: {stats.profitMargin.toFixed(1)}%</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl shadow-amber-500/5 border border-amber-50 dark:border-amber-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Total Orders</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalOrders}</h3>
          <p className="text-xs text-gray-400 mt-2 font-bold italic">Conversion Success</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-indigo-50 dark:border-indigo-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <svg className="w-12 h-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Current Price Hike</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white">{pricePercentage}%</h3>
          <p className="text-xs text-indigo-400 mt-2 font-medium">Global Multiplier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart (Simple CSS implementation) */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border border-indigo-50 dark:border-indigo-900/30">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
            7-Day Revenue Trend
          </h3>
          
          <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-indigo-50 dark:border-indigo-900/20 pb-2">
            {stats.chartData.map(([date, dayData]) => {
              const maxRevenue = Math.max(...stats.chartData.map(d => d[1].revenue));
              const height = maxRevenue > 0 ? (dayData.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={date} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    style={{ height: `${height}%` }}
                    className="w-full max-w-[40px] bg-indigo-100 dark:bg-indigo-900/40 rounded-t-xl group-hover:bg-indigo-600 transition-all duration-300 relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      ₹{dayData.revenue.toFixed(0)}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 mt-3 rotate-45 origin-left uppercase">{date.split('/')[0]}/{date.split('/')[1]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border border-indigo-50 dark:border-indigo-900/30">
          <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-2">
            <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
            Top Performance Products
          </h3>
          
          <div className="space-y-4">
            {stats.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-xl font-black text-lg shadow-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.quantity} Units Sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm">₹{product.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
