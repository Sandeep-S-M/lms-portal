import { Router } from 'express';
import { chatWithAI, summarizeLesson } from './ai.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.post('/chat', authenticateToken, chatWithAI);
router.post('/summarize', authenticateToken, summarizeLesson);

export default router;
