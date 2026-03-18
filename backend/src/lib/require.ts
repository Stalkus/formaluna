import type { RequestHandler } from 'express';
import { readSession } from './auth.js';

export const requireAnySession: RequestHandler = (req, res, next) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).session = session;
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  (req as any).session = session;
  next();
};

export const requireApprovedB2B: RequestHandler = (req, res, next) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'B2B') return res.status(403).json({ error: 'Forbidden' });
  if (session.approvalStatus !== 'APPROVED')
    return res.status(403).json({ error: 'Account not approved yet' });
  (req as any).session = session;
  next();
};

