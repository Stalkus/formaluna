import { API_BASE, isApiBaseConfigured } from '../../config/api';
export { API_BASE, isApiBaseConfigured };

type Json = Record<string, any>;

const vercelHint =
  'Deploy misconfiguration: set VITE_API_BASE in Vercel → Environment Variables to your real API URL (no trailing slash), then redeploy. See VERCEL.md in the repo.';

async function request<T = Json>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const text = await res.text();
  let data: Json | null = null;
  try {
    data = text ? (JSON.parse(text) as Json) : null;
  } catch {
    if (!res.ok) {
      if (res.status === 405 || res.status === 404) {
        if (!isApiBaseConfigured || text.includes('<!DOCTYPE')) {
          throw new Error(`${res.status} — ${vercelHint}`);
        }
      }
      throw new Error(`${res.status} ${res.statusText}`);
    }
    throw new Error('Invalid JSON from API');
  }
  if (!res.ok) {
    if (res.status === 405 || res.status === 404) {
      if (!isApiBaseConfigured || text.includes('<!DOCTYPE')) {
        throw new Error(`${res.status} — ${vercelHint}`);
      }
    }
    const message =
      (data && (data.error || data.message)) || `${res.status} ${res.statusText}`;
    throw new Error(typeof message === 'string' ? message : `${res.status} ${res.statusText}`);
  }
  return data as T;
}

export const adminApi = {
  bootstrap: () => request('/api/v1/admin/bootstrap', { method: 'POST' }),
  login: (email: string, password: string) =>
    request('/api/v1/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/api/v1/admin/logout', { method: 'POST' }),
  me: () => request('/api/v1/admin/me'),

  users: (status?: 'PENDING' | 'APPROVED' | 'REJECTED') =>
    request(`/api/v1/admin/users${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  approveUser: (id: string) => request(`/api/v1/admin/users/${id}/approve`, { method: 'POST' }),
  rejectUser: (id: string) => request(`/api/v1/admin/users/${id}/reject`, { method: 'POST' }),

  products: () => request('/api/v1/admin/products'),
  product: (id: string) => request(`/api/v1/admin/products/${id}`),
  createProduct: (input: any) =>
    request('/api/v1/admin/products', { method: 'POST', body: JSON.stringify(input) }),
  updateProduct: (id: string, input: any) =>
    request(`/api/v1/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteProduct: (id: string) => request(`/api/v1/admin/products/${id}`, { method: 'DELETE' }),

  createAssetByUrl: (input: any) =>
    request('/api/v1/admin/assets', { method: 'POST', body: JSON.stringify(input) }),
  updateAsset: (id: string, input: any) =>
    request(`/api/v1/admin/assets/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteAsset: (id: string) => request(`/api/v1/admin/assets/${id}`, { method: 'DELETE' }),

  presignUpload: (input: any) =>
    request('/api/v1/admin/uploads/presign', { method: 'POST', body: JSON.stringify(input) }),

  linkRelated: (productId: string, relatedProductId: string) =>
    request(`/api/v1/admin/products/${productId}/related/${relatedProductId}`, { method: 'POST' }),
  unlinkRelated: (productId: string, relatedProductId: string) =>
    request(`/api/v1/admin/products/${productId}/related/${relatedProductId}`, { method: 'DELETE' }),
  projects: () => request('/api/v1/admin/projects'),
  project: (id: string) => request(`/api/v1/admin/projects/${id}`),
  createProject: (input: any) =>
    request('/api/v1/admin/projects', { method: 'POST', body: JSON.stringify(input) }),
  updateProject: (id: string, input: any) =>
    request(`/api/v1/admin/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteProject: (id: string) => request(`/api/v1/admin/projects/${id}`, { method: 'DELETE' }),

  linkProductToProject: (projectId: string, productId: string) =>
    request(`/api/v1/admin/projects/${projectId}/products/${productId}`, { method: 'POST' }),
  unlinkProductFromProject: (projectId: string, productId: string) =>
    request(`/api/v1/admin/projects/${projectId}/products/${productId}`, { method: 'DELETE' }),

  pages: () => request('/api/v1/admin/pages'),
  page: (slug: string) => request(`/api/v1/admin/pages/${encodeURIComponent(slug)}`),
  createPage: (input: any) => request('/api/v1/admin/pages', { method: 'POST', body: JSON.stringify(input) }),
  updatePage: (slug: string, input: any) =>
    request(`/api/v1/admin/pages/${encodeURIComponent(slug)}`, { method: 'PATCH', body: JSON.stringify(input) }),

  settings: () => request('/api/v1/admin/settings'),
  updateSettings: (input: any) =>
    request('/api/v1/admin/settings', { method: 'PATCH', body: JSON.stringify(input) }),

  productCategories: () => request('/api/v1/admin/categories'),
  createProductCategory: (input: Record<string, unknown>) =>
    request('/api/v1/admin/categories', { method: 'POST', body: JSON.stringify(input) }),
  updateProductCategory: (id: string, input: Record<string, unknown>) =>
    request(`/api/v1/admin/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteProductCategory: (id: string) =>
    request(`/api/v1/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

