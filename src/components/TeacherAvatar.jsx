import React from 'react';

const TeacherAvatar = ({ teacherId, avatarState }) => {
  const isSpeaking = avatarState === 'speaking';
  const bounceClass = isSpeaking ? 'animate-pngtuber-bounce' : '';

  const getAvatarConfig = () => {
    switch (teacherId) {
      case 'professor-pi':
        return {
          imageSrc: '/avatars/professor-pi.png',
          label: 'Professor Pi'
        };
      case 'ollie-owl':
        return {
          imageSrc: '/avatars/ollie-owl.png',
          label: 'Ollie Owl'
        };
      case 'luna-explorer':
        return {
          imageSrc: '/avatars/luna-explorer.png',
          label: 'Luna Explorer'
        };
      case 'maestro-arlo':
        return {
          imageSrc: '/avatars/maestro-arlo.png',
          label: 'Maestro Arlo'
        };
      case 'coach-kai':
        return {
          imageSrc: '/avatars/coach-kai.png',
          label: 'Coach Kai'
        };
      case 'orchestrator':
      default:
        // Default to the original CSS orb for the orchestrator, or just a placeholder
        return {
          isSystem: true,
          label: 'Cosmic System'
        };
    }
  };

  const config = getAvatarConfig();

  if (config.isSystem) {
    // Render the original sleek orb for the orchestrator
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`relative w-48 h-48 rounded-full bg-slate-700 shadow-2xl flex items-center justify-center transition-transform duration-300
          ${avatarState === 'listening' ? 'scale-110' : ''}
          ${avatarState === 'thinking' ? 'scale-105 animate-pulse' : ''}
        `}>
           <div className="flex flex-col items-center space-y-4">
             <div className="flex space-x-6">
               <div className={`rounded-full w-3 h-3 bg-cyan-400 ${avatarState === 'thinking' ? 'animate-bounce' : ''}`} />
               <div className={`rounded-full w-3 h-3 bg-cyan-400 ${avatarState === 'thinking' ? 'animate-bounce' : ''}`} style={{ animationDelay: '100ms' }} />
             </div>
             <div className={`w-6 h-1 rounded-full bg-cyan-400 ${isSpeaking ? 'animate-lip-sync' : ''} origin-center transition-all duration-75`} />
           </div>
        </div>
        <div className="text-center">
          <h3 className="font-display font-bold text-xl text-white tracking-wider">{config.label}</h3>
          <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest">{avatarState}</p>
        </div>
      </div>
    );
  }

  // Render the beautiful AI-generated image for the teachers
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Avatar Image Container */}
      <div className={`relative w-48 h-48 rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-300 border-4 border-slate-700
        ${avatarState === 'listening' ? 'scale-110 border-teal-500' : ''}
        ${avatarState === 'thinking' ? 'scale-105 border-amber-500 opacity-80' : ''}
        ${isSpeaking ? 'border-fuchsia-500 shadow-fuchsia-500/50' : ''}
      `}>
        <img 
          src={config.imageSrc} 
          alt={config.label}
          className={`w-full h-full object-cover transform origin-bottom transition-all ${bounceClass}`}
        />
      </div>
      
      {/* Label */}
      <div className="text-center">
        <h3 className="font-display font-bold text-xl text-white tracking-wider">{config.label}</h3>
        <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest">{avatarState}</p>
      </div>
    </div>
  );
};

export default TeacherAvatar;
