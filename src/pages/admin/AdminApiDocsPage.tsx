import { Link } from 'react-router-dom';
import { API_BASE } from './adminApi';

export default function AdminApiDocsPage() {
  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <div style={styles.h1}>API Docs (Starter)</div>
          <div style={styles.sub}>Base URL: {API_BASE}/api/v1</div>
        </div>
        <div style={styles.actions}>
          <Link to="/admin" style={styles.linkBtn as any}>
            Dashboard
          </Link>
        </div>
      </div>

      <div style={styles.panel}>
        <div style={styles.sectionTitle}>Auth</div>
        <Code>
{`POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
POST /api/v1/auth/refresh`}
        </Code>

        <div style={styles.sectionTitle}>Admin</div>
        <Code>
{`POST /api/v1/admin/bootstrap
POST /api/v1/admin/login
GET  /api/v1/admin/me
POST /api/v1/admin/logout

GET  /api/v1/admin/users?status=PENDING|APPROVED|REJECTED
POST /api/v1/admin/users/:id/approve
POST /api/v1/admin/users/:id/reject

GET/POST/PATCH/DELETE /api/v1/admin/products
GET/POST/PATCH/DELETE /api/v1/admin/projects

POST /api/v1/admin/uploads/presign
POST /api/v1/admin/assets
PATCH/DELETE /api/v1/admin/assets/:id

GET/POST/PATCH /api/v1/admin/pages
GET/PATCH      /api/v1/admin/pages/:slug

GET/PATCH /api/v1/admin/settings`}
        </Code>

        <div style={styles.sectionTitle}>Public</div>
        <Code>
{`GET /api/v1/products?portal=studio|trade&category=...
GET /api/v1/products/:slug
GET /api/v1/projects
GET /api/v1/projects/:slug
GET /api/v1/pages/:slug`}
        </Code>

        <div style={styles.note}>
          This is a lightweight in-dashboard guide. Later we can generate a proper OpenAPI/Swagger spec from the code.
        </div>
      </div>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre style={styles.code}>
      <code>{children}</code>
    </pre>
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
  panel: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 30px 80px rgba(0,0,0,0.40)',
    backdropFilter: 'blur(10px)',
  },
  sectionTitle: { marginTop: 6, marginBottom: 8, fontSize: 14, fontWeight: 900, opacity: 0.9 },
  code: {
    margin: 0,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.10)',
    background: 'rgba(0,0,0,0.22)',
    overflowX: 'auto',
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  note: { marginTop: 8, opacity: 0.75, fontSize: 12, lineHeight: 1.4 },
};

