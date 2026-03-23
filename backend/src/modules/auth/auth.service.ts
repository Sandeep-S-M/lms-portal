import db from '../../config/db';
import { hashPassword, comparePassword, hashToken } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export const registerUser = async (name: string, email: string, password: string) => {
  const pwdHash = await hashPassword(password);
  const [result]: any = await db.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, pwdHash]
  );
  
  const userId = result.insertId;
  return await loginUserById(userId, { id: userId, name, email });
};

export const loginUserByEmail = async (email: string, password: string) => {
  const [rows]: any = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return null;
  
  const user = rows[0];
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) return null;

  return await loginUserById(user.id, { id: user.id, name: user.name, email: user.email });
};

const loginUserById = async (userId: number, userData: any) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  const tHash = hashToken(refreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await db.execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tHash, expiresAt]
  );

  return { user: userData, accessToken, refreshToken };
};

export const refreshUserToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const tHash = hashToken(refreshToken);

  const [rows]: any = await db.execute(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL AND expires_at > NOW()',
    [tHash, payload.id]
  );

  if (rows.length === 0) throw new Error('Invalid token');

  const accessToken = generateAccessToken(payload.id);
  return accessToken;
};

export const logoutUser = async (refreshToken: string) => {
  const tHash = hashToken(refreshToken);
  await db.execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tHash]);
};
