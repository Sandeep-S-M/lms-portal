import { create } from 'zustand';

interface VideoState {
  currentVideoId: number | null;
  subjectId: number | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isCompleted: boolean;
  nextVideoId: number | null;
  prevVideoId: number | null;
  setVideoDetails: (data: Partial<VideoState>) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  subjectId: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isCompleted: false,
  nextVideoId: null,
  prevVideoId: null,
  setVideoDetails: (data) => set((state) => ({ ...state, ...data }))
}));
