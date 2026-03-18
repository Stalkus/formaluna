import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { readSession } from '../lib/auth.js';

export const publicRouter = Router();

async function canSeePricing(req: Request) {
  const session = readSession(req);
  if (!session) return false;
  if (session.role === 'ADMIN') return true;
  if (session.role !== 'B2B') return false;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { approvalStatus: true },
  });
  return user?.approvalStatus === 'APPROVED';
}

publicRouter.get('/products', async (req, res) => {
  const pricingOk = await canSeePricing(req);

  const portal = z.enum(['studio', 'nova']).optional().safeParse(req.query.portal).data;
  const category = z.string().min(1).optional().safeParse(req.query.category).data;

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      ...(portal === 'studio' ? { isStudioProject: true } : {}),
      ...(portal === 'nova' ? { isNovaTrade: true } : {}),
      ...(category ? { category } : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      packshotUrl: true,
      lifestyleUrl: true,
      isNovaTrade: true,
      isStudioProject: true,
      hidePricing: true,
      priceCents: true,
      currency: true,
      specs: true,
      assets: { select: { id: true, kind: true, publicUrl: true, objectKey: true } },
    },
  });

  res.json({
    products: products.map((p) => ({
      ...p,
      priceCents: pricingOk && !p.hidePricing ? p.priceCents : null,
      currency: pricingOk && !p.hidePricing ? p.currency : null,
    })),
  });
});

publicRouter.get('/products/:slug', async (req, res) => {
  const pricingOk = await canSeePricing(req);

  const slug = z.string().min(1).parse(req.params.slug);
  const p = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      description: true,
      packshotUrl: true,
      lifestyleUrl: true,
      isNovaTrade: true,
      isStudioProject: true,
      hidePricing: true,
      priceCents: true,
      currency: true,
      specs: true,
      assets: { select: { id: true, kind: true, publicUrl: true, objectKey: true } },
      projectLinks: { select: { project: { select: { id: true, slug: true, title: true } } } },
      relatedFrom: {
        select: {
          relatedProduct: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });
  if (!p) return res.status(404).json({ error: 'Not found' });

  res.json({
    product: {
      ...p,
      priceCents: pricingOk && !p.hidePricing ? p.priceCents : null,
      currency: pricingOk && !p.hidePricing ? p.currency : null,
      projects: p.projectLinks.map((x) => x.project),
      relatedProducts: p.relatedFrom.map((x) => x.relatedProduct),
      projectLinks: undefined,
      relatedFrom: undefined,
    },
  });
});

publicRouter.get('/projects', async (_req, res) => {
  const projects = await prisma.project.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      categoryTags: true,
      coverImageUrl: true,
      description: true,
      galleryUrls: true,
      assets: { select: { id: true, kind: true, publicUrl: true, objectKey: true } },
    },
  });
  res.json({ projects });
});

publicRouter.get('/projects/:slug', async (req, res) => {
  const slug = z.string().min(1).parse(req.params.slug);
  const project = await prisma.project.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      categoryTags: true,
      coverImageUrl: true,
      description: true,
      galleryUrls: true,
      assets: { select: { id: true, kind: true, publicUrl: true, objectKey: true } },
      productLinks: {
        select: {
          product: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json({ project: { ...project, products: project.productLinks.map((x) => x.product), productLinks: undefined } });
});

