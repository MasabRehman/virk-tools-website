import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data.data || { items: [], subtotal: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity, variantId, subcategoryId) => {
    await api.addToCart(productId, quantity, variantId, subcategoryId);
    await fetchCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    await api.updateCartItem(itemId, quantity);
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await api.removeCartItem(itemId);
    await fetchCart();
  };

  const cartCount = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeItem, cartCount, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};
