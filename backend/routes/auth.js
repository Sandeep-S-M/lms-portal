const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
};

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, password_hash]
    );

    const userId = result.insertId;
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.execute(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [userId, tokenHash, expiresAt]
    );

    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(201).json({ user: { id: userId, name, email }, accessToken });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.execute(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, tokenHash, expiresAt]
    );

    res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email }, accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const [rows] = await db.execute('SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > NOW()', [tokenHash, payload.id]);
    if (rows.length === 0) return res.status(403).json({ error: 'Invalid or revoked refresh token' });

    const accessToken = generateAccessToken(payload.id);
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    try {
      const tokenHash = hashToken(refreshToken);
      await db.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tokenHash]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }
  res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
