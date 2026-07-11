import React, { useState, useEffect } from 'react';
import { Save, Loader } from 'lucide-react';
import { api } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    contact_phone: '',
    contact_email: '',
    social_facebook: '',
    social_instagram: '',
    social_linkedin: '',
    popup_about_us: '',
    popup_our_brands: '',
    popup_catalog: '',
    popup_contact_us: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      await api.adminUpdateSettings(settings);
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white"><Loader className="w-8 h-8 animate-spin text-safety-yellow" /></div>;
  }

  return (
    <div className="text-white pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-orbitron tracking-wider text-safety-yellow">Site Settings</h1>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center space-x-2 bg-safety-yellow text-black px-4 py-2 rounded font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded ${message.includes('successfully') ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
          {message}
        </div>
      )}

      <form className="space-y-8" onSubmit={handleSubmit}>
        
        {/* Contact Info */}
        <div className="bg-black border border-border-gray p-6 rounded-lg">
          <h2 className="text-lg font-bold mb-4 border-b border-border-gray pb-2 text-safety-yellow">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input 
                type="text" name="contact_phone" value={settings.contact_phone || ''} onChange={handleChange}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                placeholder="+92 333 3818933"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleChange}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                placeholder="info@virktools.com"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-black border border-border-gray p-6 rounded-lg">
          <h2 className="text-lg font-bold mb-4 border-b border-border-gray pb-2 text-safety-yellow">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Facebook URL</label>
              <input 
                type="text" name="social_facebook" value={settings.social_facebook || ''} onChange={handleChange}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instagram URL</label>
              <input 
                type="text" name="social_instagram" value={settings.social_instagram || ''} onChange={handleChange}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">LinkedIn URL</label>
              <input 
                type="text" name="social_linkedin" value={settings.social_linkedin || ''} onChange={handleChange}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Popup Texts */}
        <div className="bg-black border border-border-gray p-6 rounded-lg">
          <h2 className="text-lg font-bold mb-4 border-b border-border-gray pb-2 text-safety-yellow">Navigation Popups (Text Boxes)</h2>
          <p className="text-sm text-gray-400 mb-6">These texts will appear when users click the corresponding buttons in the Top Navigation bar.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About Us Content</label>
              <textarea 
                name="popup_about_us" value={settings.popup_about_us || ''} onChange={handleChange}
                rows={4}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                placeholder="Enter the text that will appear when clicking 'About Us'..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Our Brands Content</label>
              <textarea 
                name="popup_our_brands" value={settings.popup_our_brands || ''} onChange={handleChange}
                rows={4}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                placeholder="Enter the text that will appear when clicking 'Our Brands'..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Catalog Content</label>
              <textarea 
                name="popup_catalog" value={settings.popup_catalog || ''} onChange={handleChange}
                rows={4}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                placeholder="Enter the text that will appear when clicking 'Catalog'..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contact Us Content</label>
              <textarea 
                name="popup_contact_us" value={settings.popup_contact_us || ''} onChange={handleChange}
                rows={4}
                className="w-full bg-[#111] border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
                placeholder="Enter the text that will appear when clicking 'Contact Us'..."
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
