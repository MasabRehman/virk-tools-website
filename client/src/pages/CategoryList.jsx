import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ProductCardItem from '../components/ui/ProductCardItem';

const CategoryList = () => {
  const { id } = useParams();
  
  // Raw data from API
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts(`?category_id=${id}`);
        setAllProducts(response.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [id]);

  // Derived unique brands from fetched products
  const uniqueBrands = useMemo(() => {
    const brands = allProducts.map(p => p.brand_name).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [allProducts]);

  // Handle brand checkbox toggle
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Filter by Brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand_name));
    }

    // 2. Filter by Price
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      result = result.filter(p => Number(p.selling_price) >= min);
    }
    if (!isNaN(max)) {
      result = result.filter(p => Number(p.selling_price) <= max);
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return Number(a.selling_price) - Number(b.selling_price);
        case 'price_desc':
          return Number(b.selling_price) - Number(a.selling_price);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          // If we had a created_at date we'd use it here.
          // For now, sorting by ID descending simulates 'newest'
          return b.id - a.id;
      }
    });

    return result;
  }, [allProducts, selectedBrands, minPrice, maxPrice, sortBy]);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-1/4">
        <div className="bg-industrial-dark border border-border-gray p-6 rounded sticky top-6">
          <h3 className="font-heading font-bold text-xl mb-4 border-b border-border-gray pb-2 flex justify-between items-center">
            FILTERS
            {(selectedBrands.length > 0 || minPrice !== '' || maxPrice !== '') && (
              <button 
                onClick={() => { setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); setSortBy('newest'); }}
                className="text-xs text-blue-400 hover:text-blue-300 font-normal uppercase"
              >
                Clear All
              </button>
            )}
          </h3>

          {/* Sort By (Mobile Friendly + Sidebar) */}
          <div className="mb-6 pb-6 border-b border-border-gray">
            <h4 className="font-bold text-sm text-gray-400 mb-3 uppercase">Sort By</h4>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-industrial-black border border-border-gray rounded px-3 py-2 text-white text-sm focus:border-safety-yellow focus:outline-none"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
          
          {/* Brands Filter */}
          {uniqueBrands.length > 0 && (
            <div className="mb-6 pb-6 border-b border-border-gray">
              <h4 className="font-bold text-sm text-gray-400 mb-3 uppercase">Brands</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {uniqueBrands.map(brand => (
                  <label key={brand} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="form-checkbox text-safety-yellow rounded border-gray-600 bg-industrial-black focus:ring-safety-yellow" 
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="mb-6">
            <h4 className="font-bold text-sm text-gray-400 mb-3 uppercase">Price Range</h4>
            <div className="flex items-center space-x-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 bg-industrial-black border border-border-gray rounded px-3 py-2 text-white text-sm focus:border-safety-yellow focus:outline-none"
              />
              <span className="text-gray-500">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 bg-industrial-black border border-border-gray rounded px-3 py-2 text-white text-sm focus:border-safety-yellow focus:outline-none"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            Showing {filteredProducts.length} of {allProducts.length} products
          </div>
        </div>
      </aside>

      {/* Main Grid */}
      <main className="w-full md:w-3/4">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-heading font-bold text-3xl">CATEGORY RESULTS</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {allProducts.length > 0 ? "No products match your selected filters." : "No products found in this category."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCardItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryList;
