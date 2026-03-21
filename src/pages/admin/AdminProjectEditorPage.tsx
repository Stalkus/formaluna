import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi, API_BASE } from './adminApi';

type Asset = {
  id: string;
  kind: 'PRODUCT_IMAGE' | 'PRODUCT_TECH_SHEET' | 'PROJECT_IMAGE' | 'OTHER';
  publicUrl?: string | null;
  objectKey: string;
  label?: string | null;
  sortOrder: number;
  projectId?: string | null;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  categoryTags?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  galleryUrls: string[];
  isPublished: boolean;
  assets: Asset[];
  productLinks: { productId: string; product: { id: string; name: string } }[];
};

export default function AdminProjectEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>([]);

  const [form, setForm] = useState({
    slug: '',
    title: '',
    categoryTags: '',
    coverImageUrl: '',
    description: '',
    galleryText: '',
    isPublished: false,
  });

  const [assetUrl, setAssetUrl] = useState('');
  const [assetLabel, setAssetLabel] = useState('');

  const canSave = useMemo(() => form.slug.trim() && form.title.trim(), [form.slug, form.title]);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) return navigate('/admin/login', { replace: true });
    setAdminEmail((me as any).admin.email ?? '');

    const p = await adminApi.products();
    const list = (p as any).products ?? [];
    setAllProducts(list.map((x: any) => ({ id: x.id, name: x.name })));

    if (isNew) {
      setProject(null);
      return;
    }
    const r = await adminApi.project(String(id));
    const pr = (r as any).project as Project;
    setProject(pr);
    setForm({
      slug: pr.slug ?? '',
      title: pr.title ?? '',
      categoryTags: pr.categoryTags ?? '',
      coverImageUrl: pr.coverImageUrl ?? '',
      description: pr.description ?? '',
      galleryText: (pr.galleryUrls ?? []).join('\n'),
      isPublished: !!pr.isPublished,
    });
    setLinkedProductIds((pr.productLinks ?? []).map((x: any) => x.productId));
  }

  useEffect(() => {
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load project'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    if (!canSave) return;
    setIsBusy(true);
    setStatus('');
    try {
      const galleryUrls = form.galleryText
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);

      const payload: any = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        categoryTags: form.categoryTags.trim() || null,
        coverImageUrl: form.coverImageUrl.trim() || null,
        description: form.description.trim() || null,
        galleryUrls,
        isPublished: form.isPublished,
      };

      let projectId = String(id);
      if (isNew) {
        const r = await adminApi.createProject(payload);
        projectId = (r as any).project.id;
        navigate(`/admin/projects/${projectId}`, { replace: true });
      } else {
        await adminApi.updateProject(projectId, payload);
      }

      await syncLinkedProducts(projectId);
      await load();
      setStatus('Saved.');
    } catch (e: any) {
      setStatus(e?.message ?? 'Save failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function syncLinkedProducts(projectId: string) {
    const current = new Set((project?.productLinks ?? []).map((x: any) => x.productId));
    const next = new Set(linkedProductIds);
    const toAdd = [...next].filter((x) => x && !current.has(x));
    const toRemove = [...current].filter((x) => x && !next.has(x));
    for (const pid of toAdd) await adminApi.linkProductToProject(projectId, pid);
    for (const pid of toRemove) await adminApi.unlinkProductFromProject(projectId, pid);
  }

  async function onAddProjectImageByUrl() {
    if (!project?.id) return;
    if (!assetUrl.trim()) return;
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.createAssetByUrl({
        kind: 'PROJECT_IMAGE',
        publicUrl: assetUrl.trim(),
        label: assetLabel.trim() || undefined,
        sortOrder: 0,
        projectId: project.id,
      });
      setAssetUrl('');
      setAssetLabel('');
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Add asset failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function onUploadFile(file: File) {
    if (!project?.id) throw new Error('Save project first');
    const objectKey = `projects/${project.id}/${Date.now()}-${file.name}`.replace(/\s+/g, '_');
    const presigned = await adminApi.presignUpload({
      objectKey,
      contentType: file.type || 'application/octet-stream',
      byteSize: file.size,
      kind: 'PROJECT_IMAGE',
      projectId: project.id,
    });
    const upload = (presigned as any).upload;
    if (!upload?.url) throw new Error('Upload URL missing');

    const put = await fetch(upload.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed (${put.status})`);
    await load();
  }

  const sortedAssets = useMemo(() => {
    const a = (project?.assets ?? []).slice();
    a.sort((x, y) => (x.sortOrder ?? 0) - (y.sortOrder ?? 0));
    return a;
  }, [project?.assets]);

  async function updateAsset(id: string, patch: any) {
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.updateAsset(id, patch);
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Asset update failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function deleteAsset(id: string) {
    const ok = window.confirm('Delete this asset record? (This does not delete the file from storage yet.)');
    if (!ok) return;
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.deleteAsset(id);
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Asset delete failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>{isNew ? 'New project' : 'Edit project'}</div>
          <div style={styles.sub}>Signed in as {adminEmail || '—'}</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin/projects" style={styles.linkBtn as any}>
            Back to projects
          </Link>
          <button onClick={onSave} disabled={isBusy || !canSave} style={styles.primaryBtn}>
            {isBusy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelTitle}>Core</div>
          <div style={styles.formGrid}>
            <Field label="Slug">
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={styles.input} />
            </Field>
            <Field label="Title">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={styles.input} />
            </Field>
            <Field label="Category tags">
              <input
                value={form.categoryTags}
                onChange={(e) => setForm({ ...form, categoryTags: e.target.value })}
                style={styles.input}
                placeholder="INDOOR / CLOTHING RETAIL (BENEITO FAURE)"
              />
            </Field>
            <Field label="Cover image URL">
              <input
                value={form.coverImageUrl}
                onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
                style={styles.input}
                placeholder="https://…"
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ ...styles.input, minHeight: 90, resize: 'vertical' }}
            />
          </Field>
          <Field label="Gallery URLs (one per line)">
            <textarea
              value={form.galleryText}
              onChange={(e) => setForm({ ...form, galleryText: e.target.value })}
              style={{ ...styles.input, minHeight: 120, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
              placeholder="https://…\nhttps://…"
            />
          </Field>

          <div style={styles.switchRow}>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              />
              <span>Published</span>
            </label>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelTitle}>Linked products</div>
          <div style={styles.note}>Select products used in this project (saved when you click Save).</div>
          <div style={styles.relatedWrap}>
            {allProducts.map((p) => {
              const checked = linkedProductIds.includes(p.id);
              return (
                <label key={p.id} style={styles.relatedItem}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setLinkedProductIds((x) => [...x, p.id]);
                      else setLinkedProductIds((x) => x.filter((y) => y !== p.id));
                    }}
                  />
                  <span>{p.name}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelTitle}>Project images</div>
          {!project?.id ? (
            <div style={styles.note}>Save the project first to manage uploads/assets.</div>
          ) : (
            <>
              <div style={styles.assetAddGrid}>
                <Field label="Add by URL (works locally)">
                  <input value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} style={styles.input} placeholder="https://…" />
                </Field>
                <Field label="Label (optional)">
                  <input value={assetLabel} onChange={(e) => setAssetLabel(e.target.value)} style={styles.input} placeholder="Cover / Gallery 1" />
                </Field>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <button style={styles.secondaryBtn} disabled={isBusy || !assetUrl.trim()} onClick={onAddProjectImageByUrl}>
                    Add URL
                  </button>
                </div>
              </div>

              <div style={{ ...styles.note, marginTop: 10 }}>
                Uploads to R2/S3 require backend env vars. If not configured, use “Add by URL” for now.
              </div>

              <div style={styles.uploadRow}>
                <label style={styles.fileBtn}>
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setIsBusy(true);
                      setStatus('');
                      try {
                        await onUploadFile(f);
                      } catch (err: any) {
                        setStatus(err?.message ?? 'Upload failed');
                      } finally {
                        setIsBusy(false);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </label>
              </div>

              <div style={styles.assetList}>
                {sortedAssets.length === 0 ? (
                  <div style={styles.empty}>No project images yet.</div>
                ) : (
                  sortedAssets.map((a) => (
                    <div key={a.id} style={styles.assetRow}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={styles.badge}>{a.kind}</span>
                          {a.label ? <span style={{ opacity: 0.9 }}>{a.label}</span> : <span style={{ opacity: 0.6 }}>—</span>}
                        </div>
                        <div style={styles.meta}>
                          <span style={styles.mono}>{a.publicUrl ?? a.objectKey}</span>
                        </div>
                        {a.publicUrl ? (
                          <div style={{ marginTop: 6 }}>
                            <a href={a.publicUrl} target="_blank" rel="noreferrer" style={styles.assetLink}>
                              Open
                            </a>
                          </div>
                        ) : null}
                      </div>

                      <div style={styles.assetControls}>
                        <input
                          value={a.label ?? ''}
                          onChange={(e) => updateAsset(a.id, { label: e.target.value || null })}
                          style={{ ...styles.input, width: 180 }}
                          placeholder="Label"
                          disabled={isBusy}
                        />
                        <input
                          type="number"
                          value={String(a.sortOrder ?? 0)}
                          onChange={(e) => updateAsset(a.id, { sortOrder: Number(e.target.value) })}
                          style={{ ...styles.input, width: 90 }}
                          disabled={isBusy}
                        />
                        <button style={styles.dangerBtn} onClick={() => deleteAsset(a.id)} disabled={isBusy}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {status ? <div style={styles.status}>{status}</div> : null}

      <div style={styles.footer}>
        <div style={{ opacity: 0.7 }}>
          API: <code>{API_BASE}/api/v1</code>
        </div>
        <div style={{ opacity: 0.7 }}>
          <Link to="/admin">Admin home</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.85 }}>{label}</span>
      {children}
    </label>
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
  grid: { display: 'grid', gridTemplateColumns: '1fr', gap: 16 },
  panel: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 30px 80px rgba(0,0,0,0.40)',
    backdropFilter: 'blur(10px)',
  },
  panelTitle: { fontSize: 14, fontWeight: 900, opacity: 0.9, marginBottom: 10 },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 },
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#e8eef7',
    outline: 'none',
  },
  switchRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 },
  switch: { display: 'flex', gap: 8, alignItems: 'center', opacity: 0.92 },
  note: { marginTop: 10, opacity: 0.75, fontSize: 12, lineHeight: 1.4 },
  relatedWrap: {
    marginTop: 10,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 10,
  },
  relatedItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.18)',
  },
  assetAddGrid: { display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.8fr', gap: 10, alignItems: 'end' },
  secondaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 900,
    cursor: 'pointer',
    height: 42,
  },
  uploadRow: { display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  fileBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 900,
    cursor: 'pointer',
  },
  assetList: { display: 'grid', gap: 10, marginTop: 12 },
  assetRow: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 10,
    alignItems: 'start',
    padding: 12,
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.18)',
  },
  assetControls: { display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' },
  badge: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  meta: { opacity: 0.75, fontSize: 12, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' },
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 },
  assetLink: { color: '#c7d2fe', textDecoration: 'none', fontWeight: 900, fontSize: 12 },
  dangerBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(239,68,68,0.35)',
    background: 'rgba(239,68,68,0.12)',
    color: '#fee2e2',
    fontWeight: 900,
    cursor: 'pointer',
    height: 42,
  },
  empty: { padding: 12, opacity: 0.75, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.20)' },
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
  footer: { marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
};

