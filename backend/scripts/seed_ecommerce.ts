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

  const [s]: any = await c.query(
    'INSERT INTO subjects (title, slug, description, is_published) VALUES (?,?,?,?)',
    [
      'Complete eCommerce & Dropshipping Mastery',
      'ecommerce-dropshipping-mastery',
      'Learn how to build a profitable dropshipping business and sell products online. Covers product research, store setup, ads, and scaling strategies.',
      true
    ]
  );

  const sid = s.insertId;
  const [sec]: any = await c.query(
    'INSERT INTO sections (subject_id, title, order_index) VALUES (?,?,?)',
    [sid, 'Full Course', 0]
  );

  await c.query(
    'INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?,?,?,?,?,?)',
    [
      sec.insertId,
      'Complete Dropshipping & eCommerce Course',
      'Everything you need to build a product business that sells — from niche selection and store setup to running profitable ad campaigns and scaling.',
      'q8d9uuO1Cf4',
      0,
      7200
    ]
  );

  console.log('eCommerce course inserted successfully!');
  await c.end();
})().catch(e => console.error('Seed error:', e));
