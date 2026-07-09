import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, ChevronDown, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    api.getCategories().then(res => {
      setCategories(res.data || []);
    }).catch(() => {});
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      try {
        let filters = `?search=${encodeURIComponent(searchQuery.trim())}&limit=5`;
        if (selectedCategory) filters += `&category_id=${selectedCategory.id}`;
        
        const response = await api.getProducts(filters);
        if (response.success) {
          setSuggestions(response.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setMobileMenuOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory.id);
    navigate(`/?${params.toString()}`);
  };

  return (
    <>
      <header className="bg-industrial-black py-4 md:py-6 border-b border-border-gray sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white hover:text-safety-yellow transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={28} />
          </button>

          {/* Logo Area */}
          <Link to="/" className="flex items-center flex-shrink-0 cursor-pointer">
            <img src="/logo.png" alt="VIRK Tools & Equipment" className="h-12 md:h-20 object-contain" />
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-grow max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full bg-white rounded shadow-sm relative z-50" ref={searchContainerRef}>
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search for tools, equipment & more..." 
                  className="w-full px-4 py-3 text-black focus:outline-none rounded-l"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-50 max-h-72 overflow-y-auto">
                    {suggestions.map(product => (
                      <Link
                        key={product.id}
                        to={`/product/${product.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <img src={product.main_image_url || "https://placehold.co/40x40"} alt={product.name} className="w-10 h-10 object-cover rounded border border-gray-200 mr-3" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-black line-clamp-1">{product.name}</span>
                          <span className="text-xs text-gray-500">Rs. {Number(product.selling_price).toLocaleString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="w-px bg-gray-300 my-2"></div>

              {/* Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center px-4 h-full text-black hover:bg-gray-100 transition-colors bg-white font-medium text-sm whitespace-nowrap"
                >
                  {selectedCategory ? selectedCategory.name : 'All Categories'}
                  <ChevronDown size={16} className={`ml-2 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-xl z-50 min-w-[200px] max-h-72 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory(null); setDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors border-b border-gray-100 font-medium ${!selectedCategory ? 'text-safety-yellow' : 'text-black'}`}
                    >
                      All Categories
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${selectedCategory?.id === cat.id ? 'text-safety-yellow font-bold' : 'text-black'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="bg-safety-yellow px-6 hover:bg-safety-yellow-hover transition-colors flex items-center justify-center flex-shrink-0 rounded-r">
                <Search size={20} className="text-black" />
              </button>
            </form>
          </div>

          {/* Account & Cart */}
          <div className="flex items-center space-x-6 md:space-x-8 text-white">
            <Link to="/admin/login" className="hidden sm:flex items-center cursor-pointer hover:text-safety-yellow transition-colors group">
              <User size={24} className="mr-3 text-safety-yellow group-hover:scale-110 transition-transform" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Admin Portal</span>
                <span className="font-semibold text-sm">Login</span>
              </div>
            </Link>
            
            <Link to="/cart" className="flex items-center cursor-pointer hover:text-safety-yellow transition-colors group relative">
              <ShoppingCart size={24} className="mr-3 text-safety-yellow group-hover:scale-110 transition-transform" />
              <div className="flex flex-col hidden sm:flex">
                <span className="text-xs text-gray-400">My Cart</span>
                <span className="font-semibold text-sm">{cartCount} Items</span>
              </div>
              {/* Mobile Cart Badge */}
              <div className="absolute -top-2 -left-2 sm:hidden bg-safety-yellow text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </div>
            </Link>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden container mx-auto px-4 mt-4">
          <form onSubmit={handleSearch} className="flex w-full bg-white rounded shadow-sm relative z-50">
            <div className="relative flex-grow">
              <input 
                type="text" 
                placeholder="Search for tools, equipment..." 
                className="w-full px-4 py-2 text-black text-sm focus:outline-none rounded-l"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-px bg-gray-300 my-2"></div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center px-2 h-full text-black hover:bg-gray-100 transition-colors bg-white font-medium text-xs whitespace-nowrap"
              >
                All Categories
                <ChevronDown size={14} className="ml-1 text-gray-500" />
              </button>
            </div>

            <button type="submit" className="bg-safety-yellow px-4 hover:bg-safety-yellow-hover transition-colors flex items-center justify-center flex-shrink-0 rounded-r">
              <Search size={18} className="text-black" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative flex flex-col w-4/5 max-w-sm bg-industrial-black h-full shadow-2xl border-r border-border-gray">
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border-gray">
              <img src="/logo.png" alt="VIRK Tools & Equipment" className="h-10 object-contain" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-safety-yellow">
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-shrink-0 p-4 border-b border-border-gray">
              <form onSubmit={handleSearch} className="flex flex-col w-full">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full px-4 py-3 mb-2 text-black focus:outline-none rounded"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="w-full bg-safety-yellow px-4 py-3 rounded text-black font-bold uppercase flex justify-center items-center">
                  <Search size={20} className="mr-2" /> Search
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</div>
              <button
                onClick={() => { setSelectedCategory(null); handleSearch({preventDefault: ()=>{}}); }}
                className={`text-left px-4 py-3 hover:bg-industrial-dark transition-colors ${!selectedCategory ? 'text-safety-yellow font-bold' : 'text-white'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat); handleSearch({preventDefault: ()=>{}}); }}
                  className={`text-left px-4 py-3 hover:bg-industrial-dark transition-colors ${selectedCategory?.id === cat.id ? 'text-safety-yellow font-bold' : 'text-white'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Fixed Admin Login at Bottom */}
            <div className="flex-shrink-0 mt-auto border-t border-border-gray p-4 bg-industrial-dark">
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-white hover:text-safety-yellow transition-colors font-bold">
                <User size={20} className="mr-3 text-safety-yellow" />
                <span>Admin Portal Login</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
