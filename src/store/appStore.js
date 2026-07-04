import { create } from 'zustand'

const useAppStore = create((set) => ({
  avatarState: 'idle', // 'idle' | 'listening' | 'thinking' | 'speaking'
  activeTeacher: 'orchestrator',
  currentView: 'landing', // 'landing' | 'voice'
  subtitles: '',
  isRecording: false,
  isDashboardOpen: false,
  isGateOpen: false,
  isAuthenticated: false,
  
  setAvatarState: (state) => set({ avatarState: state }),
  setActiveTeacher: (teacher) => set({ activeTeacher: teacher }),
  goToVoice: () => set({ currentView: 'voice' }),
  goToLanding: () => set({ currentView: 'landing', activeTeacher: 'orchestrator' }),
  setSubtitles: (text) => set({ subtitles: text }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  openGate: () => set({ isGateOpen: true }),
  closeGate: () => set({ isGateOpen: false }),
  authenticate: () => set({ isAuthenticated: true, isGateOpen: false, isDashboardOpen: true }),
  closeDashboard: () => set({ isDashboardOpen: false, isAuthenticated: false }),
}))

export default useAppStore
