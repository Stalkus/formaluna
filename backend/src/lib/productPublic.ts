import type { Prisma } from '@prisma/client';

export type PortalQuery = 'studio' | 'trade' | 'nova' | undefined;

export function portalProductWhere(portal: PortalQuery): Prisma.ProductWhereInput {
  if (portal === 'studio') return { isStudioProject: true };
  if (portal === 'trade' || portal === 'nova') return { isNovaTrade: true };
  return {};
}

/** Match CMS category slug or legacy free-text `Product.category`. */
export function categoryMatchWhere(category: string): Prisma.ProductWhereInput {
  const trimmed = category.trim();
  if (!trimmed) return {};
  return {
    OR: [{ categoryRef: { slug: trimmed } }, { category: trimmed }],
  };
}

type WithDisplayCategory = {
  category: string | null;
  categoryRef: { name: string; slug: string } | null;
};

export function displayCategoryName(p: WithDisplayCategory): string | null {
  return p.categoryRef?.name ?? p.category ?? null;
}

function slugifyLegacyCategory(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export function displayCategorySlug(p: WithDisplayCategory): string | null {
  if (p.categoryRef?.slug) return p.categoryRef.slug;
  if (p.category) return slugifyLegacyCategory(p.category);
  return null;
}

export function technicalSheetsFromAssets(
  assets: { id: string; kind: string; publicUrl: string | null; objectKey: string; label: string | null }[],
) {
  return assets
    .filter((a) => a.kind === 'PRODUCT_TECH_SHEET')
    .map((a) => ({
      id: a.id,
      publicUrl: a.publicUrl,
      objectKey: a.objectKey,
      label: a.label,
    }));
}
