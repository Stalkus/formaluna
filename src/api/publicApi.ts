import { API_BASE } from '../config/api';
import type { ProductCategory, PublicProductDetail, PublicProductListItem } from '../types/catalog';

type Json = Record<string, unknown>;

async function request<T = Json>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as Json) : null;
  if (!res.ok) {
    const message =
      (data && (typeof data.error === 'string' ? data.error : typeof data.message === 'string' ? data.message : null)) ||
      `${res.status} ${res.statusText}`;
    throw new Error(message);
  }
  return data as T;
}

export type PortalParam = 'studio' | 'trade';

export async function fetchProductCategories(portal: PortalParam): Promise<ProductCategory[]> {
  const r = await request<{ categories: ProductCategory[] }>(
    `/api/v1/categories?portal=${encodeURIComponent(portal)}`,
  );
  return r.categories ?? [];
}

export async function fetchPublishedProducts(params: {
  portal: PortalParam;
  category?: string;
}): Promise<PublicProductListItem[]> {
  const q = new URLSearchParams({ portal: params.portal });
  if (params.category) q.set('category', params.category);
  const r = await request<{ products: PublicProductListItem[] }>(`/api/v1/products?${q.toString()}`);
  return r.products ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<PublicProductDetail | null> {
  try {
    const r = await request<{ product: PublicProductDetail }>(`/api/v1/products/${encodeURIComponent(slug)}`);
    return r.product ?? null;
  } catch (e: unknown) {
    if (e instanceof Error && (e.message.includes('404') || e.message === 'Not found')) return null;
    throw e;
  }
}

export type PublicCmsPage = {
  slug: string;
  title: string;
  contentJson: unknown;
  updatedAt?: string;
};

export async function fetchPublicPageBySlug(slug: string): Promise<PublicCmsPage | null> {
  try {
    const r = await request<{ page: PublicCmsPage }>(`/api/v1/pages/${encodeURIComponent(slug)}`);
    return r.page ?? null;
  } catch (e: unknown) {
    if (e instanceof Error && (e.message.includes('404') || e.message === 'Not found')) return null;
    throw e;
  }
}
