import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';

type ProductRow = {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  category?: string | null;
  isPublished: boolean;
  isNovaTrade: boolean;
  isStudioProject: boolean;
  hidePricing: boolean;
  priceCents?: number | null;
  currency?: string | null;
  updatedAt: string;
};

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [items, setItems] = useState<ProductRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) return navigate('/admin/login', { replace: true });
    setAdminEmail((me as any).admin.email ?? '');

    const r = await adminApi.products();
    setItems((r as any).products ?? []);
  }

  useEffect(() => {
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load products'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => {
      return (
        p.name.toLowerCase().includes(s) ||
        p.slug.toLowerCase().includes(s) ||
        (p.sku ?? '').toLowerCase().includes(s) ||
        (p.category ?? '').toLowerCase().includes(s)
      );
    });
  }, [items, q]);

  async function onDelete(id: string) {
    const ok = window.confirm('Delete this product? This cannot be undone.');
    if (!ok) return;
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.deleteProduct(id);
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Delete failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>Products</div>
          <div style={styles.sub}>Signed in as {adminEmail || '—'}</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin" style={styles.linkBtn as any}>
            Dashboard
          </Link>
          <Link to="/admin/products/new" style={styles.primaryBtn as any}>
            New product
          </Link>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.row}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, slug, sku, category…"
            style={styles.input}
          />
        </div>

        <div style={styles.table}>
          <div style={{ ...styles.tr, ...styles.th }}>
            <div>Name</div>
            <div>Portal</div>
            <div>Published</div>
            <div>Pricing</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div style={styles.empty}>No products found.</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} style={styles.tr}>
                <div>
                  <div style={{ fontWeight: 800 }}>{p.name}</div>
                  <div style={styles.meta}>
                    <span style={styles.mono}>{p.slug}</span>
                    {p.sku ? (
                      <>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span style={styles.mono}>{p.sku}</span>
                      </>
                    ) : null}
                    {p.category ? (
                      <>
                        <span style={{ opacity: 0.4 }}>•</span>
                        <span>{p.category}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                <div style={styles.portalCol}>
                  {p.isStudioProject ? <span style={pill('studio')}>Studio</span> : null}
                  {p.isNovaTrade ? <span style={pill('nova')}>Nova</span> : null}
                  {!p.isStudioProject && !p.isNovaTrade ? <span style={pill('none')}>None</span> : null}
                </div>
                <div>{p.isPublished ? <span style={pill('ok')}>Yes</span> : <span style={pill('warn')}>No</span>}</div>
                <div>
                  {p.hidePricing ? (
                    <span style={pill('warn')}>Hidden</span>
                  ) : (
                    <span style={pill('ok')}>
                      {typeof p.priceCents === 'number' ? `${(p.priceCents / 100).toFixed(2)} ${p.currency ?? ''}` : '—'}
                    </span>
                  )}
                </div>
                <div style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Link to={`/admin/products/${p.id}`} style={styles.secondaryBtn as any}>
                    Edit
                  </Link>
                  <button style={styles.dangerBtn} disabled={isBusy} onClick={() => onDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {status ? <div style={styles.status}>{status}</div> : null}
    </div>
  );
}

function pill(kind: 'studio' | 'nova' | 'none' | 'ok' | 'warn'): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 800,
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    marginRight: 6,
  };
  if (kind === 'studio') return { ...base, borderColor: 'rgba(99,102,241,0.40)', background: 'rgba(99,102,241,0.12)' };
  if (kind === 'nova') return { ...base, borderColor: 'rgba(16,185,129,0.40)', background: 'rgba(16,185,129,0.12)' };
  if (kind === 'ok') return { ...base, borderColor: 'rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.10)' };
  return { ...base, borderColor: 'rgba(234,179,8,0.35)', background: 'rgba(234,179,8,0.10)' };
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: 24,
    background:
      'radial-gradient(1200px 600px at 15% 10%, rgba(255,255,255,0.07), transparent 45%), radial-gradient(900px 500px at 85% 35%, rgba(99, 102, 241, 0.10), transparent 55%), #0b0f14',
    color: '#e8eef7',
  },
  topbar: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 18,
  },
  h1: { fontSize: 22, fontWeight: 900, letterSpacing: 0.2 },
  sub: { opacity: 0.75, marginTop: 4, fontSize: 13 },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  panel: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 30px 80px rgba(0,0,0,0.40)',
    backdropFilter: 'blur(10px)',
  },
  row: { display: 'flex', gap: 10, alignItems: 'center' },
  input: {
    width: 'min(640px, 100%)',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#e8eef7',
    outline: 'none',
  },
  table: { display: 'grid', gap: 8, marginTop: 12 },
  tr: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 0.7fr 1fr 1fr',
    gap: 10,
    alignItems: 'center',
    padding: '10px 10px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.18)',
  },
  th: {
    background: 'rgba(255,255,255,0.06)',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  empty: {
    padding: 12,
    opacity: 0.75,
    borderRadius: 12,
    border: '1px dashed rgba(255,255,255,0.20)',
  },
  meta: { opacity: 0.75, fontSize: 12, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 },
  portalCol: { display: 'flex', alignItems: 'center', flexWrap: 'wrap' },
  linkBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 800,
    textDecoration: 'none',
  },
  primaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(99, 102, 241, 0.55)',
    background: 'rgba(99, 102, 241, 0.20)',
    color: '#eef2ff',
    fontWeight: 900,
    textDecoration: 'none',
  },
  secondaryBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 800,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  dangerBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid rgba(239,68,68,0.35)',
    background: 'rgba(239,68,68,0.12)',
    color: '#fee2e2',
    fontWeight: 900,
    cursor: 'pointer',
  },
  status: {
    marginTop: 14,
    padding: 10,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(255,255,255,0.06)',
    fontSize: 13,
    lineHeight: 1.4,
    maxWidth: 980,
  },
};

