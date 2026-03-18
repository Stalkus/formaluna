import jwt from 'jsonwebtoken';
import { env } from './env.js';

export type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'B2B';
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
};

const COOKIE_NAME = 'formaluna_session';

export function signSession(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function setSessionCookie(res: import('express').Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  });
}

export function clearSessionCookie(res: import('express').Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function readSession(req: import('express').Request): JwtPayload | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    return {
      sub: String(decoded.sub),
      role: decoded.role as JwtPayload['role'],
      approvalStatus: decoded.approvalStatus as JwtPayload['approvalStatus'],
    };
  } catch {
    return null;
  }
}

