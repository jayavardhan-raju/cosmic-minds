import React from 'react';
import useAppStore from '../store/appStore';
import { startSTT } from '../services/sttService';
import { playTTS } from '../services/ttsService';
import TeacherAvatar from './TeacherAvatar';

const VoiceInterface = () => {
  const { activeTeacher, avatarState, subtitles, isRecording, setAvatarState, setSubtitles } = useAppStore();

  const handleMicClick = () => {
    if (isRecording) return;
    
    startSTT(async (transcript) => {
      setAvatarState('thinking');
      setSubtitles('Thinking...');
      
      try {
        const response = await fetch('http://127.0.0.1:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: transcript,
            current_teacher: useAppStore.getState().activeTeacher 
          })
        });
        
        const data = await response.json();
        
        if (data.teacher) {
          useAppStore.getState().setActiveTeacher(data.teacher);
        }
        
        if (data.is_distress) {
           await playTTS(data.response);
        } else {
           await playTTS(data.response);
        }
      } catch (err) {
        console.error(err);
        setAvatarState('idle');
        setSubtitles('Error connecting to backend.');
      }
    });
  };

  const handleTextSubmit = async (text) => {
    if (!text.trim()) return;
    setAvatarState('thinking');
    setSubtitles('Thinking...');
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          current_teacher: useAppStore.getState().activeTeacher 
        })
      });
      
      const data = await response.json();
      
      if (data.teacher) {
        useAppStore.getState().setActiveTeacher(data.teacher);
      }
      
      if (data.is_distress) {
         await playTTS(data.response);
      } else {
         await playTTS(data.response);
      }
    } catch (err) {
      console.error(err);
      setAvatarState('idle');
      setSubtitles('Error connecting to backend.');
    }
  };

  const [testInput, setTestInput] = React.useState('');

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 w-full max-w-2xl mx-auto relative">
      
      {/* Back Button */}
      <div className="absolute -top-12 left-0">
        <button 
          onClick={() => useAppStore.getState().goToLanding()}
          className="text-slate-400 hover:text-white flex items-center space-x-2 transition-colors"
        >
          <span>←</span>
          <span className="font-display uppercase tracking-wider text-sm">Back to Hub</span>
        </button>
      </div>

      {/* Avatar Visualizer */}
      <TeacherAvatar teacherId={activeTeacher} avatarState={avatarState} />
      
      {/* Subtitles Area */}
      <div className="min-h-[6rem] flex items-center justify-center w-full bg-slate-900/80 backdrop-blur-md text-white p-6 rounded-2xl border border-slate-700 shadow-xl">
        <p className="font-body text-xl md:text-2xl text-center leading-relaxed">
          {subtitles || 'Press the mic to talk to your teacher!'}
        </p>
      </div>

      {/* Mic Button */}
      <button 
        onClick={handleMicClick}
        disabled={isRecording || avatarState === 'speaking' || avatarState === 'thinking'}
        className={`px-12 py-5 rounded-full text-white font-display font-bold text-xl tracking-wide shadow-xl transition-all duration-200
          ${isRecording ? 'bg-rose-600 opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:scale-105 hover:shadow-fuchsia-500/30'}
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        `}
      >
        {isRecording ? 'Listening...' : 'Push to Talk'}
      </button>

      {/* Test Input (Fallback for Browser Agent) */}
      <div className="w-full flex space-x-2 mt-4">
        <input 
          type="text" 
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="Or type here to test..."
          className="flex-1 bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-cyan-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTextSubmit(testInput);
              setTestInput('');
            }
          }}
        />
        <button 
          onClick={() => {
            handleTextSubmit(testInput);
            setTestInput('');
          }}
          disabled={avatarState === 'speaking' || avatarState === 'thinking'}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default VoiceInterface;
