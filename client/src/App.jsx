import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import CategoryList from './pages/CategoryList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';

// Admin Imports
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './admin/Login';
import Dashboard from './admin/Dashboard';
import Products from './admin/Products';
import Categories from './admin/Categories';
import Orders from './admin/Orders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Storefront Routes */}
          <Route path="/" element={<Layout><Outlet /></Layout>}>
            <Route index element={<Home />} />
            <Route path="category/:id" element={<CategoryList />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
          </Route>

          {/* Admin Authentication Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout><Outlet /></AdminLayout></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            {/* Fallback for /admin/settings for now */}
            <Route path="settings" element={<div className="text-white text-2xl font-bold">Settings Panel Coming Soon</div>} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
