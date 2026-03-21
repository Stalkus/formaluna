import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from './adminApi';

export default function AdminPageEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const pageSlug = slug ? decodeURIComponent(slug) : '';

  const [adminEmail, setAdminEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('{\n  "blocks": []\n}');

  const canSave = useMemo(() => title.trim() && pageSlug, [title, pageSlug]);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) return navigate('/admin/login', { replace: true });
    setAdminEmail((me as any).admin.email ?? '');

    const r = await adminApi.page(pageSlug);
    const page = (r as any).page;
    setTitle(page.title ?? '');
    setContentText(JSON.stringify(page.contentJson ?? {}, null, 2));
  }

  useEffect(() => {
    if (!pageSlug) return;
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load page'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSlug]);

  async function onSave() {
    if (!canSave) return;
    setIsBusy(true);
    setStatus('');
    try {
      let contentJson: any = null;
      try {
        contentJson = contentText.trim() ? JSON.parse(contentText) : null;
      } catch {
        throw new Error('Content JSON must be valid JSON');
      }
      await adminApi.updatePage(pageSlug, { title: title.trim(), contentJson });
      setStatus('Saved.');
    } catch (e: any) {
      setStatus(e?.message ?? 'Save failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>Edit page</div>
          <div style={styles.sub}>
            <span style={{ opacity: 0.85 }}>{pageSlug}</span> • Signed in as {adminEmail || '—'}
          </div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin/pages" style={styles.linkBtn as any}>
            Back to pages
          </Link>
          <button onClick={onSave} disabled={isBusy || !canSave} style={styles.primaryBtn}>
            {isBusy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div style={styles.panel}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={styles.label}>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={styles.input} />
        </label>

        <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
          <span style={styles.label}>Content JSON</span>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            style={{ ...styles.input, minHeight: 380, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
          />
        </label>

        <div style={styles.note}>
          This is intentionally simple to start. Next we can switch to a block editor UI (hero blocks, rich text, image blocks,
          CTA blocks) while keeping this JSON structure behind the scenes.
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
  label: { fontSize: 12, opacity: 0.85 },
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#e8eef7',
    outline: 'none',
  },
  linkBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 900,
    textDecoration: 'none',
  },
  primaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(99, 102, 241, 0.55)',
    background: 'rgba(99, 102, 241, 0.20)',
    color: '#eef2ff',
    fontWeight: 900,
    cursor: 'pointer',
  },
  note: { marginTop: 12, opacity: 0.75, fontSize: 12, lineHeight: 1.4 },
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

