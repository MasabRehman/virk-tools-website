import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCardItem = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent Link navigation
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    setQuantity(q => Math.max(1, q - 1));
  };

  const handleIncrease = (e) => {
    e.preventDefault();
    setQuantity(q => q + 1);
  };

  return (
    <Link to={`/product/${product.slug}`} className="card-industrial group flex flex-col h-full">
      <div className="flex-grow flex items-center justify-center border-b border-border-gray relative overflow-hidden aspect-video bg-black">
        <img 
          src={product.main_image_url || "https://placehold.co/400x300/ffffff/0B0E14?text=Tool"} 
          alt={product.name} 
          className="w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-300"
        />
        {product.is_featured === 1 && (
          <div className="absolute top-2 right-2 bg-safety-yellow text-black text-[10px] font-bold px-2 py-1 uppercase rounded-sm z-20">
            Featured
          </div>
        )}
      </div>
      <div className="bg-industrial-dark p-4 flex flex-col justify-between flex-grow">
        <div>
          <span className="text-gray-400 text-xs font-semibold">{product.brand_name || 'Brand'}</span>
          <h3 className="text-white font-bold text-sm mt-1 line-clamp-2 min-h-[40px] group-hover:text-safety-yellow transition-colors">
            {product.name}
          </h3>
        </div>
        
        <div className="mt-4 flex flex-col space-y-3">
          <span className="text-safety-yellow font-heading font-bold text-lg">Rs. {Number(product.selling_price).toLocaleString()}</span>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-border-gray rounded bg-black overflow-hidden h-8 w-24 flex-shrink-0" onClick={(e) => e.preventDefault()}>
              <button 
                onClick={handleDecrease}
                className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >-</button>
              <input 
                type="number" 
                value={quantity} 
                readOnly
                className="w-8 h-full bg-transparent text-center font-bold text-xs focus:outline-none"
              />
              <button 
                onClick={handleIncrease}
                className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={adding}
              className="bg-safety-yellow text-black font-bold text-xs px-3 py-2 rounded flex-grow hover:bg-yellow-500 transition-colors whitespace-nowrap"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCardItem;
