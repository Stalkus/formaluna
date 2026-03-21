import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { Prisma as PrismaConst } from '@prisma/client';
import { prisma } from '../prisma.js';
import { clearSessionCookie, readSession, setSessionCookie, signSession } from '../lib/auth.js';
import { requireAdmin } from '../lib/require.js';
import { env } from '../lib/env.js';
import { createPresignedPutUrl } from '../services/s3.js';
import { getSettings, setSettings } from '../services/settings.js';

export const adminRouter = Router();

adminRouter.post('/logout', async (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

adminRouter.get('/me', async (req, res) => {
  const session = readSession(req);
  if (!session || session.role !== 'ADMIN') return res.json({ admin: null });
  const admin = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true },
  });
  res.json({ admin });
});

adminRouter.post('/login', async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      error:
        'This email is a trade (B2B) account, not an admin. Use the professionals portal to sign in, or create the first admin with “Create Admin (first run)”.',
    });
  }
  const admin = user;

  const ok = await bcrypt.compare(body.password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signSession({ sub: admin.id, role: 'ADMIN' });
  setSessionCookie(res, token);
  res.json({ admin: { id: admin.id, email: admin.email } });
});

adminRouter.post('/bootstrap', async (req, res) => {
  const existing = await prisma.user.count({ where: { role: 'ADMIN' } });
  if (existing > 0) return res.status(409).json({ error: 'Admin already exists' });

  const parsed = z
    .object({
      email: z.string().email().optional(),
      password: z.string().min(8).optional(),
    })
    .safeParse(req.body);

  const email =
    (parsed.success && parsed.data.email?.trim()) || env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = (parsed.success && parsed.data.password) || env.ADMIN_PASSWORD;

  if (!email || !password) {
    return res.status(400).json({
      error:
        'On first run, fill in email and password on the login page and click “Create Admin”, or set ADMIN_EMAIL and ADMIN_PASSWORD in the server environment.',
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: {
      role: 'ADMIN',
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      email: email.toLowerCase(),
      passwordHash,
      displayName: 'Admin',
    },
    select: { id: true, email: true },
  });
  res.status(201).json({ admin });
});

adminRouter.use(requireAdmin);

adminRouter.get('/users', async (req, res) => {
  const status = z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional().parse(req.query.status);
  const users = await prisma.user.findMany({
    where: { role: 'B2B', ...(status ? { approvalStatus: status } : {}) },
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, approvalStatus: true, createdAt: true, displayName: true, companyName: true },
  });
  res.json({ users });
});

adminRouter.post('/users/:id/approve', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: { approvalStatus: 'APPROVED', approvedAt: new Date() },
    select: { id: true, email: true, approvalStatus: true },
  });
  res.json({ user });
});

adminRouter.post('/users/:id/reject', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const user = await prisma.user.update({
    where: { id },
    data: { approvalStatus: 'REJECTED', approvedAt: null },
    select: { id: true, email: true, approvalStatus: true },
  });
  res.json({ user });
});

// Settings (SMTP + GA)
adminRouter.get('/settings', async (_req, res) => {
  const settings = await getSettings([
    'googleAnalyticsMeasurementId',
    'smtpHost',
    'smtpPort',
    'smtpUser',
    'smtpPass',
    'smtpFromEmail',
    'smtpFromName',
  ]);
  // Do not return the decrypted SMTP password by default unless explicitly needed
  settings.smtpPass = settings.smtpPass ? '***' : null;
  res.json({ settings });
});

adminRouter.patch('/settings', async (req, res) => {
  const body = z
    .object({
      googleAnalyticsMeasurementId: z.string().min(3).optional().nullable(),
      smtpHost: z.string().min(1).optional().nullable(),
      smtpPort: z.string().min(1).optional().nullable(),
      smtpUser: z.string().min(1).optional().nullable(),
      smtpPass: z.string().min(1).optional().nullable(),
      smtpFromEmail: z.string().min(3).optional().nullable(),
      smtpFromName: z.string().min(1).optional().nullable(),
    })
    .parse(req.body);

  await setSettings(body);
  res.json({ ok: true });
});

// Pages CMS
adminRouter.get('/pages', async (_req, res) => {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  res.json({ pages });
});

adminRouter.get('/pages/:slug', async (req, res) => {
  const slug = z.string().min(1).parse(req.params.slug);
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return res.status(404).json({ error: 'Not found' });
  res.json({ page });
});

adminRouter.post('/pages', async (req, res) => {
  const body = z
    .object({
      slug: z.string().min(1),
      title: z.string().min(1),
      contentJson: z.unknown().optional().nullable(),
    })
    .parse(req.body);
  const page = await prisma.page.create({
    data: {
      slug: body.slug,
      title: body.title,
      contentJson:
        body.contentJson === undefined || body.contentJson === null
          ? PrismaConst.DbNull
          : (body.contentJson as Prisma.InputJsonValue),
    },
  });
  res.status(201).json({ page });
});

adminRouter.patch('/pages/:slug', async (req, res) => {
  const slug = z.string().min(1).parse(req.params.slug);
  const body = z
    .object({
      title: z.string().min(1).optional(),
      contentJson: z.unknown().optional().nullable(),
    })
    .parse(req.body);
  const page = await prisma.page.update({
    where: { slug },
    data: {
      title: body.title,
      contentJson:
        body.contentJson === undefined
          ? undefined
          : body.contentJson === null
            ? PrismaConst.DbNull
            : (body.contentJson as Prisma.InputJsonValue),
    },
  });
  res.json({ page });
});

// Product categories (CMS — like WooCommerce product categories)
adminRouter.get('/categories', async (_req, res) => {
  const categories = await prisma.productCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  res.json({ categories });
});

adminRouter.post('/categories', async (req, res) => {
  const body = z
    .object({
      slug: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      sortOrder: z.number().int().optional(),
      visibleStudio: z.boolean().optional(),
      visibleTrade: z.boolean().optional(),
    })
    .parse(req.body);
  const category = await prisma.productCategory.create({
    data: {
      slug: body.slug,
      name: body.name,
      description: body.description ?? null,
      sortOrder: body.sortOrder ?? 0,
      visibleStudio: body.visibleStudio ?? true,
      visibleTrade: body.visibleTrade ?? true,
    },
  });
  res.status(201).json({ category });
});

adminRouter.patch('/categories/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const body = z
    .object({
      slug: z.string().min(1).optional(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      sortOrder: z.number().int().optional(),
      visibleStudio: z.boolean().optional(),
      visibleTrade: z.boolean().optional(),
    })
    .parse(req.body);
  const category = await prisma.productCategory.update({ where: { id }, data: body });
  res.json({ category });
});

adminRouter.delete('/categories/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  await prisma.productCategory.delete({ where: { id } });
  res.json({ ok: true });
});

const productInclude = {
  assets: true,
  categoryRef: true,
  projectLinks: { include: { project: true } },
  relatedFrom: true,
  relatedTo: true,
} as const;

// Products CRUD (minimal)
adminRouter.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
    include: productInclude,
  });
  res.json({ products });
});

adminRouter.get('/products/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json({ product });
});

adminRouter.post('/products', async (req, res) => {
  const body = z
    .object({
      slug: z.string().min(1),
      sku: z.string().min(1).optional(),
      name: z.string().min(1),
      category: z.string().min(1).optional().nullable(),
      categoryId: z.preprocess((v) => (v === '' ? null : v), z.string().min(1).nullable().optional()),
      description: z.string().optional(),
      packshotUrl: z.string().url().optional(),
      lifestyleUrl: z.string().url().optional(),
      isNovaTrade: z.boolean().optional(),
      isStudioProject: z.boolean().optional(),
      isPublished: z.boolean().optional(),
      hidePricing: z.boolean().optional(),
      priceCents: z.number().int().nonnegative().optional().nullable(),
      currency: z.string().min(3).max(3).optional().nullable(),
      specs: z.unknown().optional().nullable(),
    })
    .parse(req.body);

  const { categoryId, specs, ...rest } = body;
  const data: Prisma.ProductCreateInput = { ...rest };
  if (specs !== undefined) {
    data.specs = specs === null ? PrismaConst.DbNull : (specs as Prisma.InputJsonValue);
  }
  if (categoryId) data.categoryRef = { connect: { id: categoryId } };
  const product = await prisma.product.create({ data });
  res.status(201).json({ product });
});

adminRouter.patch('/products/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const body = z
    .object({
      slug: z.string().min(1).optional(),
      sku: z.string().min(1).optional().nullable(),
      name: z.string().min(1).optional(),
      category: z.string().min(1).optional().nullable(),
      categoryId: z.preprocess((v) => (v === '' ? null : v), z.string().min(1).nullable().optional()),
      description: z.string().optional().nullable(),
      packshotUrl: z.string().url().optional().nullable(),
      lifestyleUrl: z.string().url().optional().nullable(),
      isNovaTrade: z.boolean().optional(),
      isStudioProject: z.boolean().optional(),
      isPublished: z.boolean().optional(),
      hidePricing: z.boolean().optional(),
      priceCents: z.number().int().nonnegative().optional().nullable(),
      currency: z.string().min(3).max(3).optional().nullable(),
      specs: z.unknown().optional().nullable(),
    })
    .parse(req.body);

  const { categoryId, specs, ...scalarRest } = body;
  const data: Prisma.ProductUpdateInput = { ...scalarRest };
  if (specs !== undefined) {
    data.specs = specs === null ? PrismaConst.DbNull : (specs as Prisma.InputJsonValue);
  }
  if (categoryId !== undefined) {
    if (categoryId === null) data.categoryRef = { disconnect: true };
    else data.categoryRef = { connect: { id: categoryId } };
  }
  const product = await prisma.product.update({ where: { id }, data });
  res.json({ product });
});

adminRouter.delete('/products/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
});

// Projects CRUD (minimal)
adminRouter.get('/projects', async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { assets: true, productLinks: { include: { product: true } } },
  });
  res.json({ projects });
});

adminRouter.get('/projects/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const project = await prisma.project.findUnique({
    where: { id },
    include: { assets: true, productLinks: { include: { product: true } } },
  });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json({ project });
});

adminRouter.post('/projects', async (req, res) => {
  const body = z
    .object({
      slug: z.string().min(1),
      title: z.string().min(1),
      categoryTags: z.string().min(1).optional(),
      coverImageUrl: z.string().url().optional(),
      description: z.string().optional(),
      galleryUrls: z.array(z.string().url()).optional(),
      isPublished: z.boolean().optional(),
    })
    .parse(req.body);
  const project = await prisma.project.create({ data: body });
  res.status(201).json({ project });
});

adminRouter.patch('/projects/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const body = z
    .object({
      slug: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      categoryTags: z.string().min(1).optional().nullable(),
      coverImageUrl: z.string().url().optional().nullable(),
      description: z.string().optional().nullable(),
      galleryUrls: z.array(z.string().url()).optional(),
      isPublished: z.boolean().optional(),
    })
    .parse(req.body);
  const project = await prisma.project.update({ where: { id }, data: body });
  res.json({ project });
});

adminRouter.delete('/projects/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  await prisma.project.delete({ where: { id } });
  res.json({ ok: true });
});

// Asset delete (DB only; object storage delete can be added later)
adminRouter.delete('/assets/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  await prisma.asset.delete({ where: { id } });
  res.json({ ok: true });
});

// Create asset record by URL (useful for local testing without S3/R2)
adminRouter.post('/assets', async (req, res) => {
  const body = z
    .object({
      kind: z.enum(['PRODUCT_IMAGE', 'PRODUCT_TECH_SHEET', 'PROJECT_IMAGE', 'OTHER']),
      publicUrl: z.string().url(),
      label: z.string().min(1).optional(),
      sortOrder: z.number().int().optional(),
      contentType: z.string().min(1).optional(),
      byteSize: z.number().int().positive().optional(),
      productId: z.string().min(1).optional(),
      projectId: z.string().min(1).optional(),
    })
    .refine((x) => !(x.productId && x.projectId), { message: 'Provide productId OR projectId' })
    .parse(req.body);

  const asset = await prisma.asset.create({
    data: {
      kind: body.kind,
      objectKey: body.publicUrl, // not used for URL-only assets
      publicUrl: body.publicUrl,
      label: body.label,
      sortOrder: body.sortOrder ?? 0,
      contentType: body.contentType,
      byteSize: body.byteSize,
      productId: body.productId,
      projectId: body.projectId,
    },
  });

  res.status(201).json({ asset });
});

// Update asset metadata + attachment (label/order/kind + assign to product/project)
adminRouter.patch('/assets/:id', async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const body = z
    .object({
      kind: z.enum(['PRODUCT_IMAGE', 'PRODUCT_TECH_SHEET', 'PROJECT_IMAGE', 'OTHER']).optional(),
      label: z.string().min(1).optional().nullable(),
      sortOrder: z.number().int().optional(),
      productId: z.string().min(1).optional().nullable(),
      projectId: z.string().min(1).optional().nullable(),
    })
    .refine((x) => !(x.productId && x.projectId), { message: 'Provide productId OR projectId' })
    .parse(req.body);

  const asset = await prisma.asset.update({
    where: { id },
    data: {
      kind: body.kind,
      label: body.label === undefined ? undefined : body.label,
      sortOrder: body.sortOrder,
      productId: body.productId === undefined ? undefined : body.productId,
      projectId: body.projectId === undefined ? undefined : body.projectId,
    },
  });
  res.json({ asset });
});

// Link/unlink product ↔ project
adminRouter.post('/projects/:projectId/products/:productId', async (req, res) => {
  const projectId = z.string().min(1).parse(req.params.projectId);
  const productId = z.string().min(1).parse(req.params.productId);
  await prisma.projectProduct.create({ data: { projectId, productId } });
  res.status(201).json({ ok: true });
});

adminRouter.delete('/projects/:projectId/products/:productId', async (req, res) => {
  const projectId = z.string().min(1).parse(req.params.projectId);
  const productId = z.string().min(1).parse(req.params.productId);
  await prisma.projectProduct.delete({ where: { projectId_productId: { projectId, productId } } });
  res.json({ ok: true });
});

// Link/unlink related products (many-to-many self relation)
adminRouter.post('/products/:productId/related/:relatedProductId', async (req, res) => {
  const productId = z.string().min(1).parse(req.params.productId);
  const relatedProductId = z.string().min(1).parse(req.params.relatedProductId);
  await prisma.relatedProduct.create({ data: { productId, relatedProductId } });
  res.status(201).json({ ok: true });
});

adminRouter.delete('/products/:productId/related/:relatedProductId', async (req, res) => {
  const productId = z.string().min(1).parse(req.params.productId);
  const relatedProductId = z.string().min(1).parse(req.params.relatedProductId);
  await prisma.relatedProduct.delete({
    where: { productId_relatedProductId: { productId, relatedProductId } },
  });
  res.json({ ok: true });
});

// Uploads: return presigned PUT URL and register asset
adminRouter.post('/uploads/presign', async (req, res) => {
  const body = z
    .object({
      objectKey: z.string().min(1),
      contentType: z.string().min(1),
      byteSize: z.number().int().positive().optional(),
      kind: z.enum(['PRODUCT_IMAGE', 'PRODUCT_TECH_SHEET', 'PROJECT_IMAGE', 'OTHER']),
      productId: z.string().min(1).optional(),
      projectId: z.string().min(1).optional(),
    })
    .refine((x) => !(x.productId && x.projectId), { message: 'Provide productId OR projectId' })
    .parse(req.body);

  const upload = await createPresignedPutUrl({
    objectKey: body.objectKey,
    contentType: body.contentType,
  });

  const publicUrl = upload.publicUrl ?? null;
  const asset = await prisma.asset.create({
    data: {
      kind: body.kind,
      objectKey: body.objectKey,
      contentType: body.contentType,
      byteSize: body.byteSize ?? null,
      publicUrl,
      productId: body.productId,
      projectId: body.projectId,
    },
  });

  res.status(201).json({ asset, upload });
});

