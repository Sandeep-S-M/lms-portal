import { Request, Response } from 'express';
import * as subjectService from './subject.service';

export const getAllSubjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string | undefined;
    const subjects = await subjectService.getPublishedSubjects(q);
    res.json(subjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSubject = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    const subject = await subjectService.getSubjectMeta(subjectId);
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSubjectTree = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    const tree = await subjectService.getSubjectTree(subjectId, r.user.id);
    if (!tree) {
       res.status(404).json({ error: 'Subject not found' });
       return;
    }
    res.json(tree);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSubjectFirstVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const r: any = req;
    const subjectId = parseInt(r.params.subjectId, 10);
    const firstVideoId = await subjectService.getFirstUnlockedVideo(subjectId, r.user.id);
    res.json({ video_id: firstVideoId });
  } catch(err) {
    res.status(500).json({ error: 'Server error' });
  }
};
