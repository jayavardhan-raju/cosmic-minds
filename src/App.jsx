import React from 'react';
import VoiceInterface from './components/VoiceInterface';
import LandingPage from './components/LandingPage';
import ParentGate from './components/ParentGate';
import ParentDashboard from './components/ParentDashboard';
import useAppStore from './store/appStore';

function App() {
  const { openGate, currentView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-cosmic-deep">
      
      {/* Parents Button (Top Right) */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={openGate}
          className="text-slate-400 hover:text-white border border-slate-600 hover:border-slate-400 px-4 py-2 rounded-full font-display text-sm uppercase tracking-wider transition-colors"
        >
          Parents
        </button>
      </div>

      {/* Star background placeholder */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>

      <div className="z-10 w-full flex flex-col items-center">
        {currentView === 'landing' ? (
          <div className="text-center space-y-4 pt-12">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-violet glow-cyan animate-pulse-glow">
              Cosmic Minds
            </h1>
            <p className="text-xl text-slate-300 pb-4">
              Your space-themed learning adventure starts here! 🌟
            </p>
            <LandingPage />
          </div>
        ) : (
          <div className="w-full max-w-2xl mt-12">
            <VoiceInterface />
          </div>
        )}
      </div>

      {/* Modals */}
      <ParentGate />
      <ParentDashboard />
    </div>
  );
}

export default App;
