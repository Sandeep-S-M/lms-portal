import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CORS_OPTIONS } from './config/security';

import authRoutes from './modules/auth/auth.routes';
import healthRoutes from './modules/health/health.routes';
import subjectRoutes from './modules/subjects/subject.routes';
import videoRoutes from './modules/videos/video.routes';
import progressRoutes from './modules/progress/progress.routes';

import enrollmentRoutes from './modules/enrollments/enrollment.routes';

const app: Application = express();

app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enrollments', enrollmentRoutes);

export default app;
