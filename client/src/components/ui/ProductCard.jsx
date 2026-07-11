import React from 'react';

const ProductCard = ({ title, image, isYellow }) => {
  return (
    <div className="card-industrial group cursor-pointer flex flex-col">
      <div className="w-full h-32 sm:h-56 relative overflow-hidden bg-gradient-to-b from-industrial-dark to-industrial-black flex-shrink-0">
        {/* Abstract Background Glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-safety-yellow via-transparent to-transparent hidden group-hover:block transition-all duration-500 z-10"></div>
        <img 
          src={image || "https://placehold.co/400x300/1F242D/9CA3AF?text=Tool+Image"} 
          alt={title} 
          className="w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="border-t border-border-gray p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-industrial-dark gap-1 sm:gap-0">
        <h3 className="font-heading font-bold text-xs sm:text-lg tracking-wide group-hover:text-safety-yellow transition-colors truncate w-full sm:w-auto">{title}</h3>
        <span className="text-safety-yellow text-[10px] sm:text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform shrink-0">
          View All <span className="ml-1">&gt;</span>
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
