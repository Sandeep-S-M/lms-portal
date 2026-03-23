import { Request, Response } from 'express';
import * as progressService from './progress.service';

export const getSubjectProgress = async (req: Request, res: Response) => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    const summary = await progressService.getSubjectProgress(r.user.id, subjectId);
    res.status(200).json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getVideoProgress = async (req: Request, res: Response) => {
  try {
    const r: any = req;
    const videoId = parseInt(r.params.videoId, 10);
    const progress = await progressService.getVideoProgress(r.user.id, videoId);
    res.status(200).json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateVideoProgress = async (req: Request, res: Response) => {
  try {
    const r: any = req;
    const videoId = parseInt(r.params.videoId, 10);
    const { last_position_seconds, is_completed } = req.body;
    await progressService.updateVideoProgress(r.user.id, videoId, last_position_seconds || 0, !!is_completed);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
