import db from '../../config/db';

export const getSectionsBySubjectId = async (subjectId: number) => {
  const [sections]: any = await db.query('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);
  return sections;
};
