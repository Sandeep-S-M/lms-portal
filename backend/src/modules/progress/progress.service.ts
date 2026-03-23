import * as progressRepo from './progress.repository';

export const getSubjectProgress = async (userId: number, subjectId: number) => {
  return await progressRepo.getSubjectProgressSummary(userId, subjectId);
};

export const getVideoProgress = async (userId: number, videoId: number) => {
  const record = await progressRepo.getVideoProgress(userId, videoId);
  if (!record) return { last_position_seconds: 0, is_completed: false };
  return { last_position_seconds: record.last_position_seconds, is_completed: !!record.is_completed };
};

export const updateVideoProgress = async (userId: number, videoId: number, lastPos: number, isCompleted: boolean) => {
  await progressRepo.updateVideoProgress(userId, videoId, lastPos, isCompleted);
};
