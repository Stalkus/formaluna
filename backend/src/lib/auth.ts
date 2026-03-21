import jwt from 'jsonwebtoken';
import { env } from './env.js';

export type JwtPayload = {
  sub: string;
  role: 'ADMIN' | 'B2B';
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
};

const COOKIE_NAME = 'formaluna_session';

export function signSession(payload: JwtPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function cookieOptions(): {
  httpOnly: boolean;
  sameSite: 'lax' | 'none' | 'strict';
  secure: boolean;
  path: string;
} {
  const sameSite = env.SESSION_COOKIE_SAMESITE;
  const secure = sameSite === 'none' ? true : env.NODE_ENV === 'production';
  return { httpOnly: true, sameSite, secure, path: '/' };
}

export function setSessionCookie(res: import('express').Response, token: string) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

export function clearSessionCookie(res: import('express').Response) {
  const o = cookieOptions();
  res.clearCookie(COOKIE_NAME, { path: o.path, sameSite: o.sameSite, secure: o.secure });
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

