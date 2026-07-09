import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { Check, ShieldAlert } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  // Normalize image URL — strip absolute localhost prefix if present
  const normalizeUrl = (url) => {
    if (!url) return null;
    return url.replace(/^https?:\/\/localhost:\d+/, '');
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        const prod = data.data;
        setProduct(prod);

        // Fetch subcategories for this product's category and filter
        if (prod?.category_id) {
          try {
            const subRes = await api.getSubcategoriesByCategoryId(prod.category_id);
            const subs = subRes.data || [];
            // Filter to only those assigned to this product
            const filteredSubs = prod.subcategory_ids 
              ? subs.filter(sub => prod.subcategory_ids.includes(sub.id)) 
              : [];
            setSubcategories(filteredSubs);
          } catch (err) {
            // Subcategories are optional, ignore errors
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (subcategories.length > 0 && !selectedSubcategory) {
      alert('Please select an option before adding to cart.');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, quantity, null, selectedSubcategory);
    } catch (err) {
      console.error('Add to cart failed', err);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="container mx-auto py-20 text-center">Loading...</div>;
  if (!product) return <div className="container mx-auto py-20 text-center">Product not found</div>;

  const mainImage = normalizeUrl(product.main_image_url);
  const additionalImages = (product.images || []).map(img => normalizeUrl(img.image_url));
  const allImages = [mainImage, ...additionalImages].filter(Boolean);
  
  const displayImage = currentImage || mainImage;

  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-4">
          <div className="bg-black rounded-lg flex items-center justify-center border border-border-gray overflow-hidden aspect-square">
            <img 
              src={displayImage || "https://placehold.co/600x600/ffffff/0B0E14?text=Product+Image"} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex overflow-x-auto space-x-3 pb-2">
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(imgUrl)}
                  className={`flex-shrink-0 w-24 h-24 rounded-md border-2 overflow-hidden transition-colors ${
                    displayImage === imgUrl ? 'border-safety-yellow' : 'border-border-gray hover:border-gray-500'
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-2 text-safety-yellow text-sm font-bold uppercase tracking-wider">
            {product.brand_name || 'Brand'}
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-5xl leading-tight mb-4">{product.name}</h1>
          
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-border-gray">
            <span className="text-3xl font-bold text-white">Rs. {product.selling_price?.toLocaleString() || '0'}</span>
            {product.mrp && (
              <span className="text-gray-500 line-through">Rs. {product.mrp?.toLocaleString()}</span>
            )}
          </div>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {product.description || 'High-quality industrial grade equipment suitable for heavy-duty applications. Backed by standard manufacturer warranty.'}
          </p>

          {/* Subcategories MCQ */}
          {subcategories.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Select Option</p>
              <div className="flex flex-wrap gap-3">
                {subcategories.map((sub) => (
                  <label
                    key={sub.id}
                    className={`flex items-center space-x-2 cursor-pointer px-4 py-2 rounded border transition-all duration-200 ${
                      selectedSubcategory === sub.id
                        ? 'border-safety-yellow bg-safety-yellow/10 text-safety-yellow font-bold shadow-[0_0_12px_rgba(250,204,21,0.2)]'
                        : 'border-border-gray bg-industrial-dark text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subcategory"
                      value={sub.id}
                      checked={selectedSubcategory === sub.id}
                      onChange={() => setSelectedSubcategory(sub.id)}
                      className="sr-only"
                    />
                    <span>{sub.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center border border-border-gray rounded bg-industrial-dark overflow-hidden w-full sm:w-32">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black transition-colors"
              >-</button>
              <input 
                type="number" 
                value={quantity} 
                readOnly
                className="w-full h-12 bg-transparent text-center font-bold focus:outline-none"
              />
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-12 flex items-center justify-center text-gray-400 hover:text-white hover:bg-black transition-colors"
              >+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={adding}
              className="btn-primary flex-grow text-lg flex items-center justify-center"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          <div className="bg-industrial-dark border border-border-gray rounded p-4 flex flex-col space-y-3">
            <div className="flex items-center text-sm text-gray-300">
              <Check size={16} className="text-safety-yellow mr-3" />
              100% Authentic Product Guarantee
            </div>
            <div className="flex items-center text-sm text-gray-300">
              <ShieldAlert size={16} className="text-safety-yellow mr-3" />
              Standard Warranty Applied
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
