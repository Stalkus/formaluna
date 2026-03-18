import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';

export const pagesRouter = Router();

pagesRouter.get('/pages/:slug', async (req, res) => {
  const slug = z.string().min(1).parse(req.params.slug);
  const page = await prisma.page.findUnique({
    where: { slug },
    select: { slug: true, title: true, contentJson: true, updatedAt: true },
  });
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json({ page });
});

