import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  visibleStudio: boolean;
  visibleTrade: boolean;
};

const emptyForm = {
  slug: '',
  name: '',
  description: '',
  sortOrder: '0',
  visibleStudio: true,
  visibleTrade: true,
};

export default function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [items, setItems] = useState<CategoryRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) return navigate('/admin/login', { replace: true });
    setAdminEmail((me as any).admin.email ?? '');
    const r = await adminApi.productCategories();
    setItems((r as any).categories ?? []);
  }

  useEffect(() => {
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load categories'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((c) => c.name.toLowerCase().includes(s) || c.slug.toLowerCase().includes(s));
  }, [items, q]);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setStatus('');
  }

  function startEdit(c: CategoryRow) {
    setEditingId(c.id);
    setForm({
      slug: c.slug,
      name: c.name,
      description: c.description ?? '',
      sortOrder: String(c.sortOrder),
      visibleStudio: c.visibleStudio,
      visibleTrade: c.visibleTrade,
    });
    setStatus('');
  }

  const canSave = form.slug.trim() && form.name.trim();

  async function onSave() {
    if (!canSave) return;
    setIsBusy(true);
    setStatus('');
    try {
      const sortOrder = Number(form.sortOrder);
      if (!Number.isFinite(sortOrder)) throw new Error('Sort order must be a number');
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        sortOrder,
        visibleStudio: form.visibleStudio,
        visibleTrade: form.visibleTrade,
      };
      if (editingId) {
        await adminApi.updateProductCategory(editingId, payload);
        setStatus('Category updated.');
      } else {
        await adminApi.createProductCategory(payload);
        setStatus('Category created.');
        startNew();
      }
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Save failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm('Delete this category? Products using it will be unlinked from the category.');
    if (!ok) return;
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.deleteProductCategory(id);
      if (editingId === id) startNew();
      await load();
      setStatus('Category deleted.');
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
          <div style={styles.h1}>Product categories</div>
          <div style={styles.sub}>Signed in as {adminEmail || '—'}</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin" style={styles.linkBtn as any}>
            Dashboard
          </Link>
          <button type="button" style={styles.secondaryBtn} onClick={startNew} disabled={isBusy}>
            New category
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>{editingId ? 'Edit category' : 'Create category'}</div>
          <div style={styles.formGrid}>
            <label style={styles.field}>
              <span style={styles.label}>Slug</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                style={styles.input}
                placeholder="e.g. recessed"
              />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Name</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={styles.input}
                placeholder="Display name"
              />
            </label>
            <label style={styles.field}>
              <span style={styles.label}>Sort order</span>
              <input
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                style={styles.input}
                inputMode="numeric"
              />
            </label>
          </div>
          <label style={{ ...styles.field, marginTop: 10 }}>
            <span style={styles.label}>Description (optional)</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...styles.input, minHeight: 72, resize: 'vertical' }}
            />
          </label>
          <div style={styles.switchRow}>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={form.visibleStudio}
                onChange={(e) => setForm({ ...form, visibleStudio: e.target.checked })}
              />
              <span>Studio catalogue</span>
            </label>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={form.visibleTrade}
                onChange={(e) => setForm({ ...form, visibleTrade: e.target.checked })}
              />
              <span>Trade catalogue</span>
            </label>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button type="button" style={styles.primaryBtn} onClick={onSave} disabled={isBusy || !canSave}>
              {isBusy ? 'Saving…' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId ? (
              <button type="button" style={styles.secondaryBtn} onClick={startNew} disabled={isBusy}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </div>

        <div style={styles.panel}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" style={styles.input} />
          <div style={styles.table}>
            <div style={{ ...styles.tr, ...styles.th }}>
              <div>Name</div>
              <div>Slug</div>
              <div>Portals</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            {filtered.length === 0 ? (
              <div style={styles.empty}>No categories yet. Create one on the left.</div>
            ) : (
              filtered.map((c) => (
                <div key={c.id} style={{ ...styles.tr, ...(editingId === c.id ? styles.trActive : {}) }}>
                  <div style={{ fontWeight: 900 }}>{c.name}</div>
                  <div style={styles.mono}>{c.slug}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {c.visibleStudio ? 'Studio ' : ''}
                    {c.visibleTrade ? 'Trade' : ''}
                    {!c.visibleStudio && !c.visibleTrade ? '—' : ''}
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" style={styles.smallBtn} onClick={() => startEdit(c)} disabled={isBusy}>
                      Edit
                    </button>
                    <button type="button" style={styles.dangerBtn} onClick={() => onDelete(c.id)} disabled={isBusy}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
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
  actions: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
    alignItems: 'start',
  },
  panel: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 30px 80px rgba(0,0,0,0.40)',
    backdropFilter: 'blur(10px)',
  },
  panelTitle: { fontWeight: 900, marginBottom: 12, fontSize: 14 },
  formGrid: { display: 'grid', gap: 10 },
  field: { display: 'grid', gap: 6 },
  label: { fontSize: 12, fontWeight: 800, opacity: 0.85 },
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#e8eef7',
    outline: 'none',
    boxSizing: 'border-box',
  },
  switchRow: { display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  switch: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' },
  table: { display: 'grid', gap: 8, marginTop: 12 },
  tr: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 0.7fr 1.1fr',
    gap: 10,
    alignItems: 'center',
    padding: '10px 10px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.18)',
  },
  trActive: {
    borderColor: 'rgba(99, 102, 241, 0.45)',
    background: 'rgba(99, 102, 241, 0.12)',
  },
  th: {
    background: 'rgba(255,255,255,0.06)',
    fontWeight: 900,
    fontSize: 11,
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
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid rgba(99, 102, 241, 0.55)',
    background: 'rgba(99, 102, 241, 0.22)',
    color: '#eef2ff',
    fontWeight: 900,
    cursor: 'pointer',
  },
  smallBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.08)',
    color: '#e8eef7',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12,
  },
  dangerBtn: {
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid rgba(248, 113, 113, 0.45)',
    background: 'rgba(248, 113, 113, 0.12)',
    color: '#fecaca',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 12,
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
