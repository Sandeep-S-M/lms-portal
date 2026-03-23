'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../../../lib/apiClient';
import { useSidebarStore } from '../../../../../store/sidebarStore';
import { useVideoStore } from '../../../../../store/videoStore';
import { VideoPlayer } from '../../../../../components/Video/VideoPlayer';
import { Spinner } from '../../../../../components/common/Spinner';
import { Button } from '../../../../../components/common/Button';
import { updateProgress } from '../../../../../lib/progress';

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = parseInt(params.videoId as string);
  const subjectId = parseInt(params.subjectId as string);
  
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { markVideoCompleted } = useSidebarStore();
  const { setVideoDetails } = useVideoStore();

  useEffect(() => {
    if (!videoId) return;
    
    let isSubscribed = true;
    setLoading(true);
    setError(null);
    setVideoData(null);
    setVideoDetails({ currentVideoId: videoId, subjectId });

    apiClient.get(`/videos/${videoId}`)
      .then(res => {
        if (!isSubscribed) return;
        setVideoData(res.data);
      })
      .catch(err => {
        if (!isSubscribed) return;
        setError(err.response?.data?.error || 'Failed to load video');
      })
      .finally(() => {
         if (isSubscribed) setLoading(false);
      });
      
    return () => { isSubscribed = false; };
  }, [videoId, subjectId, setVideoDetails]);

  const handleVideoEnded = () => {
    markVideoCompleted(videoId);
    if (videoData?.next_video_id) {
      router.push(`/subjects/${subjectId}/video/${videoData.next_video_id}`);
    }
  };

  const handleManualComplete = () => {
    updateProgress(videoId, videoData?.progress?.last_position_seconds || 0, true);
    markVideoCompleted(videoId);
    if (videoData?.next_video_id) {
      router.push(`/subjects/${subjectId}/video/${videoData.next_video_id}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 m-8 rounded-xl border border-red-200 shadow-sm max-w-2xl mx-auto">
        {error}
      </div>
    );
  }

  // Not yet loaded (safeguard)
  if (!videoData || !videoData.video) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Locked state
  if (videoData.locked) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-5xl">🔒</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Content Locked</h2>
        <p className="text-slate-600 max-w-md text-lg">
          {videoData.unlock_reason || 'Complete previous units in the curriculum sequence to unlock this material.'}
        </p>
        {videoData.previous_video_id && (
          <Button 
            className="mt-8 py-3 px-6 shadow-md hover:shadow-lg transition-all" 
            onClick={() => router.push(`/subjects/${subjectId}/video/${videoData.previous_video_id}`)}
          >
            Return to Previous Video
          </Button>
        )}
      </div>
    );
  }

  const video = videoData.video;
  const progress = videoData.progress || { last_position_seconds: 0, is_completed: false };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 xl:p-12">
      <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          {video.title}
        </h1>
        {progress.is_completed && (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold leading-none bg-emerald-100 text-emerald-800 tracking-wide uppercase">
            ✓ Completed
          </span>
        )}
      </div>

      <VideoPlayer 
        videoId={video.id} 
        youtubeId={video.youtube_video_id} 
        startPositionSeconds={progress.last_position_seconds || 0}
        onEnded={handleVideoEnded}
      />

      <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Overview</h3>
        <p className="text-slate-700 leading-relaxed max-w-prose whitespace-pre-line text-lg">
          {video.description || 'Welcome to this lesson! Watch the video to completion to unlock the next material.'}
        </p>
        
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {!progress.is_completed && (
              <Button variant="outline" className="border-slate-300 text-slate-700" onClick={handleManualComplete}>
                ✓ Mark as Completed
              </Button>
            )}
            {videoData.next_video_id && (
              <Button 
                className="font-semibold px-6 shadow-sm hover:shadow-md" 
                onClick={() => router.push(`/subjects/${subjectId}/video/${videoData.next_video_id}`)}
              >
                Next Lesson →
              </Button>
            )}
          </div>
          {videoData.previous_video_id && (
            <button 
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              onClick={() => router.push(`/subjects/${subjectId}/video/${videoData.previous_video_id}`)}
            >
              ← Previous
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
