const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// GET /api/videos/:videoId
router.get('/:videoId', authenticateToken, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;

  try {
    const [videoRows] = await db.query(`
      SELECT v.*, s.subject_id 
      FROM videos v 
      JOIN sections s ON v.section_id = s.id 
      WHERE v.id = ?`, 
    [videoId]);
    
    if (videoRows.length === 0) return res.status(404).json({ error: 'Video not found' });
    const video = videoRows[0];
    const subjectId = video.subject_id;

    const [globalVideosMap] = await db.query(`
      SELECT v.id 
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      WHERE s.subject_id = ?
      ORDER BY s.order_index ASC, v.order_index ASC
    `, [subjectId]);

    const globalSequence = globalVideosMap.map(v => v.id);
    const currentIndex = globalSequence.indexOf(parseInt(videoId));

    if (currentIndex === -1) return res.status(500).json({ error: 'Data integrity error: video not in sequence' });

    const previous_video_id = currentIndex > 0 ? globalSequence[currentIndex - 1] : null;
    const next_video_id = currentIndex < globalSequence.length - 1 ? globalSequence[currentIndex + 1] : null;

    let locked = false;
    let unlock_reason = null;

    if (previous_video_id) {
      const [progRows] = await db.query('SELECT is_completed FROM video_progress WHERE user_id = ? AND video_id = ?', [userId, previous_video_id]);
      const prereqCompleted = progRows.length > 0 && progRows[0].is_completed;
      
      if (!prereqCompleted) {
        locked = true;
        unlock_reason = "Complete previous video(s) to unlock this content.";
      }
    }

    const [currentProg] = await db.query('SELECT last_position_seconds, is_completed FROM video_progress WHERE user_id = ? AND video_id = ?', [userId, videoId]);
    const progress = currentProg.length > 0 ? currentProg[0] : { last_position_seconds: 0, is_completed: false };

    res.json({
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        youtube_video_id: video.youtube_video_id,
        duration_seconds: video.duration_seconds
      },
      locked,
      unlock_reason,
      previous_video_id,
      next_video_id,
      progress
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/videos/:videoId/progress
router.post('/:videoId/progress', authenticateToken, async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id;
  const { last_position_seconds, is_completed } = req.body;

  try {
    await db.query(`
      INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed) 
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        last_position_seconds = VALUES(last_position_seconds),
        is_completed = VALUES(is_completed),
        completed_at = IF(VALUES(is_completed) = 1 AND completed_at IS NULL, NOW(), completed_at)
    `, [userId, videoId, last_position_seconds || 0, is_completed ? 1 : 0]);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating progress' });
  }
});


module.exports = router;
