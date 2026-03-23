import * as subjectRepo from './subject.repository';
import * as sectionRepo from '../sections/section.repository';
import * as videoRepo from '../videos/video.repository';
import * as progressRepo from '../progress/progress.repository';
import { computeVideoAccess } from '../../utils/ordering';

export const getPublishedSubjects = async (q?: string) => {
  return await subjectRepo.getPublishedSubjects(q);
};

export const getSubjectMeta = async (subjectId: number) => {
  return await subjectRepo.getSubjectById(subjectId);
};

export const getSubjectTree = async (subjectId: number, userId: number) => {
  const subject = await subjectRepo.getSubjectById(subjectId);
  if (!subject) return null;

  const sections = await sectionRepo.getSectionsBySubjectId(subjectId);
  if (sections.length === 0) return { ...subject, sections: [] };

  const sectionIds = sections.map((s: any) => s.id);
  const videos = await videoRepo.getVideosBySectionIds(sectionIds);

  const globalSequence = videos; 
  const videoIds = globalSequence.map((v: any) => v.id);

  const progressMap: Record<number, boolean> = {};
  for (const vId of videoIds) {
    const prog = await progressRepo.getVideoProgress(userId, vId);
    progressMap[vId] = prog ? !!prog.is_completed : false;
  }

  const computedSequence = computeVideoAccess(globalSequence, progressMap);

  const tree = sections.map((sec: any) => ({
    ...sec,
    videos: computedSequence.filter((v: any) => v.section_id === sec.id)
  }));

  return { ...subject, sections: tree };
};

export const getFirstUnlockedVideo = async (subjectId: number, userId: number) => {
  const treeData = await getSubjectTree(subjectId, userId);
  if (!treeData) return null;
  
  let firstUnlockedId = null;
  for (const sec of treeData.sections) {
    for (const v of sec.videos) {
      if (!v.locked) {
        firstUnlockedId = v.id;
        break;
      }
    }
    if (firstUnlockedId) break;
  }
  return firstUnlockedId;
};
