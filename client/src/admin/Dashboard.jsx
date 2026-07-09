import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Package, ShoppingCart, DollarSign, Users, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { adminUser } = useAuth();
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 });
  const [cleared, setCleared] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await api.adminGetDashboardStats();
        if (statsData.success) {
          setStats(s => ({ 
            ...s, 
            orders: statsData.data.total_orders || 0,
            products: statsData.data.total_products || 0,
            revenue: statsData.data.total_revenue || 0
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (!cleared) fetchStats();
  }, [cleared]);

  const handleClear = () => {
    setStats({ orders: 0, products: 0, revenue: 0 });
    setCleared(true);
    setShowConfirm(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Welcome back, {adminUser?.first_name}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          {cleared && (
            <button
              onClick={() => { setCleared(false); }}
              className="text-sm text-gray-400 hover:text-white border border-border-gray px-4 py-2 rounded transition-colors"
            >
              Refresh Stats
            </button>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-white bg-red-900/20 hover:bg-red-900/40 border border-red-800/40 px-4 py-2 rounded transition-colors"
          >
            <Trash2 size={15} /> Clear Dashboard
          </button>
        </div>
      </div>

      {/* Confirmation prompt */}
      {showConfirm && (
        <div className="mb-6 bg-red-900/20 border border-red-700/40 rounded p-4 flex items-center justify-between">
          <p className="text-red-300 text-sm font-medium">Clear all displayed stats from the dashboard view?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowConfirm(false)} className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded border border-border-gray transition-colors">Cancel</button>
            <button onClick={handleClear} className="text-sm text-white bg-red-700 hover:bg-red-600 px-4 py-1 rounded font-bold transition-colors">Yes, Clear</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Stat Cards */}
        <div className="bg-industrial-dark border border-border-gray p-4 md:p-6 rounded relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">Total Orders</h3>
            <p className="text-2xl md:text-4xl font-bold text-white">{stats.orders}</p>
          </div>
          <ShoppingCart className="absolute right-[-10px] bottom-[-10px] text-gray-800 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-industrial-dark border border-border-gray p-4 md:p-6 rounded relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">Total Products</h3>
            <p className="text-2xl md:text-4xl font-bold text-white">{cleared ? 0 : stats.products}</p>
          </div>
          <Package className="absolute right-[-10px] bottom-[-10px] text-safety-yellow w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-industrial-dark border border-border-gray p-4 md:p-6 rounded relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">Revenue (Delivered)</h3>
            <p className="text-xl md:text-4xl font-bold text-safety-yellow">
              Rs. {Number(stats.revenue).toLocaleString()}
            </p>
          </div>
          <DollarSign className="absolute right-[-10px] bottom-[-10px] text-safety-yellow w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-industrial-dark border border-border-gray p-4 md:p-6 rounded relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">Total Customers</h3>
            <p className="text-2xl md:text-4xl font-bold text-white">--</p>
          </div>
          <Users className="absolute right-[-10px] bottom-[-10px] text-gray-800 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
        </div>
      </div>
      
      {/* Excel Sync Status */}
      <div className="bg-industrial-dark border border-border-gray p-6 rounded mb-8 flex items-center justify-between border-l-4 border-l-safety-yellow">
        <div>
          <h3 className="font-bold text-white mb-1">Excel Synchronization is Active</h3>
          <p className="text-sm text-gray-400">Master order sheet is located at <code className="bg-black text-safety-yellow px-2 py-0.5 rounded">/exports/orders_master.xlsx</code></p>
        </div>
        <div className="bg-green-900 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-700 animate-pulse">
          SYNCING
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
