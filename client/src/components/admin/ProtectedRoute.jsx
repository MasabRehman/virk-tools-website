import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { adminUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-industrial-black flex items-center justify-center text-safety-yellow">Loading secure environment...</div>;
  }

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
