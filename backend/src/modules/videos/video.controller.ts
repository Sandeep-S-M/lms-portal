import { Request, Response } from 'express';
import * as videoService from './video.service';

export const getVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const videoId = parseInt(r.params.videoId, 10);
    const videoData = await videoService.getVideoDetailsWithAccess(videoId, r.user.id);
    if (!videoData) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    res.json(videoData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
