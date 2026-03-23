import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdditionalDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306'),
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Connected to Aiven Database. Starting Additional User Seed...');

    // 1. Data Science Full Course
    const [sub1]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Data Science Full Course by Edureka', 'ds-full-course-edureka', 'A comprehensive 10-hour Data Science Masterclass covering Python, Machine Learning, and Neural Networks.', true]);
    const sub1Id = sub1.insertId;

    const [sec1A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub1Id, '10 Hour Masterclass Main View', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec1A.insertId, 'Data Science Full Course (10 Hours)', 'The complete unbroken marathon video payload.', '-ETQ97mXXF0', 0, 36000]);

    // 2. Math for Machine Learning
    const [sub2]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Math for Machine Learning', 'math-for-ml', 'The fundamental mathematics underlying modern AI algorithms.', true]);
    const sub2Id = sub2.insertId;

    const [sec2A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub2Id, 'Playlist Collection', 0]);
    // Note: Due to IFrame playlist limitations inside standard React players, we drop the exact primary video ID that initiates the PLlpUUtQ9RrF76jvALwrTp0oOGfk0EGC3s list.
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec2A.insertId, 'Math for ML Introduction', 'Starting mathematics concepts for machine learning.', 'RlbcA2k1w_E', 0, 720]);

    // 3. Trading for beginners
    const [sub3]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Trading for Beginners', 'trading-beginners-custom', 'Everything you need to know about stocks, candles, and day trading structures.', true]);
    const sub3Id = sub3.insertId;

    const [sec3A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub3Id, 'Forex & Stocks Overview', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec3A.insertId, 'Trading Masterclass', 'The initial foundations block of the trading architecture.', '_YVQN6_nkfs', 0, 1500]);

    console.log('Seed fully injected successfully!');
    await connection.end();

  } catch (error) {
    console.error('Seed failed:', error);
  }
};

seedAdditionalDatabase();
