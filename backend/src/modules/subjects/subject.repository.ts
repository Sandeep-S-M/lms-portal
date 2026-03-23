import db from '../../config/db';

export const getPublishedSubjects = async (q?: string) => {
  if (q) {
    const searchTerm = `%${q}%`;
    const [subjects]: any = await db.query(
      'SELECT * FROM subjects WHERE is_published = TRUE AND (title LIKE ? OR description LIKE ?) ORDER BY created_at DESC',
      [searchTerm, searchTerm]
    );
    return subjects;
  }
  const [subjects]: any = await db.query('SELECT * FROM subjects WHERE is_published = TRUE ORDER BY created_at DESC');
  return subjects;
};

export const getSubjectById = async (subjectId: number) => {
  const [rows]: any = await db.query('SELECT * FROM subjects WHERE id = ? AND is_published = TRUE', [subjectId]);
  return rows[0] || null;
};
