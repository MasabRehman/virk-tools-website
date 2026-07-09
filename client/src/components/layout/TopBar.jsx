import React from 'react';
import { Phone, Mail, Globe, Facebook, Instagram, Linkedin } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="hidden lg:block bg-black text-gray-400 text-xs py-2 border-b border-border-gray">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        {/* Left Side: Contact Info */}
        <div className="flex items-center space-x-6 mb-2 sm:mb-0">
          <div className="flex items-center space-x-2 hover:text-safety-yellow transition-colors cursor-pointer">
            <Phone size={14} />
            <span>+92 333 3818933</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-safety-yellow transition-colors cursor-pointer">
            <Mail size={14} />
            <span>info@virktools.com</span>
          </div>
          <div className="flex items-center space-x-2 text-safety-yellow font-semibold">
            <Globe size={14} />
            <span>Worldwide Delivery</span>
          </div>
        </div>

        {/* Right Side: Links & Social */}
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-4">
            <a href="#" className="hover:text-white transition-colors">About Us</a>
            <a href="#" className="hover:text-white transition-colors">Our Brands</a>
            <a href="#" className="hover:text-white transition-colors">Catalog</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </nav>
          <div className="flex space-x-3 border-l border-border-gray pl-6">
            <a href="#" className="hover:text-white transition-colors"><Facebook size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={14} /></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={14} /></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
