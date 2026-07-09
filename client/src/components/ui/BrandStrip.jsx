import React from 'react';

const BrandStrip = () => {
  const brands = [
    'DeWALT', 'BOSCH', 'Makita', 'STANLEY', 'Milwaukee', 'RIDGID', 'HILTI', '3M'
  ];

  return (
    <div className="bg-black py-12 border-t-4 border-safety-yellow">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-gray-800 flex-grow max-w-xs"></div>
          <h2 className="font-heading font-bold text-2xl text-white px-6 tracking-widest uppercase">Global Brands We Supply</h2>
          <div className="h-px bg-gray-800 flex-grow max-w-xs"></div>
        </div>

        <div className="flex justify-center w-full">
          <img src="/brand_strip.png" alt="Brand Logos" className="w-full max-w-6xl object-contain shadow-sm" />
        </div>
      </div>
    </div>
  );
};

export default BrandStrip;
