import React, { useState } from 'react';
import useAppStore from '../store/appStore';

const ParentGate = () => {
  const { isGateOpen, closeGate, authenticate } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isGateOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // For this capstone demo, any 4 digit pin works (e.g. 1234)
    // Real implementation would have proper server-side auth.
    if (pin.length >= 4) {
      setError(false);
      setPin('');
      authenticate();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white font-display">Grown-ups Only</h2>
          <button onClick={closeGate} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>
        
        <p className="text-slate-300 mb-6">Please enter your 4-digit PIN to access settings and transcripts.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="****"
            maxLength={4}
            className="w-full bg-slate-800 border border-slate-600 text-white text-center text-3xl tracking-[1em] py-4 rounded-lg focus:outline-none focus:border-neon-cyan"
            autoFocus
          />
          {error && <p className="text-rose-500 text-sm">Please enter a 4-digit PIN.</p>}
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParentGate;
