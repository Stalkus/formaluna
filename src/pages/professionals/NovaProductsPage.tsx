import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Download } from 'lucide-react';
import { fetchProductCategories, fetchPublishedProducts } from '../../api/publicApi';
import { TRADE_MOCK_PRODUCTS } from '../../data/tradeMockProducts';
import { specsPreview } from '../../lib/specsPreview';
import type { PublicProductListItem } from '../../types/catalog';
import './NovaProductsPage.css';

const TRADE_MOCK_PUBLIC: PublicProductListItem[] = TRADE_MOCK_PRODUCTS.map((p) => ({
  id: String(p.id),
  slug: `legacy-trade-${p.id}`,
  name: p.name,
  category: p.category,
  categorySlug: null,
  description: null,
  packshotUrl: p.packshot,
  lifestyleUrl: null,
  specs: { Summary: p.specs },
  technicalSheets: [],
}));

const FALLBACK_TABS = [
  { key: 'all', label: 'All' },
  ...Array.from(new Set(TRADE_MOCK_PRODUCTS.map((p) => p.category))).map((name) => ({ key: name, label: name })),
];

const NovaProductsPage: React.FC = () => {
  const [products, setProducts] = useState<PublicProductListItem[]>(TRADE_MOCK_PUBLIC);
  const [tabs, setTabs] = useState(FALLBACK_TABS);
  const [activeKey, setActiveKey] = useState('all');
  const [loadNote, setLoadNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchProductCategories('trade'),
          fetchPublishedProducts({ portal: 'trade' }),
        ]);
        if (cancelled) return;
        if (prods.length > 0) {
          setProducts(prods);
          setTabs([{ key: 'all', label: 'All' }, ...cats.map((c) => ({ key: c.slug, label: c.name }))]);
          setLoadNote(null);
        } else {
          setLoadNote('No published trade products in the API yet — showing demo portfolio.');
        }
      } catch {
        if (cancelled) return;
        setProducts(TRADE_MOCK_PUBLIC);
        setTabs(FALLBACK_TABS);
        setLoadNote(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeKey === 'all') return products;
    return products.filter(
      (p) => p.categorySlug === activeKey || p.category === activeKey,
    );
  }, [products, activeKey, tabs]);

  return (
    <div className="page-wrapper container">
      <Navbar />

      <div className="trade-products-layout">
        <motion.header
          className="trade-products-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="hero-title">Technical Portfolio.</h1>
          <p className="hero-subtitle">Comprehensive specifications and photometric data for trade professionals.</p>
          {loadNote ? (
            <p style={{ marginTop: 12, fontSize: '0.9rem', opacity: 0.75, maxWidth: 640 }}>{loadNote}</p>
          ) : null}

          <div className="trade-filter-row">
            <span className="trade-filter-label">Filter:</span>
            <div className="trade-filter-group">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`trade-filter-btn ${activeKey === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveKey(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        <motion.div layout className="trade-grid">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const line = specsPreview(product.specs) || (product.description ?? '').slice(0, 120);
              return (
                <motion.div
                  key={product.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    to={`/professionals/products/${encodeURIComponent(product.slug)}`}
                    className="trade-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="trade-visual" style={{ position: 'relative' }}>
                      <span
                        style={{
                          position: 'absolute',
                          top: '16px',
                          left: '16px',
                          backgroundColor: 'var(--deep-green)',
                          color: 'var(--off-white)',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          padding: '4px 8px',
                        }}
                      >
                        Specifier Data
                      </span>
                      <img
                        src={product.packshotUrl || ''}
                        alt={product.name}
                        className="trade-packshot"
                        loading="lazy"
                      />
                    </div>
                    <div className="trade-info">
                      <h3 className="trade-name">{product.name}</h3>
                      <p className="trade-specs">{line}</p>
                      <div className="trade-action">
                        <Download size={16} /> Data Sheet (.PDF)
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default NovaProductsPage;
