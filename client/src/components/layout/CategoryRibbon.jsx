import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { api } from '../../services/api';

const CategoryRibbon = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories()
      .then(res => {
        if (res.success) {
          setCategories(res.data || []);
        }
      })
      .catch(err => console.error("Failed to load categories for ribbon", err));
  }, []);

  return (
    <div className="hidden lg:block bg-[#11151c] border-b border-border-gray">
      <div className="container mx-auto px-4 flex items-center">
        {/* Category Links */}
        <nav className="w-full flex md:justify-between items-center py-3 md:py-4 overflow-x-auto whitespace-nowrap scrollbar-hide space-x-6 md:space-x-0">
          {categories.slice(0, 10).map((category) => (
            <Link 
              key={category.id} 
              to={`/?category=${category.id}`} 
              className="text-white text-sm font-semibold hover:text-safety-yellow transition-colors whitespace-nowrap px-3"
            >
              {category.name.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default CategoryRibbon;
