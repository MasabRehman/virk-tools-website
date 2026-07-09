import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';

import ProductCardItem from './ProductCardItem';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.getFeaturedProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) return <div className="text-center py-8">Loading featured tools...</div>;
  if (!products || products.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex items-center justify-between mb-8 border-b border-border-gray pb-4">
        <h2 className="font-heading font-bold text-3xl uppercase text-industrial-black tracking-wide">Featured Tools</h2>
        <Link to="/category/1" className="text-safety-yellow font-bold hover:underline">View All &gt;</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
        {products.map((product) => (
          <ProductCardItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
