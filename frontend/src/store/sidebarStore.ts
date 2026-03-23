import { create } from 'zustand';

interface SidebarState {
  tree: any[];
  loading: boolean;
  error: string | null;
  setTree: (tree: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markVideoCompleted: (videoId: number) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  tree: [],
  loading: false,
  error: null,
  setTree: (tree) => set({ tree }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  markVideoCompleted: (videoId) => set((state) => {
    const newTree = state.tree.map((section: any) => ({
      ...section,
      videos: section.videos.map((v: any) => v.id === videoId ? { ...v, is_completed: true } : v)
    }));
    return { tree: newTree };
  })
}));
