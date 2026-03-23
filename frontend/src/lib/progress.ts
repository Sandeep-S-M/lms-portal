import { apiClient } from './apiClient';

let debounceTimer: NodeJS.Timeout;

export const updateProgress = (videoId: number, seconds: number, isCompleted: boolean) => {
  if (isCompleted) {
    clearTimeout(debounceTimer);
    apiClient.post(`/progress/videos/${videoId}`, {
      last_position_seconds: Math.floor(seconds),
      is_completed: true
    }).catch(console.error);
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    apiClient.post(`/progress/videos/${videoId}`, {
      last_position_seconds: Math.floor(seconds),
      is_completed: false
    }).catch(console.error);
  }, 2000); // 2-second debounce
};
