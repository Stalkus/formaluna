import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE, adminApi } from './adminApi';

type UserRow = {
  id: string;
  email: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  displayName?: string | null;
  companyName?: string | null;
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pendingOnly, setPendingOnly] = useState(true);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [projectsCount, setProjectsCount] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);

  const filterLabel = useMemo(() => (pendingOnly ? 'PENDING' : 'ALL'), [pendingOnly]);

  async function load() {
    setStatus('');
    const me = await adminApi.me();
    if (!(me as any)?.admin?.id) {
      navigate('/admin/login', { replace: true });
      return;
    }
    setAdminEmail((me as any).admin.email ?? '');

    const u = await adminApi.users(pendingOnly ? 'PENDING' : undefined);
    setUsers((u as any).users ?? []);

    const [p, pr] = await Promise.all([adminApi.products(), adminApi.projects()]);
    setProductsCount(((p as any).products ?? []).length);
    setProjectsCount(((pr as any).projects ?? []).length);
  }

  useEffect(() => {
    load().catch((e: any) => setStatus(e?.message ?? 'Failed to load dashboard'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOnly]);

  async function onApprove(id: string) {
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.approveUser(id);
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Approve failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function onReject(id: string) {
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.rejectUser(id);
      await load();
    } catch (e: any) {
      setStatus(e?.message ?? 'Reject failed');
    } finally {
      setIsBusy(false);
    }
  }

  async function onLogout() {
    setIsBusy(true);
    setStatus('');
    try {
      await adminApi.logout();
      navigate('/admin/login', { replace: true });
    } catch (e: any) {
      setStatus(e?.message ?? 'Logout failed');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>Admin Dashboard</div>
          <div style={styles.sub}>Signed in as {adminEmail || '—'}</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin/products" style={styles.secondaryBtn as any}>
            Manage products
          </Link>
          <Link to="/admin/projects" style={styles.secondaryBtn as any}>
            Manage projects
          </Link>
          <Link to="/admin/pages" style={styles.secondaryBtn as any}>
            Manage pages
          </Link>
          <Link to="/admin/settings" style={styles.secondaryBtn as any}>
            Settings
          </Link>
          <Link to="/admin/api" style={styles.secondaryBtn as any}>
            API docs
          </Link>
          <button
            style={styles.secondaryBtn}
            onClick={() => setPendingOnly((v) => !v)}
            disabled={isBusy}
          >
            Users filter: {filterLabel}
          </button>
          <button style={styles.primaryBtn} onClick={onLogout} disabled={isBusy}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelTitle}>Overview</div>
          <div style={styles.kpis}>
            <div style={styles.kpi}>
              <div style={styles.kpiLabel}>Products</div>
              <div style={styles.kpiValue}>{productsCount ?? '—'}</div>
            </div>
            <div style={styles.kpi}>
              <div style={styles.kpiLabel}>Projects</div>
              <div style={styles.kpiValue}>{projectsCount ?? '—'}</div>
            </div>
            <div style={styles.kpi}>
              <div style={styles.kpiLabel}>Pending users</div>
              <div style={styles.kpiValue}>{users.filter((u) => u.approvalStatus === 'PENDING').length}</div>
            </div>
          </div>

          <div style={styles.note}>
            This is a starter dashboard for local testing. Next we can add full CRUD editors for products/projects
            (images, specs, tech sheets, related products, and portal flags).
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelTitle}>User approvals</div>
          <div style={styles.table}>
            <div style={{ ...styles.tr, ...styles.th }}>
              <div>Email</div>
              <div>Company</div>
              <div>Status</div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>
            {users.length === 0 ? (
              <div style={styles.empty}>No users found.</div>
            ) : (
              users.map((u) => (
                <div key={u.id} style={styles.tr}>
                  <div style={styles.mono}>{u.email}</div>
                  <div style={{ opacity: 0.9 }}>{u.companyName || '—'}</div>
                  <div>
                    <span style={pill(u.approvalStatus)}>{u.approvalStatus}</span>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                      style={styles.approveBtn}
                      disabled={isBusy || u.approvalStatus === 'APPROVED'}
                      onClick={() => onApprove(u.id)}
                    >
                      Approve
                    </button>
                    <button
                      style={styles.rejectBtn}
                      disabled={isBusy || u.approvalStatus === 'REJECTED'}
                      onClick={() => onReject(u.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {status ? <div style={styles.status}>{status}</div> : null}

      <div style={styles.footer}>
        <div style={{ opacity: 0.7 }}>
          API: <code>{API_BASE}/api/v1</code>
        </div>
        <div style={{ opacity: 0.7 }}>
          Back to site: <Link to="/">Gateway</Link>
        </div>
      </div>
    </div>
  );
}

function pill(status: UserRow['approvalStatus']): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
  };
  if (status === 'APPROVED')
    return { ...base, borderColor: 'rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.10)' };
  if (status === 'REJECTED')
    return { ...base, borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.10)' };
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
  h1: { fontSize: 22, fontWeight: 800, letterSpacing: 0.2 },
  sub: { opacity: 0.75, marginTop: 4, fontSize: 13 },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  primaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(99, 102, 241, 0.55)',
    background: 'rgba(99, 102, 241, 0.20)',
    color: '#eef2ff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    color: '#e8eef7',
    fontWeight: 700,
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
  kpis: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 },
  kpi: {
    borderRadius: 14,
    padding: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.18)',
  },
  kpiLabel: { opacity: 0.75, fontSize: 12 },
  kpiValue: { fontSize: 20, fontWeight: 900, marginTop: 6 },
  note: {
    marginTop: 12,
    opacity: 0.75,
    fontSize: 12,
    lineHeight: 1.4,
    borderTop: '1px solid rgba(255,255,255,0.10)',
    paddingTop: 12,
  },
  table: { display: 'grid', gap: 8 },
  tr: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.2fr 1fr 1fr',
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
  mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 },
  approveBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid rgba(34,197,94,0.35)',
    background: 'rgba(34,197,94,0.12)',
    color: '#dcfce7',
    fontWeight: 800,
    cursor: 'pointer',
  },
  rejectBtn: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid rgba(239,68,68,0.35)',
    background: 'rgba(239,68,68,0.12)',
    color: '#fee2e2',
    fontWeight: 800,
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
  footer: {
    marginTop: 18,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
};

