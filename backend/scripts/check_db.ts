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

  const [users]: any = await c.query('SELECT id, name, email FROM users');
  console.log('\n=== USERS ===');
  console.table(users);

  const [enrollments]: any = await c.query('SELECT * FROM enrollments');
  console.log('\n=== ENROLLMENTS ===');
  console.table(enrollments);

  const [subjects]: any = await c.query('SELECT id, title, slug FROM subjects');
  console.log('\n=== SUBJECTS ===');
  console.table(subjects);

  await c.end();
})().catch(e => console.error(e));
