'use client';
import React, { useEffect, useRef } from 'react';
import { updateProgress } from '../../lib/progress';

interface VideoPlayerProps {
  videoId: number;
  youtubeId: string;
  onEnded: () => void;
  startPositionSeconds: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, youtubeId, onEnded, startPositionSeconds }) => {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadYouTubeAPI = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0] || document.scripts[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            document.head.appendChild(tag);
        }
        (window as any).onYouTubeIframeAPIReady = () => {
          if (isMounted) initializePlayer();
        };
      } else {
        initializePlayer();
      }
    };

    const initializePlayer = () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      
      playerRef.current = new (window as any).YT.Player(`youtube-player-${videoId}`, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          start: Math.floor(startPositionSeconds),
          rel: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                  updateProgress(videoId, playerRef.current.getCurrentTime(), false);
                }
              }, 5000); // Emits onProgress every N seconds
            } 
            else if (event.data === (window as any).YT.PlayerState.PAUSED) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              if (playerRef.current && playerRef.current.getCurrentTime) {
                 updateProgress(videoId, playerRef.current.getCurrentTime(), false);
              }
            }
            else if (event.data === (window as any).YT.PlayerState.ENDED) {
              if (intervalRef.current) clearInterval(intervalRef.current);
              
              if (playerRef.current && playerRef.current.getCurrentTime) {
                 updateProgress(videoId, playerRef.current.getCurrentTime(), true);
              } else {
                 updateProgress(videoId, 0, true);
              }
              onEnded();
            }
          }
        }
      });
    };

    loadYouTubeAPI();

    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId, youtubeId, startPositionSeconds, onEnded]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md ring-1 ring-slate-900/5">
      <div id={`youtube-player-${videoId}`} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
