import { Router } from 'express';
import { getAllSubjects, getSubject, getSubjectTree, getSubjectFirstVideo } from './subject.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.get('/', getAllSubjects);
router.get('/:subjectId', getSubject);
router.get('/:subjectId/tree', authenticateToken, getSubjectTree);
router.get('/:subjectId/first-video', authenticateToken, getSubjectFirstVideo);

export default router;
