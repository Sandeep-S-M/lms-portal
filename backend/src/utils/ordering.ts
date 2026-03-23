export const computeVideoAccess = (
  globalSequence: any[],
  progressMap: Record<number, boolean>
) => {
  for (let i = 0; i < globalSequence.length; i++) {
    const video = globalSequence[i];
    const isCompleted = !!progressMap[video.id];
    let isLocked = false;

    if (i > 0) {
      const prereqId = globalSequence[i - 1].id;
      const prereqCompleted = !!progressMap[prereqId];
      if (!prereqCompleted) {
        isLocked = true;
      }
    }

    video.is_completed = isCompleted;
    video.locked = isLocked;
  }
  return globalSequence;
};
