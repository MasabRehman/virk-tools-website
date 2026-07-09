import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    if (token && userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.adminLogin(email, password);
    const user = res.data.admin;
    const token = res.data.accessToken;
    
    // Only allow admins
    const allowedRoles = ['admin', 'super_admin', 'editor'];
    if (!allowedRoles.includes(res.data.role)) {
      throw new Error('Unauthorized access');
    }

    // Attach role to user if missing, though it should be there
    user.role = res.data.role;

    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    setAdminUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider value={{ adminUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
