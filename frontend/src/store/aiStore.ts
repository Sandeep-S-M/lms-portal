import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface AIStore {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (prompt: string, context?: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (prompt, context) => {
    set({ isLoading: true, error: null });
    
    // Add user message immediately
    const userMessage: Message = { role: 'user', content: prompt };
    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const response = await apiClient.post('/ai/chat', { prompt, context });
      const aiResponse = response.data.response;

      const aiMessage: Message = { role: 'ai', content: aiResponse };
      set((state) => ({ 
        messages: [...state.messages, aiMessage],
        isLoading: false 
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to get AI response',
        isLoading: false 
      });
    }
  },

  clearChat: () => set({ messages: [], error: null })
}));
