import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/ui/ProductCard';
import ProductCardItem from '../components/ui/ProductCardItem';
import BrandStrip from '../components/ui/BrandStrip';
import FeaturedProducts from '../components/ui/FeaturedProducts';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const SearchResults = ({ search, categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        let filters = '?';
        if (search) filters += `search=${encodeURIComponent(search)}&`;
        if (categoryId) filters += `category_id=${categoryId}&`;
        
        const response = await api.getProducts(filters);
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [search, categoryId]);

  if (loading) return <div className="py-20 text-center text-gray-400">Searching...</div>;

  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      {/* Back to Home Link */}
      <div className="mb-6">
        <Link to="/" className="text-gray-400 hover:text-safety-yellow flex items-center space-x-2 w-fit transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          <span className="font-semibold">Back to Home Page</span>
        </Link>
      </div>

      <h2 className="font-heading font-bold text-3xl mb-8">
        Search Results {search && `for "${search}"`}
      </h2>
      
      {products.length === 0 ? (
        <div className="text-gray-400">No products found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCardItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const search = searchParams.get('search');
  const categoryId = searchParams.get('category');
  
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    api.getCategories().then(res => {
      setCategories(res.data || []);
    }).catch(console.error);
  }, []);

  return (
    <div>
      {(search || categoryId) ? (
        <SearchResults search={search} categoryId={categoryId} />
      ) : (
        <>
          {/* Hero Section */}
          <div className="relative bg-black py-10 md:py-16 overflow-hidden">
            {/* Abstract Background pattern simulating tools/gears */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 bg-[url('https://placehold.co/800x800/FFC000/000000?text=Gears+Pattern')] bg-cover mix-blend-overlay"></div>
            
        {/* Right Side Image (Absolute for edge-to-edge) */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent z-10"></div>
          <img src="/hero_image.png" alt="Industrial Tools" className="w-full h-full object-cover object-left" />
        </div>

        <div className="container mx-auto px-4 relative z-20 flex flex-col lg:flex-row items-center justify-between">
          
          {/* Mobile Hero Image */}
          <div className="lg:hidden w-full flex justify-center mb-6">
            <img src="/hero_image.png" alt="Industrial Tools" className="w-full max-w-sm object-contain drop-shadow-2xl" />
          </div>

          <div className="lg:w-[65%] xl:w-[60%] flex flex-col lg:block items-start text-left">
            <p className="text-gray-300 tracking-[0.2em] text-xs font-semibold uppercase mb-4">Quality Tools. Reliable Equipment.</p>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-none mb-1">
              Your Trusted Partner In
            </h1>
            <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-safety-yellow uppercase tracking-tight leading-none mb-4">
              Tools & Equipment
            </h1>
            <p className="text-lg md:text-xl text-white tracking-widest uppercase">
              SUPPLYING EXCELLENCE WORLDWIDE
            </p>

            {/* Mobile Browse Categories Heading */}
            <h2 className="lg:hidden font-heading font-bold text-2xl uppercase tracking-widest text-white mt-12 mb-4">
              Browse Categories
            </h2>

            {/* Hero Trust Badges */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 lg:mt-12 w-full max-w-md lg:max-w-none lg:flex lg:flex-wrap lg:items-center text-left">
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] lg:text-[11px] text-[10px] uppercase tracking-wide leading-tight">PREMIUM QUALITY</h4>
                  <p className="text-gray-400 text-[9px] lg:text-[10px]">Trusted Products</p>
                </div>
              </div>

              <div className="hidden lg:block h-8 w-px bg-gray-800 mx-6"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] lg:text-[11px] text-[10px] uppercase tracking-wide leading-tight">WIDE RANGE</h4>
                  <p className="text-gray-400 text-[9px] lg:text-[10px]">1000+ Products</p>
                </div>
              </div>

              <div className="hidden lg:block h-8 w-px bg-gray-800 mx-6"></div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] lg:text-[11px] text-[10px] uppercase tracking-wide leading-tight">GLOBAL SUPPLY</h4>
                  <p className="text-gray-400 text-[9px] lg:text-[10px]">Worldwide Delivery</p>
                </div>
              </div>

              <div className="hidden lg:block h-8 w-px bg-gray-800 mx-6"></div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-[11px] lg:text-[11px] text-[10px] uppercase tracking-wide leading-tight">BEST PRICES</h4>
                  <p className="text-gray-400 text-[9px] lg:text-[10px]">Competitive Rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories Grid */}
      <div className="container mx-auto px-4 pt-10 pb-6">
        {/* Section header with catalog download */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h2 className="font-heading font-bold text-2xl uppercase tracking-widest text-white">
            Browse Categories
          </h2>
          <a
            href="http://localhost:5000/api/v1/catalog/download"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-safety-yellow hover:bg-yellow-400 text-black font-bold text-sm px-4 py-2 rounded transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Catalog (PDF)
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/?category=${cat.id}`}>
              <ProductCard 
                title={cat.name} 
                image={cat.image_url ? (cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`) : "https://placehold.co/400x300/1F242D/9CA3AF?text=Category+Image"} 
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Promotional Strip */}
      <div className="border-y border-border-gray bg-industrial-dark">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-2 lg:gap-8 py-8 w-full">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:space-x-4 border-b lg:border-b-0 border-r lg:border-r-0 lg:border-r border-border-gray pb-6 lg:pb-0 pr-2 lg:pr-0">
              <div className="text-safety-yellow mb-2 lg:mb-0 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-white text-[13px] lg:text-lg uppercase tracking-wide leading-tight">Bulk Orders</h4>
                <p className="text-safety-yellow font-semibold text-[10px] lg:text-sm mt-1">SPECIAL DISCOUNTS</p>
                <p className="text-gray-400 text-[9px] lg:text-xs mt-1 leading-tight">Get Best Rates for Bulk Orders</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:space-x-4 border-b lg:border-b-0 lg:border-r border-border-gray pb-6 lg:pb-0 pl-3 lg:pl-4">
              <div className="text-safety-yellow mb-2 lg:mb-0 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-white text-[13px] lg:text-lg uppercase tracking-wide leading-tight">Fast & Reliable Delivery</h4>
                <p className="text-gray-400 text-[9px] lg:text-xs mt-1 leading-tight">On Time, Every Time</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:space-x-4 border-r lg:border-r-0 lg:border-r border-border-gray pt-2 lg:pt-0 pr-2 lg:pr-0">
              <div className="text-safety-yellow mb-2 lg:mb-0 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-white text-[13px] lg:text-lg uppercase tracking-wide leading-tight">Customer Support</h4>
                <p className="text-safety-yellow font-bold text-[10px] lg:text-sm mt-1">+92 333 3818933</p>
                <p className="text-gray-400 text-[9px] lg:text-xs mt-1 leading-tight">Mon - Sat (9:00 AM - 6:00 PM)</p>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:space-x-4 pt-2 lg:pt-0 pl-3 lg:pl-4">
              <div className="text-safety-yellow mb-2 lg:mb-0 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 lg:w-9 lg:h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-white text-[13px] lg:text-lg uppercase tracking-wide leading-tight">100% Genuine</h4>
                <p className="text-safety-yellow font-bold text-[10px] lg:text-sm mt-1">AUTHENTIC BRANDS</p>
                <p className="text-gray-400 text-[9px] lg:text-xs mt-1 leading-tight">Guaranteed Original Products</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Strip */}
      <BrandStrip />

        </>
      )}
    </div>
  );
};

export default Home;
