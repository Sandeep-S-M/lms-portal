import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ id: userId }, config.jwt.accessSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, { expiresIn: '30d' });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.jwt.refreshSecret);
};
