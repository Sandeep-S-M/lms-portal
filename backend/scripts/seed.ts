import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Force load correct env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
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

    console.log('Connected to Aiven Database. Starting Seed...');

    // Clear existing data (in correct cascade order)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE table video_progress');
    await connection.query('TRUNCATE table enrollments');
    await connection.query('TRUNCATE table videos');
    await connection.query('TRUNCATE table sections');
    await connection.query('TRUNCATE table subjects');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Cleared existing curriculum data.');

    // 1. Python for AI
    const [sub1]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Python for AI', 'python-for-ai', 'Master Python programming specifically geared towards Artificial Intelligence and Machine Learning architecture.', true]);
    const sub1Id = sub1.insertId;

    const [sec1A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub1Id, 'Module 1: Foundations', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec1A.insertId, 'Introduction to Python', 'Learn the absolute basics of Python variables and syntax', 'rfscVS0vtbw', 0, 310]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec1A.insertId, 'Advanced Looping applied to AI Datasets', 'Processing large datasets using Python loops.', 'k9TUPpGqYTo', 1, 450]);

    // 2. Data Science for Beginners
    const [sub2]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Data Science for Beginners', 'data-science-beginners', 'An end-to-end masterclass on Pandas, NumPy, and Data Visualization.', true]);
    const sub2Id = sub2.insertId;

    const [sec2A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub2Id, 'Getting Started with Data', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec2A.insertId, 'Data Science Intro', 'What exactly is Data Science?', 'ua-CiDNNj30', 0, 500]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec2A.insertId, 'Loading Data in Pandas', 'How to cleanly load CSV files using Python.', 'ZyhVh-qRZPA', 1, 600]);

    // 3. Excel Masterclass
    const [sub3]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Excel Masterclass', 'excel-masterclass', 'Learn Excel starting from basics all the way to advanced VBA scripting and Pivot tables.', true]);
    const sub3Id = sub3.insertId;

    const [sec3A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub3Id, 'Worksheets and Basics', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec3A.insertId, 'Excel Beginner Tutorial', 'Getting started with rows, columns, and data types.', 'Vl0H-qTcleg', 0, 800]);

    // 4. Basics of AI
    const [sub4]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Basics of AI', 'basics-of-ai', 'Understand the theoretical foundation of Artificial Intelligence.', true]);
    const sub4Id = sub4.insertId;

    const [sec4A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub4Id, 'Introductory Concepts', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec4A.insertId, 'What is AI?', 'An overview of machine learning vs AI.', 'JMUxmLyrhSk', 0, 300]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec4A.insertId, 'Neural Networks Explained', 'How the brain inspired modern deep learning matrices.', 'aircAruvnKk', 1, 400]);

    // 5. All you need to know about trading
    const [sub5]: any = await connection.query(`INSERT INTO subjects (title, slug, description, is_published) VALUES (?, ?, ?, ?)`, 
      ['Trading Fundamentals', 'trading-fundamentals', 'All you need to know about options trading, moving averages, and market indicators.', true]);
    const sub5Id = sub5.insertId;

    const [sec5A]: any = await connection.query(`INSERT INTO sections (subject_id, title, order_index) VALUES (?, ?, ?)`, [sub5Id, 'Market Dynamics', 0]);
    await connection.query(`INSERT INTO videos (section_id, title, description, youtube_video_id, order_index, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`, 
      [sec5A.insertId, 'Day Trading Setup', 'How to read candlestick charts and patterns.', 'p7HKvqRI_Bo', 0, 500]);

    console.log('Seed fully injected successfully!');
    await connection.end();

  } catch (error) {
    console.error('Seed failed:', error);
  }
};

seedDatabase();
