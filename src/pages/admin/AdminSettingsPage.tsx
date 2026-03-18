import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from './adminApi';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const [form, setForm] = useState({
    googleAnalyticsMeasurementId: '',
    smtpHost: '',
    smtpPort: '',
    smtpUser: '',
    smtpPass: '',
    smtpFromEmail: '',
    smtpFromName: '',
  });

  const canSave = useMemo(() => !isBusy, [isBusy]);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) return navigate('/admin/login', { replace: true });
    setAdminEmail((me as any).admin.email ?? '');
    const r = await adminApi.settings();
    const s = (r as any).settings ?? {};
    setForm({
      googleAnalyticsMeasurementId: s.googleAnalyticsMeasurementId ?? '',
      smtpHost: s.smtpHost ?? '',
      smtpPort: s.smtpPort ?? '',
      smtpUser: s.smtpUser ?? '',
      smtpPass: '', // intentionally blank; backend returns ***
      smtpFromEmail: s.smtpFromEmail ?? '',
      smtpFromName: s.smtpFromName ?? '',
    });
  }

  useEffect(() => {
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load settings'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    setIsBusy(true);
    setStatus('');
    try {
      const payload: any = {
        googleAnalyticsMeasurementId: form.googleAnalyticsMeasurementId.trim() || null,
        smtpHost: form.smtpHost.trim() || null,
        smtpPort: form.smtpPort.trim() || null,
        smtpUser: form.smtpUser.trim() || null,
        smtpFromEmail: form.smtpFromEmail.trim() || null,
        smtpFromName: form.smtpFromName.trim() || null,
      };
      // only send smtpPass if user filled it
      if (form.smtpPass.trim()) payload.smtpPass = form.smtpPass.trim();
      await adminApi.updateSettings(payload);
      setForm((f) => ({ ...f, smtpPass: '' }));
      setStatus('Saved.');
      await load();
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
          <div style={styles.h1}>Settings</div>
          <div style={styles.sub}>Signed in as {adminEmail || '—'}</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin" style={styles.linkBtn as any}>
            Dashboard
          </Link>
          <button onClick={onSave} disabled={!canSave} style={styles.primaryBtn}>
            {isBusy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelTitle}>Google Analytics</div>
          <Field label="Measurement ID (e.g. G-XXXXXXXXXX)">
            <input
              value={form.googleAnalyticsMeasurementId}
              onChange={(e) => setForm({ ...form, googleAnalyticsMeasurementId: e.target.value })}
              style={styles.input}
            />
          </Field>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelTitle}>Email (SMTP)</div>
          <div style={styles.formGrid}>
            <Field label="SMTP Host">
              <input value={form.smtpHost} onChange={(e) => setForm({ ...form, smtpHost: e.target.value })} style={styles.input} />
            </Field>
            <Field label="SMTP Port">
              <input value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} style={styles.input} />
            </Field>
            <Field label="SMTP User">
              <input value={form.smtpUser} onChange={(e) => setForm({ ...form, smtpUser: e.target.value })} style={styles.input} />
            </Field>
            <Field label="SMTP Password (stored encrypted)">
              <input
                value={form.smtpPass}
                onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                style={styles.input}
                type="password"
                placeholder="Leave blank to keep unchanged"
              />
            </Field>
            <Field label="From Email">
              <input
                value={form.smtpFromEmail}
                onChange={(e) => setForm({ ...form, smtpFromEmail: e.target.value })}
                style={styles.input}
              />
            </Field>
            <Field label="From Name">
              <input
                value={form.smtpFromName}
                onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })}
                style={styles.input}
              />
            </Field>
          </div>
          <div style={styles.note}>
            SMTP password is stored encrypted in Postgres using <code>ENCRYPTION_KEY</code> from the backend env.
          </div>
        </section>
      </div>

      {status ? <div style={styles.status}>{status}</div> : null}
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
      'radial-gradient(1200px 600px at 15% 10%, rgba(255,255,255,0.07), transparent 45%), radial-gradient(900px 500px at 85% 35%, rgba(99, 102, 241, 0.10), transparent 55%), #0b0f14',
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
  note: { marginTop: 10, opacity: 0.75, fontSize: 12, lineHeight: 1.4 },
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

