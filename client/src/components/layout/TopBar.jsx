import React from 'react';
import { Phone, Mail, Globe, Facebook, Instagram, Linkedin } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="bg-black text-gray-400 py-1.5 sm:py-2 border-b border-border-gray text-[10px] sm:text-xs">
      <div className="container mx-auto px-2 sm:px-4 flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-0">
        
        {/* Left Side: Contact Info */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 sm:gap-x-6 gap-y-1 w-full lg:w-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 hover:text-safety-yellow transition-colors cursor-pointer">
            <Phone size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>+92 333 3818933</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 hover:text-safety-yellow transition-colors cursor-pointer">
            <Mail size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>info@virktools.com</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 text-safety-yellow font-semibold">
            <Globe size={12} className="sm:w-3.5 sm:h-3.5" />
            <span>Worldwide Delivery</span>
          </div>
        </div>

        {/* Right Side: Links & Social */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 sm:gap-x-6 gap-y-1 w-full lg:w-auto border-t lg:border-t-0 border-gray-800 pt-1 lg:pt-0">
          <nav className="flex items-center gap-x-3 sm:gap-x-4">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Our Brands</a>
            <a href="#" className="hover:text-white transition-colors">Catalog</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </nav>
          <div className="flex items-center space-x-2 sm:space-x-3 border-l border-border-gray pl-3 sm:pl-6">
            <a href="#" className="hover:text-white transition-colors"><Facebook size={12} className="sm:w-3.5 sm:h-3.5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={12} className="sm:w-3.5 sm:h-3.5" /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={12} className="sm:w-3.5 sm:h-3.5" /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
