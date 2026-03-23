import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { getMyEnrollments, getEnrollment, enrollInSubject, unenrollFromSubject } from './enrollment.controller';

const router = Router();

router.get('/my', authenticateToken, getMyEnrollments);
router.get('/:subjectId', authenticateToken, getEnrollment);
router.post('/:subjectId', authenticateToken, enrollInSubject);
router.delete('/:subjectId', authenticateToken, unenrollFromSubject);

export default router;
