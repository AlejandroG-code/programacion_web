import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { User } from '../database/models';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secure_default_secret_key_change_in_production';
const COOKIE_NAME = 'auth_token';

export interface AuthTokenPayload {
  userId: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Obtiene el usuario autenticado a partir de las cookies de la petición HTTP.
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await User.findByPk(payload.userId);
  if (!user || !user.isActive) return null;

  return user;
}

export const AUTH_COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  },
};
