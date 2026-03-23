import { Request, Response } from 'express';
import * as authService from './auth.service';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '../../config/security';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  try {
    const { user, accessToken, refreshToken } = await authService.registerUser(name, email, password);
    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(201).json({ user, accessToken });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') res.status(409).json({ error: 'Email already exists' });
    else res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const result = await authService.loginUserByEmail(email, password);
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(200).json({ user: result.user, accessToken: result.accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    res.status(401).json({ error: 'No refresh token' });
    return;
  }

  try {
    const accessToken = await authService.refreshUserToken(refreshToken);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    try {
      await authService.logoutUser(refreshToken);
    } catch (err) {
      console.error(err);
    }
  }
  res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out' });
};
