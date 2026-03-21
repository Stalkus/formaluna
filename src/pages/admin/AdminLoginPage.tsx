import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, adminApi, isApiBaseConfigured } from './adminApi';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@formaluna.local');
  const [password, setPassword] = useState('admin_password_change_me');
  const [status, setStatus] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .me()
      .then((r: any) => {
        if (cancelled) return;
        if (r?.admin?.id) navigate('/admin', { replace: true });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function onBootstrap() {
    setIsBusy(true);
    setStatus('');
    try {
      if (!email.trim() || !password) {
        setStatus('Enter the admin email and password (min. 8 characters) you want, then click Create Admin.');
        return;
      }
      if (password.length < 8) {
        setStatus('Password must be at least 8 characters.');
        return;
      }
      await adminApi.bootstrap(email.trim(), password);
      setStatus('Admin created. You can sign in with the same email and password.');
    } catch (e: any) {
      setStatus(e?.message ?? 'Bootstrap failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setStatus(err?.message ?? 'Login failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brandRow}>
          <div style={styles.badge}>Admin</div>
          <div style={styles.title}>Forma Luna Dashboard</div>
        </div>

        <p style={styles.subtitle}>
          Sign in with an account that has the <strong>ADMIN</strong> role (not the same as a trade/B2B signup). First
          deployment: enter email and password below, then <strong>Create Admin (first run)</strong>, then Sign in.
        </p>

        {!isApiBaseConfigured ? (
          <div style={styles.deployWarn}>
            <strong>API URL not configured for this build.</strong> On Vercel add environment variable{' '}
            <code style={styles.code}>VITE_API_BASE</code> = your backend origin (e.g.{' '}
            <code style={styles.code}>https://api.yourdomain.com</code>, no trailing slash), then{' '}
            <strong>redeploy</strong>. Otherwise login POSTs hit this static site and return 405. See{' '}
            <code style={styles.code}>VERCEL.md</code>.
          </div>
        ) : null}

        <div style={styles.row}>
          <button onClick={onBootstrap} disabled={isBusy} style={styles.secondaryBtn}>
            Create Admin (first run)
          </button>
        </div>

        <form onSubmit={onLogin} style={{ marginTop: 16 }}>
          <label style={styles.label}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            autoComplete="username"
            placeholder="admin@formaluna.local"
          />

          <label style={{ ...styles.label, marginTop: 12 }}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
            type="password"
          />

          <button disabled={isBusy || !canSubmit} style={styles.primaryBtn} type="submit">
            {isBusy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {status ? <div style={styles.status}>{status}</div> : null}

        <div style={styles.hint}>
          API base for this build:{' '}
          <code>{API_BASE || '(same origin / proxy in local dev)'}</code>
          <br />
          Paths: <code>/api/v1/…</code>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    background:
      'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(1000px 500px at 80% 40%, rgba(255,255,255,0.06), transparent 50%), #2a3d32',
    color: '#e8eef7',
  },
  card: {
    width: 'min(520px, 100%)',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(10px)',
  },
  brandRow: { display: 'flex', gap: 10, alignItems: 'center' },
  badge: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    padding: '4px 8px',
    borderRadius: 999,
    background: 'rgba(99, 102, 241, 0.18)',
    border: '1px solid rgba(99, 102, 241, 0.35)',
  },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { marginTop: 10, marginBottom: 0, opacity: 0.85, lineHeight: 1.4 },
  row: { display: 'flex', gap: 10, marginTop: 14 },
  label: { display: 'block', fontSize: 12, opacity: 0.85, marginTop: 12, marginBottom: 6 },
  input: {
    width: '100%',
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '10px 12px',
    color: '#e8eef7',
    outline: 'none',
  },
  primaryBtn: {
    width: '100%',
    marginTop: 14,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(99, 102, 241, 0.55)',
    background: 'rgba(99, 102, 241, 0.20)',
    color: '#eef2ff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 600,
    cursor: 'pointer',
  },
  status: {
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    fontSize: 13,
    lineHeight: 1.4,
  },
  hint: { marginTop: 14, opacity: 0.7, fontSize: 12, lineHeight: 1.4 },
  deployWarn: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    background: 'rgba(248, 113, 113, 0.12)',
    border: '1px solid rgba(248, 113, 113, 0.45)',
    fontSize: 13,
    lineHeight: 1.45,
    color: '#fecaca',
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    padding: '1px 5px',
    borderRadius: 4,
    background: 'rgba(0,0,0,0.25)',
  },
};

