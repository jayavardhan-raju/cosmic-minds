import useAppStore from '../store/appStore'

// Keep a global reference to prevent garbage collection (Chrome bug)
let currentUtterance = null;
let fallbackTimeout = null;

export const playTTS = (text) => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    
    // Cancel any ongoing speech to un-stick the engine
    window.speechSynthesis.cancel();
    if (fallbackTimeout) clearTimeout(fallbackTimeout);
    
    useAppStore.getState().setAvatarState('speaking');
    useAppStore.getState().setSubtitles(text);
    
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
       const funVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'));
       if (funVoice) currentUtterance.voice = funVoice;
    }
    
    currentUtterance.pitch = 1.2;
    currentUtterance.rate = 1.0;
    
    const finish = () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      useAppStore.getState().setAvatarState('idle');
      // keep subtitles so child can still read them
      resolve();
    };

    currentUtterance.onend = finish;
    currentUtterance.onerror = finish;

    window.speechSynthesis.speak(currentUtterance);
    
    // Fallback timeout in case onend never fires (common Chrome bug)
    // Roughly 100ms per character + 3 seconds padding
    const maxTime = (text.length * 100) + 3000;
    fallbackTimeout = setTimeout(finish, maxTime);
  });
}
