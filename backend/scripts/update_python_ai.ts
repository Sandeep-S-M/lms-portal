import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
    ssl: { rejectUnauthorized: false }
  });

  // Update the video in the existing Python for AI subject
  const [result]: any = await c.query(`
    UPDATE videos v
    JOIN sections sec ON v.section_id = sec.id
    JOIN subjects sub ON sec.subject_id = sub.id
    SET v.youtube_video_id = ?, v.title = ?, v.duration_seconds = ?
    WHERE sub.slug = 'python-for-ai'
    ORDER BY v.order_index ASC
    LIMIT 1
  `, ['ygXn5nV5qFc', 'Python for AI - Full Course', 14400]);

  if (result.affectedRows === 0) {
    // Subject slug might differ — try by title LIKE
    const [r2]: any = await c.query(`
      UPDATE videos v
      JOIN sections sec ON v.section_id = sec.id
      JOIN subjects sub ON sec.subject_id = sub.id
      SET v.youtube_video_id = 'ygXn5nV5qFc', v.title = 'Python for AI - Full Course', v.duration_seconds = 14400
      WHERE sub.title LIKE '%Python%AI%'
      LIMIT 1
    `);
    console.log(`Updated ${r2.affectedRows} video(s) via title match.`);
  } else {
    console.log(`Updated ${result.affectedRows} video(s) via slug match.`);
  }

  await c.end();
})().catch(e => console.error('Update error:', e));
