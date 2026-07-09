import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="container mx-auto py-20 text-center">Loading cart...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-4xl mb-8">Shopping Cart</h1>
      
      {cart.items?.length === 0 ? (
        <div className="bg-industrial-dark border border-border-gray rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg mb-6">Your cart is currently empty.</p>
          <Link to="/" className="btn-primary inline-block">Continue Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3">
            <div className="bg-industrial-dark border border-border-gray rounded-lg overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border-gray bg-black text-gray-400 text-xs font-bold uppercase tracking-wider">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              <div className="divide-y divide-border-gray">
                {cart.items?.map(item => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 items-center">
                    <div className="sm:col-span-6 flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded p-1 flex-shrink-0">
                        <img 
                          src={item.image_url || "https://placehold.co/100x100/ffffff/000000?text=IMG"} 
                          alt={item.product_name}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm md:text-base">{item.product_name}</h4>
                        {item.subcategory_name && (
                          <div className="text-xs text-safety-yellow mt-1">Option: {item.subcategory_name}</div>
                        )}
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-400 text-xs flex items-center mt-2 transition-colors"
                        >
                          <Trash2 size={12} className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2 text-center text-gray-300 sm:block flex justify-between">
                      <span className="sm:hidden text-gray-500">Price: </span>
                      Rs. {item.unit_price?.toLocaleString()}
                    </div>
                    
                    <div className="sm:col-span-2 flex justify-center sm:block">
                      <div className="flex items-center border border-border-gray rounded bg-black overflow-hidden w-24">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                        >-</button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          readOnly
                          className="w-full h-8 bg-transparent text-center text-sm font-bold focus:outline-none"
                        />
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                        >+</button>
                      </div>
                    </div>
                    
                    <div className="sm:col-span-2 text-right font-bold text-safety-yellow sm:block flex justify-between">
                      <span className="sm:hidden text-gray-500">Total: </span>
                      Rs. {item.total_price?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="bg-industrial-dark border border-border-gray rounded-lg p-6 sticky top-24">
              <h3 className="font-heading font-bold text-xl mb-6 border-b border-border-gray pb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">Rs. {cart.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Delivery Charges</span>
                  <span className="text-gray-500 italic">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-border-gray pt-4 mb-8 flex justify-between items-end">
                <span className="font-bold text-lg">Estimated Total</span>
                <span className="font-bold text-2xl text-safety-yellow">Rs. {cart.subtotal?.toLocaleString()}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary text-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
