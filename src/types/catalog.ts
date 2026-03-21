export type PublicTechnicalSheet = { id: string; label: string; url: string };

export type PublicProductListItem = {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  categorySlug: string | null;
  description: string | null;
  packshotUrl: string | null;
  lifestyleUrl: string | null;
  specs: unknown;
  technicalSheets: PublicTechnicalSheet[];
};

export type PublicProductDetail = PublicProductListItem & {
  projects: { id: string; slug: string; title: string }[];
  relatedProducts: { id: string; slug: string; name: string; category: string | null; packshotUrl: string | null }[];
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  visibleStudio: boolean;
  visibleTrade: boolean;
};
