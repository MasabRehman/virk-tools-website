import React from 'react';
import TopBar from './TopBar';
import Header from './Header';
import CategoryRibbon from './CategoryRibbon';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-industrial-black text-white">
      <TopBar />
      <Header />
      <CategoryRibbon />
      
      <main className="flex-grow">
        {children}
      </main>

      {/* Trust Badges Footer Strip */}
      <div className="border-t border-border-gray bg-industrial-black py-8 mt-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-sm">100% Authentic Products</h4>
              <p className="text-gray-400 text-xs mt-1">Sourced from Trusted Brands</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-sm">Competitive Prices</h4>
              <p className="text-gray-400 text-xs mt-1">Best Value for Your Money</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-sm">Secure Payments</h4>
              <p className="text-gray-400 text-xs mt-1">Safe & Encrypted Transactions</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full border border-safety-yellow flex items-center justify-center text-safety-yellow">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </div>
            <div>
              <h4 className="font-bold text-white uppercase text-sm">Worldwide Shipping</h4>
              <p className="text-gray-400 text-xs mt-1">Delivering to Your Doorstep</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
