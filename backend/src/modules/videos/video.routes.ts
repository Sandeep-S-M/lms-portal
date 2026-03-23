import { Router } from 'express';
import { getVideo } from './video.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
router.get('/:videoId', authenticateToken, getVideo);
export default router;
