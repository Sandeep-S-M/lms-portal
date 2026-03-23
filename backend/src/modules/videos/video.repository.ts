import db from '../../config/db';

export const getVideosBySectionIds = async (sectionIds: number[]) => {
  if (sectionIds.length === 0) return [];
  const [videos]: any = await db.query(`
    SELECT v.* 
    FROM videos v
    JOIN sections s ON v.section_id = s.id
    WHERE s.id IN (?)
    ORDER BY s.order_index ASC, v.order_index ASC
  `, [sectionIds]);
  return videos;
};

export const getVideoById = async (videoId: number) => {
  const [rows]: any = await db.query(`
    SELECT v.*, s.subject_id 
    FROM videos v 
    JOIN sections s ON v.section_id = s.id 
    WHERE v.id = ?
  `, [videoId]);
  return rows[0] || null;
};

export const getGlobalVideoSequenceBySubject = async (subjectId: number) => {
  const [videos]: any = await db.query(`
    SELECT v.id 
    FROM videos v
    JOIN sections s ON v.section_id = s.id
    WHERE s.subject_id = ?
    ORDER BY s.order_index ASC, v.order_index ASC
  `, [subjectId]);
  return videos.map((v: any) => v.id);
};
