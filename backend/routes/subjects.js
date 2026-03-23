const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all published subjects (public access for listing)
router.get('/', async (req, res) => {
  try {
    const [subjects] = await db.query('SELECT * FROM subjects WHERE is_published = TRUE ORDER BY created_at DESC');
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/subjects/:subjectId/tree 
// Returns subject nested tree, per-video lock status and progress mapping 
router.get('/:subjectId/tree', authenticateToken, async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Fetch Subject
    const [subjectRows] = await db.query('SELECT * FROM subjects WHERE id = ? AND is_published = TRUE', [subjectId]);
    if (subjectRows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    const subject = subjectRows[0];

    // 2. Fetch Sections mapped properly
    const [sections] = await db.query('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);
    
    if (sections.length === 0) {
      return res.json({ subject, tree: [] });
    }

    // 3. Fetch all videos mapped out with proper global sequence ordering
    const [videos] = await db.query(`
      SELECT v.* 
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      WHERE s.subject_id = ?
      ORDER BY s.order_index ASC, v.order_index ASC
    `, [subjectId]);

    const tree = sections.map(sec => ({
      ...sec,
      videos: videos.filter(v => v.section_id === sec.id)
    }));

    // Flatten to global sequence for prerequisites check
    const globalSequence = videos; // it's already properly ordered by SQL

    // 4. Fetch User Progress
    const videoIds = globalSequence.map(v => v.id);
    let progressMap = {};
    if (videoIds.length > 0) {
      const [progressRows] = await db.query(
        `SELECT video_id, is_completed FROM video_progress WHERE user_id = ? AND video_id IN (?)`,
        [userId, videoIds]
      );
      progressRows.forEach(row => {
        progressMap[row.video_id] = row.is_completed;
      });
    }

    // 5. Compute locked status strictly enforcing global sequence
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

    res.json({ subject, tree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
