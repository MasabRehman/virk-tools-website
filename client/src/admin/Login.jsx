import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials or unauthorized access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-black flex items-center justify-center p-4">
      <div className="bg-industrial-dark border-t-4 border-safety-yellow rounded shadow-2xl p-8 max-w-md w-full">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full border border-safety-yellow flex items-center justify-center mb-4 bg-black">
            <ShieldAlert size={32} className="text-safety-yellow" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white tracking-widest uppercase">Admin Portal</h1>
          <p className="text-gray-400 text-xs mt-1">Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-500 text-white p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Email</label>
            <input 
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-border-gray rounded p-3 text-white focus:border-safety-yellow focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full btn-primary mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-border-gray text-center flex flex-col space-y-4">
          <Link to="/" className="text-safety-yellow font-bold text-sm hover:underline flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
            Back to Store
          </Link>
          <div className="text-xs text-gray-600">
            Security policy enforces strict IP logging.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
