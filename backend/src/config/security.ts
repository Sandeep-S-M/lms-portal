import { CookieOptions } from 'express';

export const CORS_OPTIONS = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};
