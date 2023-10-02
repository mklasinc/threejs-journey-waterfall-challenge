import { create } from 'zustand'
import type { AudioMixNodes } from './components/AudioMix'

interface State {
  isLoaded: boolean
  setIsLoaded: (isLoaded: boolean) => void
  isMuted: boolean
  setIsMuted: (isMuted: boolean) => void
  toggleIsMuted: () => void
  hasUserInteracted: boolean
  setHasUserInteracted: (hasUserInteracted: boolean) => void
  audioMixNodes: AudioMixNodes | null
  setAudioMixNodes: (audioMixNodes: AudioMixNodes) => void
}

export const useStore = create<State>()((set) => ({
  isLoaded: false,
  setIsLoaded: (isLoaded) => set({ isLoaded }),
  isMuted: false,
  setIsMuted: (isMuted) => set({ isMuted }),
  toggleIsMuted: () => set((state) => ({ isMuted: !state.isMuted })),
  hasUserInteracted: false,
  setHasUserInteracted: (hasUserInteracted) => set({ hasUserInteracted }),
  audioMixNodes: null,
  setAudioMixNodes: (audioMixNodes) => set({ audioMixNodes }),
}))
