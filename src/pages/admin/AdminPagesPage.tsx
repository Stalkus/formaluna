import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';

type PageRow = {
  id: string;
  slug: string;
  title: string;
  updatedAt: string;
};

export default function AdminPagesPage() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [items, setItems] = useState<PageRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) return navigate('/admin/login', { replace: true });
    setAdminEmail((me as any).admin.email ?? '');
    const r = await adminApi.pages();
    setItems((r as any).pages ?? []);
  }

  useEffect(() => {
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load pages'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s));
  }, [items, q]);

  async function onCreateDefaults() {
    setIsBusy(true);
    setStatus('');
    try {
      const defaults = [
        { slug: 'projects-about', title: 'Projects About', contentJson: { blocks: [] } },
        { slug: 'projects-contact', title: 'Projects Contact', contentJson: { blocks: [] } },
        { slug: 'trade-about', title: 'Trade About', contentJson: { blocks: [] } },
        { slug: 'trade-contact', title: 'Trade Contact', contentJson: { blocks: [] } },
      ];
      for (const d of defaults) {
        try {
          await adminApi.createPage(d);
        } catch {
          // ignore duplicates
        }
      }
      await load();
      setStatus('Default pages created (where missing).');
    } catch (e: any) {
      setStatus(e?.message ?? 'Create defaults failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>Pages</div>
          <div style={styles.sub}>Signed in as {adminEmail || '—'}</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin" style={styles.linkBtn as any}>
            Dashboard
          </Link>
          <button style={styles.secondaryBtn} onClick={onCreateDefaults} disabled={isBusy}>
            Create default pages
          </button>
        </div>
      </div>

      <div style={styles.panel}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" style={styles.input} />

        <div style={styles.table}>
          <div style={{ ...styles.tr, ...styles.th }}>
            <div>Title</div>
            <div>Slug</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {filtered.length === 0 ? (
            <div style={styles.empty}>No pages yet. Click “Create default pages”.</div>
          ) : (
            filtered.map((p) => (
              <div key={p.id} style={styles.tr}>
                <div style={{ fontWeight: 900 }}>{p.title}</div>
                <div style={styles.mono}>{p.slug}</div>
                <div style={{ textAlign: 'right' }}>
                  <Link to={`/admin/pages/${encodeURIComponent(p.slug)}`} style={styles.primaryBtn as any}>
                    Edit
                  </Link>
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    padding: 24,
    background:
      'radial-gradient(1200px 600px at 15% 10%, rgba(255,255,255,0.07), transparent 45%), radial-gradient(900px 500px at 85% 35%, rgba(99, 102, 241, 0.10), transparent 55%), #2a3d32',
    color: '#e8eef7',
  },
  topbar: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 },
  h1: { fontSize: 22, fontWeight: 900 },
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
    gridTemplateColumns: '1.6fr 1.2fr 0.8fr',
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
  empty: { padding: 12, opacity: 0.75, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.20)' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, opacity: 0.85 },
  linkBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 900,
    textDecoration: 'none',
  },
  secondaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 900,
    cursor: 'pointer',
  },
  primaryBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid rgba(99, 102, 241, 0.55)',
    background: 'rgba(99, 102, 241, 0.20)',
    color: '#eef2ff',
    fontWeight: 900,
    textDecoration: 'none',
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

