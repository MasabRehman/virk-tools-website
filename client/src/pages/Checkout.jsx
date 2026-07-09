import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    alternate_phone: '',
    complete_address: '',
    city: ''
  });
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  // Redirect if cart empty
  useEffect(() => {
    if (cart.items?.length === 0 && !successOrder) {
      navigate('/cart');
    }
  }, [cart, navigate, successOrder]);

  // Fetch delivery fee when city changes
  useEffect(() => {
    const fetchFee = async () => {
      if (formData.city.length > 2) {
        setLoadingFee(true);
        try {
          const res = await api.getDeliveryFee(formData.city);
          setDeliveryFee(res.data?.fee_amount || 500);
        } catch (e) {
          setDeliveryFee(500);
        } finally {
          setLoadingFee(false);
        }
      } else {
        setDeliveryFee(0);
      }
    };
    
    const timeoutId = setTimeout(fetchFee, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.city]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.checkout(formData);
      setSuccessOrder(res.data);
      await fetchCart(); // Re-fetch cart to empty it in context
    } catch (err) {
      alert(err.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <div className="bg-industrial-dark border-2 border-safety-yellow rounded-lg p-10">
          <div className="w-20 h-20 bg-safety-yellow rounded-full flex items-center justify-center mx-auto mb-6 text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="font-heading font-bold text-4xl mb-2 text-white">Order Confirmed!</h1>
          <p className="text-gray-400 mb-6">Thank you for your business. Your order has been placed successfully.</p>
          
          <div className="bg-black rounded p-4 mb-8">
            <span className="block text-gray-500 text-sm uppercase tracking-wider mb-1">Order Number</span>
            <span className="font-heading font-bold text-3xl text-safety-yellow tracking-widest">{successOrder.order_number}</span>
          </div>
          
          <p className="text-sm text-gray-400 mb-8">We will contact you shortly on {successOrder.phone} to confirm delivery details.</p>
          
          <button onClick={() => navigate('/')} className="btn-primary w-full">Return to Home</button>
        </div>
      </div>
    );
  }

  const grandTotal = (cart.subtotal || 0) + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="w-full lg:w-2/3">
          <div className="bg-industrial-dark border border-border-gray rounded-lg p-6 md:p-8">
            <h3 className="font-heading font-bold text-xl mb-6 border-b border-border-gray pb-4 text-safety-yellow">Shipping Information</h3>
            
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Full Name *</label>
                <input 
                  type="text" required name="customer_name"
                  value={formData.customer_name} onChange={handleChange}
                  className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                  placeholder="e.g. Ali Khan"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Phone Number *</label>
                  <input 
                    type="tel" required name="phone"
                    value={formData.phone} onChange={handleChange}
                    className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                    placeholder="03XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Alternate Phone (Optional)</label>
                  <input 
                    type="tel" name="alternate_phone"
                    value={formData.alternate_phone} onChange={handleChange}
                    className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">City *</label>
                <input 
                  type="text" required name="city"
                  value={formData.city} onChange={handleChange}
                  className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                  placeholder="e.g. Lahore"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Complete Delivery Address *</label>
                <textarea 
                  required name="complete_address" rows="3"
                  value={formData.complete_address} onChange={handleChange}
                  className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                  placeholder="House/Shop #, Street, Area/Market..."
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-industrial-dark border border-border-gray rounded-lg p-6 sticky top-24">
            <h3 className="font-heading font-bold text-xl mb-6 border-b border-border-gray pb-4">Your Order</h3>
            
            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
              {cart.items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.quantity}x {item.product_name}</span>
                  <span className="font-bold text-white">Rs. {item.total_price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6 border-t border-border-gray pt-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span className="font-bold text-white">Rs. {cart.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery {loadingFee && <span className="text-xs text-safety-yellow animate-pulse">(Calculating...)</span>}</span>
                <span className="font-bold text-white">Rs. {deliveryFee.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t border-border-gray pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-lg">Grand Total</span>
              <span className="font-bold text-3xl text-safety-yellow">Rs. {grandTotal.toLocaleString()}</span>
            </div>

            <div className="bg-black border border-border-gray rounded p-4 mb-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="radio" checked readOnly className="form-radio text-safety-yellow focus:ring-safety-yellow" />
                <span className="font-bold text-sm">Cash on Delivery / Invoice</span>
              </label>
              <p className="text-xs text-gray-500 mt-2 ml-7">Pay when you receive the goods.</p>
            </div>
            
            <button 
              type="submit" 
              form="checkout-form"
              disabled={submitting}
              className={`w-full btn-primary text-lg flex items-center justify-center ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Processing...' : 'Place Order Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
