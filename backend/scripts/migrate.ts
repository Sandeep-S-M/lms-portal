import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load locally configured env keys
dotenv.config();

const runMigration = async () => {
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

    console.log('Connected to Aiven MySQL database successfully!');

    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and remove empty queries
    const queries = schema.split(';').map(q => q.trim()).filter(q => q.length > 0);

    for (let currentQuery of queries) {
      console.log(`Executing: ${currentQuery.substring(0, 50).replace(/\n/g, ' ')}...`);
      await connection.query(currentQuery);
    }

    console.log('Database schema successfully initialized!');
    await connection.end();
  } catch (error) {
    console.error('Remote Migration failed:');
    console.error(error);
  }
};

runMigration();
