import * as videoRepo from './video.repository';
import * as progressRepo from '../progress/progress.repository';

export const getVideoDetailsWithAccess = async (videoId: number, userId: number) => {
  const video = await videoRepo.getVideoById(videoId);
  if (!video) return null;

  // MySQL returns BigInt for IDs — coerce to Number for correct indexOf comparison
  const globalSequence: number[] = (await videoRepo.getGlobalVideoSequenceBySubject(video.subject_id))
    .map((id: any) => Number(id));
  const currentIndex = globalSequence.indexOf(Number(videoId));

  let previous_video_id: number | null = null;
  let next_video_id: number | null = null;
  let locked = false;
  let unlock_reason: string | null = null;

  if (currentIndex > -1) {
    previous_video_id = currentIndex > 0 ? globalSequence[currentIndex - 1] : null;
    next_video_id = currentIndex < globalSequence.length - 1 ? globalSequence[currentIndex + 1] : null;

    if (previous_video_id) {
      const prog = await progressRepo.getVideoProgress(userId, previous_video_id);
      if (!prog || !prog.is_completed) {
        locked = true;
        unlock_reason = "Complete previous video to unlock";
      }
    }
  }

  const currentProgress = await progressRepo.getVideoProgress(userId, videoId);

  return { 
    video, 
    previous_video_id, 
    next_video_id, 
    locked, 
    unlock_reason,
    progress: currentProgress || { last_position_seconds: 0, is_completed: false }
  };
};
