import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { readSession } from '../lib/auth.js';
import {
  categoryMatchWhere,
  displayCategoryName,
  displayCategorySlug,
  portalProductWhere,
  technicalSheetsFromAssets,
} from '../lib/productPublic.js';

export const publicRouter = Router();

const assetSelect = { id: true, kind: true, publicUrl: true, objectKey: true, label: true };

async function canSeePricing(req: Request) {
  const session = readSession(req);
  if (!session) return false;
  if (session.role === 'ADMIN') return true;
  if (session.role !== 'B2B') return false;
  if (session.approvalStatus === 'APPROVED') return true;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { approvalStatus: true },
  });
  return user?.approvalStatus === 'APPROVED';
}

function mapPublicProduct(
  p: {
    id: string;
    slug: string;
    name: string;
    category: string | null;
    categoryRef: { name: string; slug: string } | null;
    description: string | null;
    packshotUrl: string | null;
    lifestyleUrl: string | null;
    isNovaTrade: boolean;
    isStudioProject: boolean;
    hidePricing: boolean;
    priceCents: number | null;
    currency: string | null;
    specs: unknown;
    assets: { id: string; kind: string; publicUrl: string | null; objectKey: string; label: string | null }[];
  },
  pricingOk: boolean,
) {
  const priceVisible = pricingOk && !p.hidePricing;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: displayCategoryName(p),
    categorySlug: displayCategorySlug(p),
    description: p.description,
    packshotUrl: p.packshotUrl,
    lifestyleUrl: p.lifestyleUrl,
    isNovaTrade: p.isNovaTrade,
    isStudioProject: p.isStudioProject,
    hidePricing: p.hidePricing,
    priceCents: priceVisible ? p.priceCents : null,
    currency: priceVisible ? p.currency : null,
    specs: p.specs,
    assets: p.assets,
    technicalSheets: technicalSheetsFromAssets(p.assets),
  };
}

publicRouter.get('/categories', async (req, res) => {
  const portal = z.enum(['studio', 'trade', 'nova']).optional().safeParse(req.query.portal).data;

  const visible =
    portal === 'studio'
      ? { visibleStudio: true }
      : portal === 'trade' || portal === 'nova'
        ? { visibleTrade: true }
        : {};

  const categories = await prisma.productCategory.findMany({
    where: visible,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, slug: true, name: true, description: true, sortOrder: true, visibleStudio: true, visibleTrade: true },
  });

  res.json({ categories });
});

publicRouter.get('/products', async (req, res) => {
  const pricingOk = await canSeePricing(req);

  const portal = z.enum(['studio', 'trade', 'nova']).optional().safeParse(req.query.portal).data;
  const category = z.string().min(1).optional().safeParse(req.query.category).data;

  const products = await prisma.product.findMany({
    where: {
      isPublished: true,
      ...portalProductWhere(portal),
      ...(category ? categoryMatchWhere(category) : {}),
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      categoryRef: { select: { name: true, slug: true } },
      description: true,
      packshotUrl: true,
      lifestyleUrl: true,
      isNovaTrade: true,
      isStudioProject: true,
      hidePricing: true,
      priceCents: true,
      currency: true,
      specs: true,
      assets: { select: assetSelect },
    },
  });

  res.json({
    products: products.map((p) => mapPublicProduct(p, pricingOk)),
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
      categoryRef: { select: { name: true, slug: true } },
      description: true,
      packshotUrl: true,
      lifestyleUrl: true,
      isNovaTrade: true,
      isStudioProject: true,
      hidePricing: true,
      priceCents: true,
      currency: true,
      specs: true,
      assets: { select: assetSelect },
      projectLinks: { select: { project: { select: { id: true, slug: true, title: true } } } },
      relatedFrom: {
        select: {
          relatedProduct: {
            select: {
              id: true,
              slug: true,
              name: true,
              category: true,
              categoryRef: { select: { name: true, slug: true } },
              packshotUrl: true,
            },
          },
        },
      },
    },
  });
  if (!p) return res.status(404).json({ error: 'Not found' });

  const base = mapPublicProduct(p, pricingOk);

  res.json({
    product: {
      ...base,
      projects: p.projectLinks.map((x) => x.project),
      relatedProducts: p.relatedFrom.map((x) => ({
        id: x.relatedProduct.id,
        slug: x.relatedProduct.slug,
        name: x.relatedProduct.name,
        category: displayCategoryName(x.relatedProduct),
        packshotUrl: x.relatedProduct.packshotUrl,
      })),
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
