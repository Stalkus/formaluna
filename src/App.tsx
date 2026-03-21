import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

/* Gateway */
import GatewayPage from './pages/GatewayPage';

/* Projects Portal */
import ProjectsAboutPage from './pages/projects/ProjectsAboutPage';
import ProjectsArchivePage from './pages/projects/ProjectsArchivePage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import MoodboardsPage from './pages/projects/MoodboardsPage';
import ProductsPage from './pages/projects/ProductsPage';
import ContactPage from './pages/projects/ContactPage';
import ProjectProductDetailPage from './pages/projects/ProjectProductDetailPage';

/* Trade / professionals portal */
import NovaAboutPage from './pages/professionals/NovaAboutPage';
import NovaProductsPage from './pages/professionals/NovaProductsPage';
import NovaContactPage from './pages/professionals/NovaContactPage';
import NovaProductDetailPage from './pages/professionals/NovaProductDetailPage';
import NovaLoginPage from './pages/professionals/NovaLoginPage';
import QuotationTemplatePage from './pages/professionals/QuotationTemplatePage';

/* Admin Dashboard */
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductEditorPage from './pages/admin/AdminProductEditorPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminProjectEditorPage from './pages/admin/AdminProjectEditorPage';
import AdminPagesPage from './pages/admin/AdminPagesPage';
import AdminPageEditorPage from './pages/admin/AdminPageEditorPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminApiDocsPage from './pages/admin/AdminApiDocsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import CmsPageView from './pages/CmsPageView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Gateway without Footer */}
        <Route path="/" element={<GatewayPage />} />

        {/* Admin Dashboard (separate from site layout) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Super-admin login at trade URL (e.g. Vercel: /professionals/login) */}
        <Route path="/professionals/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/products/new" element={<AdminProductEditorPage />} />
        <Route path="/admin/products/:id" element={<AdminProductEditorPage />} />
        <Route path="/admin/projects" element={<AdminProjectsPage />} />
        <Route path="/admin/projects/new" element={<AdminProjectEditorPage />} />
        <Route path="/admin/projects/:id" element={<AdminProjectEditorPage />} />
        <Route path="/admin/pages" element={<AdminPagesPage />} />
        <Route path="/admin/pages/:slug" element={<AdminPageEditorPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/api" element={<AdminApiDocsPage />} />

        {/* All Interior routes wrapped with Layout (Navbar + Content + Footer) */}
        <Route element={<Layout />}>
          {/* Projects Portal Routes */}
          <Route path="/projects/about" element={<ProjectsAboutPage />} />
          <Route path="/projects/projects" element={<ProjectsArchivePage />} />
          <Route path="/projects/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/projects/moodboards" element={<MoodboardsPage />} />
          <Route path="/projects/products" element={<ProductsPage />} />
          <Route path="/projects/products/:slug" element={<ProjectProductDetailPage />} />
          <Route path="/projects/contact" element={<ContactPage />} />
          <Route path="/projects/cms/:slug" element={<CmsPageView />} />
          <Route path="/projects" element={<Navigate to="/projects/projects" replace />} />

          {/* Trade portal routes */}
          <Route path="/professionals/about" element={<NovaAboutPage />} />
          <Route path="/professionals/products" element={<NovaProductsPage />} />
          <Route path="/professionals/products/:slug" element={<NovaProductDetailPage />} />
          <Route path="/professionals/contact" element={<NovaContactPage />} />
          <Route path="/professionals/trade-login" element={<NovaLoginPage />} />
          <Route path="/professionals/quotation-template" element={<QuotationTemplatePage />} />
          <Route path="/professionals/cms/:slug" element={<CmsPageView />} />
          <Route path="/professionals" element={<Navigate to="/professionals/about" replace />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
