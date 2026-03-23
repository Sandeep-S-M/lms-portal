import mysql from 'mysql2/promise';
import { config } from './env';

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  port: config.db.port,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectTimeout: 5000,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
