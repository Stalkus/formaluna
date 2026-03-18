import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { clearSessionCookie, readSession, setSessionCookie, signSession } from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      displayName: z.string().min(1).optional(),
      companyName: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
    })
    .parse(req.body);

  const passwordHash = await bcrypt.hash(body.password, 12);
  try {
    const user = await prisma.user.create({
      data: {
        role: 'B2B',
        email: body.email.toLowerCase(),
        passwordHash,
        displayName: body.displayName,
        companyName: body.companyName,
        phone: body.phone,
      },
      select: { id: true, email: true, approvalStatus: true, role: true },
    });
    res.status(201).json({ user });
  } catch (e: any) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Email already exists' });
    throw e;
  }
});

authRouter.post('/login', async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user || user.role !== 'B2B') return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(body.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signSession({
    sub: user.id,
    role: 'B2B',
    approvalStatus: user.approvalStatus,
  });
  setSessionCookie(res, token);
  res.json({
    user: { id: user.id, email: user.email, role: user.role, approvalStatus: user.approvalStatus },
  });
});

authRouter.post('/logout', async (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.post('/refresh', async (req, res) => {
  const session = readSession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (session.role !== 'B2B') return res.status(403).json({ error: 'Forbidden' });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true, approvalStatus: true },
  });
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const token = signSession({
    sub: user.id,
    role: 'B2B',
    approvalStatus: user.approvalStatus,
  });
  setSessionCookie(res, token);
  res.json({ user });
});

authRouter.get('/me', async (req, res) => {
  const session = readSession(req);
  if (!session) return res.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true, approvalStatus: true, displayName: true, companyName: true },
  });
  res.json({ user });
});

