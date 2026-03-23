import { Request, Response } from 'express';
import db from '../../config/db';

// GET all enrolled courses with stats for current user
export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const userId = r.user.id;

    // Fetch all enrolled subjects
    const [enrollments]: any = await db.query(`
      SELECT e.id as enrollment_id, e.created_at as enrolled_at,
             s.id, s.title, s.slug, s.description, s.is_published
      FROM enrollments e
      JOIN subjects s ON e.subject_id = s.id
      WHERE e.user_id = ?
      ORDER BY e.created_at DESC
    `, [userId]);

    // For each enrollment, compute progress stats
    const results = await Promise.all(enrollments.map(async (course: any) => {
      const [videoRows]: any = await db.query(`
        SELECT v.id FROM videos v
        JOIN sections sec ON v.section_id = sec.id
        WHERE sec.subject_id = ?
      `, [course.id]);

      const totalVideos = videoRows.length;

      const [completedRows]: any = await db.query(`
        SELECT COUNT(*) as cnt FROM video_progress vp
        JOIN videos v ON vp.video_id = v.id
        JOIN sections sec ON v.section_id = sec.id
        WHERE sec.subject_id = ? AND vp.user_id = ? AND vp.is_completed = 1
      `, [course.id, userId]);

      const completedVideos = Number(completedRows[0].cnt);
      const percent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

      let status = 'enrolled';
      if (percent === 100) status = 'completed';
      else if (completedVideos > 0) status = 'ongoing';

      return {
        ...course,
        total_videos: totalVideos,
        completed_videos: completedVideos,
        percent_complete: percent,
        status
      };
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get enrollment status for current user + subject
export const getEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    const [rows]: any = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
      [r.user.id, subjectId]
    );
    res.json({ enrolled: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Enroll current user in a subject
export const enrollInSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    await db.query(
      'INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)',
      [r.user.id, subjectId]
    );
    res.json({ enrolled: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Unenroll current user from a subject
export const unenrollFromSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    await db.query(
      'DELETE FROM enrollments WHERE user_id = ? AND subject_id = ?',
      [r.user.id, subjectId]
    );
    res.json({ enrolled: false });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
