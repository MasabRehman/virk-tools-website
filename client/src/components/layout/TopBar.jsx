import React, { useState, useEffect } from 'react';
import { Phone, Mail, Globe, Facebook, Instagram, Linkedin, X } from 'lucide-react';
import { api } from '../../services/api';

const TopBar = () => {
  const [settings, setSettings] = useState(null);
  const [activePopup, setActivePopup] = useState(null);

  useEffect(() => {
    // Fetch settings on load
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings in TopBar:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleOpenPopup = (popupType, e) => {
    e.preventDefault();
    setActivePopup(popupType);
  };

  const getPopupContent = () => {
    if (!settings) return 'Content is currently unavailable.';
    switch (activePopup) {
      case 'aboutUs': return settings.popup_about_us || 'No About Us content defined yet.';
      case 'ourBrands': return settings.popup_our_brands || 'No Our Brands content defined yet.';
      case 'catalog': return settings.popup_catalog || 'No Catalog content defined yet.';
      case 'contactUs': return settings.popup_contact_us || 'No Contact Us content defined yet.';
      default: return '';
    }
  };

  const getPopupTitle = () => {
    switch (activePopup) {
      case 'aboutUs': return 'About Us';
      case 'ourBrands': return 'Our Brands';
      case 'catalog': return 'Catalog';
      case 'contactUs': return 'Contact Us';
      default: return '';
    }
  };

  return (
    <>
      <div className="bg-black text-gray-400 py-1.5 sm:py-2 border-b border-border-gray text-[10px] sm:text-xs relative z-40">
        <div className="container mx-auto px-2 sm:px-4 flex flex-col lg:flex-row justify-between items-center gap-2 lg:gap-0">
          
          {/* Left Side: Contact Info */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 sm:gap-x-6 gap-y-1 w-full lg:w-auto">
            <div className="flex items-center space-x-1 sm:space-x-2 hover:text-safety-yellow transition-colors cursor-pointer">
              <Phone size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{settings?.contact_phone || '+92 333 3818933'}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 hover:text-safety-yellow transition-colors cursor-pointer">
              <Mail size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>{settings?.contact_email || 'info@virktools.com'}</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-safety-yellow font-semibold">
              <Globe size={12} className="sm:w-3.5 sm:h-3.5" />
              <span>Worldwide Delivery</span>
            </div>
          </div>

          {/* Right Side: Links & Social */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-3 sm:gap-x-6 gap-y-1 w-full lg:w-auto border-t lg:border-t-0 border-gray-800 pt-1 lg:pt-0">
            <nav className="flex items-center gap-x-3 sm:gap-x-4">
              <button onClick={(e) => handleOpenPopup('aboutUs', e)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">About Us</button>
              <button onClick={(e) => handleOpenPopup('ourBrands', e)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Our Brands</button>
              <button onClick={(e) => handleOpenPopup('catalog', e)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Catalog</button>
              <button onClick={(e) => handleOpenPopup('contactUs', e)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Contact Us</button>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-3 border-l border-border-gray pl-3 sm:pl-6">
              <a href={settings?.social_facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Facebook size={12} className="sm:w-3.5 sm:h-3.5" /></a>
              <a href={settings?.social_instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Instagram size={12} className="sm:w-3.5 sm:h-3.5" /></a>
              <a href={settings?.social_linkedin || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><Linkedin size={12} className="sm:w-3.5 sm:h-3.5" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Overlay Modal */}
      {activePopup && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setActivePopup(null)}
        >
          <div 
            className="bg-industrial-black border-2 border-border-gray rounded-lg max-w-lg w-full shadow-2xl overflow-hidden relative animate-fade-in"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
          >
            {/* Header */}
            <div className="bg-black border-b border-border-gray p-4 flex justify-between items-center">
              <h3 className="text-safety-yellow font-bold font-orbitron tracking-wider">{getPopupTitle()}</h3>
              <button 
                onClick={() => setActivePopup(null)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body Content */}
            <div className="p-6 text-gray-300 whitespace-pre-wrap leading-relaxed min-h-[150px]">
              {getPopupContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
