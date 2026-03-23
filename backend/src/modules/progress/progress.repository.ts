import db from '../../config/db';

export const getSubjectProgressSummary = async (userId: number, subjectId: number) => {
  const [vidRows]: any = await db.execute(`
    SELECT v.id FROM videos v
    JOIN sections s ON v.section_id = s.id
    WHERE s.subject_id = ?
  `, [subjectId]);

  if (vidRows.length === 0) return { total_videos: 0, completed_videos: 0, percent_complete: 0 };

  const videoIds = vidRows.map((r: any) => r.id);
  const [progRows]: any = await db.query(`
    SELECT COUNT(*) as completed_videos FROM video_progress
    WHERE user_id = ? AND video_id IN (?) AND is_completed = TRUE
  `, [userId, videoIds]);

  const completed = progRows[0].completed_videos;
  const total = videoIds.length;
  return {
    total_videos: total,
    completed_videos: completed,
    percent_complete: Math.round((completed / total) * 100)
  };
};

export const getVideoProgress = async (userId: number, videoId: number) => {
  const [rows]: any = await db.execute('SELECT * FROM video_progress WHERE user_id = ? AND video_id = ?', [userId, videoId]);
  return rows[0] || null;
};

export const updateVideoProgress = async (userId: number, videoId: number, lastPos: number, isCompleted: boolean) => {
  await db.execute(`
    INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed) 
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      last_position_seconds = VALUES(last_position_seconds),
      is_completed = VALUES(is_completed),
      completed_at = IF(VALUES(is_completed) = 1 AND completed_at IS NULL, NOW(), completed_at)
  `, [userId, videoId, lastPos, isCompleted ? 1 : 0]);
};
