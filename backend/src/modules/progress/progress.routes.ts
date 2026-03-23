import { Router } from 'express';
import { getSubjectProgress, getVideoProgress, updateVideoProgress } from './progress.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);
router.get('/subjects/:subjectId', getSubjectProgress);
router.get('/videos/:videoId', getVideoProgress);
router.post('/videos/:videoId', updateVideoProgress);

export default router;
