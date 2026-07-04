import React from 'react';
import useAppStore from '../store/appStore';
import TeacherAvatar from './TeacherAvatar';
import { playTTS } from '../services/ttsService';

const TEACHERS = [
  {
    id: 'professor-pi',
    name: 'Professor Pi',
    subject: 'Math & Numbers',
    description: 'Learn to count, add, and explore shapes!',
    color: 'from-blue-600 to-indigo-600',
    introPrompt: 'Hello! Please introduce yourself to the child in one or two short sentences and ask what math they want to learn today.'
  },
  {
    id: 'ollie-owl',
    name: 'Ollie Owl',
    subject: 'Reading & Words',
    description: 'Read fun stories and learn new words!',
    color: 'from-amber-600 to-orange-700',
    introPrompt: 'Hello! Please introduce yourself to the child in one or two short sentences and ask what story they want to hear.'
  },
  {
    id: 'luna-explorer',
    name: 'Luna Explorer',
    subject: 'Science & Space',
    description: 'Explore the stars, animals, and weather!',
    color: 'from-purple-600 to-fuchsia-600',
    introPrompt: 'Hello! Please introduce yourself to the child in one or two short sentences and ask what they want to explore today.'
  },
  {
    id: 'maestro-arlo',
    name: 'Maestro Arlo',
    subject: 'Art & Creativity',
    description: 'Draw, paint, and create beautiful art!',
    color: 'from-rose-500 to-pink-600',
    introPrompt: 'Hello! Please introduce yourself to the child in one or two short sentences and ask what they want to draw today.'
  },
  {
    id: 'coach-kai',
    name: 'Coach Kai',
    subject: 'Feelings & Friends',
    description: 'Talk about feelings, sharing, and kindness!',
    color: 'from-orange-500 to-amber-500',
    introPrompt: 'Hello! Please introduce yourself to the child in one or two short sentences and ask how they are feeling today.'
  }
];

const LandingPage = () => {
  const { setActiveTeacher, goToVoice, setAvatarState, setSubtitles } = useAppStore();

  const handleTeacherClick = async (teacher) => {
    setActiveTeacher(teacher.id);
    goToVoice();
    setAvatarState('thinking');
    setSubtitles('Loading your teacher...');
    
    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: teacher.introPrompt,
          force_route: teacher.id
        })
      });
      
      const data = await response.json();
      
      if (data.teacher) {
        setActiveTeacher(data.teacher);
      }
      
      await playTTS(data.response);
      
    } catch (err) {
      console.error("Failed to load intro", err);
      setAvatarState('idle');
      setSubtitles('Oops! I could not connect to the server.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-12">
        Who do you want to learn with today?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {TEACHERS.map(teacher => (
          <button 
            key={teacher.id}
            onClick={() => handleTeacherClick(teacher)}
            className="group relative w-full max-w-sm rounded-3xl p-1 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50"
          >
            {/* Gradient Border */}
            <div className={`absolute inset-0 bg-gradient-to-br ${teacher.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            
            {/* Card Content */}
            <div className="relative h-full bg-slate-900 rounded-[1.4rem] p-6 flex flex-col items-center text-center space-y-6">
              {/* Scale down the avatar slightly for the card */}
              <div className="transform scale-75 origin-top mb-4">
                <TeacherAvatar teacherId={teacher.id} avatarState="idle" />
              </div>
              
              <div className="-mt-8">
                <h3 className={`font-display font-bold text-2xl mb-2 bg-gradient-to-r ${teacher.color} bg-clip-text text-transparent`}>
                  {teacher.name}
                </h3>
                <p className="text-cyan-300 font-bold uppercase tracking-wider text-sm mb-3">
                  {teacher.subject}
                </p>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  {teacher.description}
                </p>
              </div>
              
              <div className={`mt-auto w-full py-3 rounded-xl bg-gradient-to-r ${teacher.color} text-white font-bold tracking-wider transform transition-transform group-hover:scale-[1.02]`}>
                Let's Go! 🚀
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
