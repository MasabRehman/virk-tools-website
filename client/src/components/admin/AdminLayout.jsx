import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, PackageSearch, ClipboardList, LogOut, Settings, Menu, X } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-industrial-dark border-r border-border-gray flex flex-col fixed h-full z-50 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-border-gray flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-10 h-10 flex items-center justify-center mr-3">
              <div className="absolute inset-0 border-2 border-safety-yellow rounded-full transform -skew-x-12"></div>
              <span className="font-heading font-bold text-lg text-white tracking-tighter italic">VT</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-safety-yellow tracking-widest leading-none">ADMIN</h1>
              <span className="text-gray-400 text-[10px] tracking-widest uppercase">Control Panel</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
          <Link onClick={() => setMobileMenuOpen(false)} to="/admin/dashboard" className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${isActive('/admin/dashboard') ? 'bg-safety-yellow text-black font-bold' : 'text-gray-400 hover:bg-black hover:text-white'}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/admin/products" className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${isActive('/admin/products') ? 'bg-safety-yellow text-black font-bold' : 'text-gray-400 hover:bg-black hover:text-white'}`}>
            <PackageSearch size={20} />
            <span>Products & Inventory</span>
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/admin/categories" className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${isActive('/admin/categories') ? 'bg-safety-yellow text-black font-bold' : 'text-gray-400 hover:bg-black hover:text-white'}`}>
            <PackageSearch size={20} />
            <span>Categories</span>
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/admin/orders" className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${isActive('/admin/orders') ? 'bg-safety-yellow text-black font-bold' : 'text-gray-400 hover:bg-black hover:text-white'}`}>
            <ClipboardList size={20} />
            <span>Order Management</span>
          </Link>
          <Link onClick={() => setMobileMenuOpen(false)} to="/admin/settings" className={`flex items-center space-x-3 px-4 py-3 rounded transition-colors ${isActive('/admin/settings') ? 'bg-safety-yellow text-black font-bold' : 'text-gray-400 hover:bg-black hover:text-white'}`}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-border-gray mt-auto">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-border-gray flex items-center justify-center font-bold text-safety-yellow">
              {adminUser?.first_name?.[0] || 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">{adminUser?.first_name} {adminUser?.last_name}</span>
              <span className="text-[10px] text-gray-400 uppercase">{adminUser?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 w-full px-2 py-2 transition-colors">
            <LogOut size={16} />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 bg-industrial-black min-h-screen w-full">
        {/* Mobile Top Bar */}
        <div className="md:hidden bg-industrial-dark border-b border-border-gray p-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(true)} className="text-white hover:text-safety-yellow">
            <Menu size={28} />
          </button>
          <div className="font-heading font-bold text-lg text-safety-yellow tracking-widest leading-none">ADMIN</div>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>

        <div className="p-4 md:p-8 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
