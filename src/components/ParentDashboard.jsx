import React, { useState, useEffect } from 'react';
import useAppStore from '../store/appStore';

const ParentDashboard = () => {
  const { isDashboardOpen, closeDashboard } = useAppStore();
  const [activeTab, setActiveTab] = useState('transcripts');
  const [transcripts, setTranscripts] = useState([]);

  useEffect(() => {
    if (isDashboardOpen && activeTab === 'transcripts') {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://cosmic-backend-981638588408.us-central1.run.app';
      fetch(`${API_BASE}/api/transcripts`)
        .then(res => res.json())
        .then(data => setTranscripts(data))
        .catch(err => console.error("Failed to load transcripts", err));
    }
  }, [isDashboardOpen, activeTab]);

  if (!isDashboardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 flex justify-between items-center border-b border-slate-700">
          <h1 className="text-3xl font-bold text-white font-display">Parent Dashboard</h1>
          <button onClick={closeDashboard} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Close & Lock
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50 px-6">
          <button 
            onClick={() => setActiveTab('transcripts')}
            className={`px-6 py-4 font-bold text-lg border-b-2 transition-colors ${activeTab === 'transcripts' ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Audit Transcripts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 font-bold text-lg border-b-2 transition-colors ${activeTab === 'settings' ? 'border-neon-cyan text-neon-cyan' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Model Settings
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Active AI Models</h3>
                <p className="text-slate-400 mb-4">These models are configured server-side and cannot be changed by the child.</p>
                <div className="bg-slate-800 p-4 rounded-lg space-y-3 border border-slate-700">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-300">Orchestrator (Router)</span>
                    <span className="text-neon-cyan font-mono text-sm">gemini-2.5-flash-lite</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-300">Teachers (Math, Reading, etc.)</span>
                    <span className="text-neon-cyan font-mono text-sm">gemini-3.5-flash</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-slate-300">Safety Classifier</span>
                    <span className="text-neon-cyan font-mono text-sm">gemini-2.5-flash</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Text-to-Speech</span>
                    <span className="text-neon-cyan font-mono text-sm">gemini-2.5-flash-preview-tts</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Safety Limits</h3>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 font-bold">Session Time Limit</div>
                    <div className="text-slate-400 text-sm">App locks after 20 minutes to encourage breaks.</div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded border border-green-500/30">Enabled</div>
                </div>
              </div>
            </div>
          )}

          {/* Transcripts Tab */}
          {activeTab === 'transcripts' && (
            <div>
              <p className="text-slate-400 mb-6">Review the latest interactions. Safety flags are highlighted automatically.</p>
              
              <div className="space-y-4">
                {transcripts.length === 0 ? (
                  <p className="text-slate-500 italic">No activity recorded in this session yet.</p>
                ) : (
                  transcripts.map(msg => (
                    <div key={msg.id} className={`p-4 rounded-lg border ${msg.flag === 'distress' ? 'bg-rose-900/20 border-rose-500/50' : 'bg-slate-800 border-slate-700'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold ${msg.speaker === 'Child' ? 'text-indigo-400' : 'text-teal-400'}`}>
                          {msg.speaker}
                        </span>
                        <div className="flex items-center space-x-3">
                          {msg.flag && (
                            <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-rose-600 text-white rounded">
                              {msg.flag} FLAG
                            </span>
                          )}
                          <span className="text-slate-500 text-sm">{msg.time}</span>
                        </div>
                      </div>
                      <p className="text-slate-200">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button className="px-4 py-2 border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 rounded transition-colors">
                  Clear History
                </button>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
