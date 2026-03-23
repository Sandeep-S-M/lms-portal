import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306')
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'secret'
  }
};
