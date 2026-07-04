import useAppStore from '../store/appStore'

let recognition = null;

export const startSTT = (onResult) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error("Speech Recognition API not supported in this browser.");
    alert("Speech Recognition is only supported in Chrome and Edge.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  let gotResult = false;

  recognition.onstart = () => {
    useAppStore.getState().setIsRecording(true);
    useAppStore.getState().setAvatarState('listening');
    useAppStore.getState().setSubtitles('Listening...');
  };

  recognition.onresult = (event) => {
    gotResult = true;
    const transcript = event.results[0][0].transcript;
    useAppStore.getState().setSubtitles(transcript);
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    useAppStore.getState().setIsRecording(false);
    useAppStore.getState().setAvatarState('idle');
    useAppStore.getState().setSubtitles('Error listening.');
  };

  recognition.onend = () => {
    useAppStore.getState().setIsRecording(false);
    if (!gotResult) {
      useAppStore.getState().setSubtitles("I didn't quite catch that. Could you try again?");
      useAppStore.getState().setAvatarState('idle');
    }
  };

  recognition.start();
};

export const stopSTT = () => {
  if (recognition) {
    recognition.stop();
  }
};
