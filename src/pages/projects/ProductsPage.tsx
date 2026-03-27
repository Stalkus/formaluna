import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { fetchProductCategories, fetchPublishedProducts } from '../../api/publicApi';
import type { PublicProductListItem } from '../../types/catalog';
import './ProductsPage.css';

const STUDIO_MOCK_LIST: PublicProductListItem[] = MOCK_PRODUCTS.map((p) => ({
  id: String(p.id),
  slug: `legacy-studio-${p.id}`,
  name: p.name,
  category: p.category,
  categorySlug: null,
  description: p.desc,
  packshotUrl: p.packshot,
  lifestyleUrl: p.lifestyle,
  specs: {},
  technicalSheets: [],
}));

const FALLBACK_TABS = [
  { key: 'all', label: 'All' },
  ...Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category))).map((name) => ({ key: name, label: name })),
];

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<PublicProductListItem[]>(STUDIO_MOCK_LIST);
  const [tabs, setTabs] = useState(FALLBACK_TABS);
  const [activeKey, setActiveKey] = useState('all');
  const [loadNote, setLoadNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchProductCategories('studio'),
          fetchPublishedProducts({ portal: 'studio' }),
        ]);
        if (cancelled) return;
        if (prods.length > 0) {
          setProducts(prods);
          setTabs([{ key: 'all', label: 'All' }, ...cats.map((c) => ({ key: c.slug, label: c.name }))]);
          setLoadNote(null);
        } else {
          setLoadNote('No published studio products in the API yet — showing demo catalogue.');
        }
      } catch {
        if (cancelled) return;
        setProducts(STUDIO_MOCK_LIST);
        setTabs(FALLBACK_TABS);
        setLoadNote('API unavailable — showing demo catalogue. Start the backend and run migrations + seed.');
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

      <div className="products-layout">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="hero-title">Products.</h1>
          <p className="hero-subtitle">
            Our curated selection of premium luminaires, blending pure aesthetics with uncompromised engineering.
          </p>
          <div className="products-filter-row">
            <span className="products-filter-label">Filter</span>
            <div className="products-filter-group">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={`products-filter-btn ${activeKey === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveKey(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        <motion.div layout className="products-grid">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  to={`/projects/products/${encodeURIComponent(product.slug)}`}
                  className="product-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="product-visual">
                    <img
                      src={product.lifestyleUrl || product.packshotUrl || ''}
                      alt={`${product.name} in use`}
                      className="product-lifestyle"
                      loading="lazy"
                    />
                    <img
                      src={product.packshotUrl || product.lifestyleUrl || ''}
                      alt={product.name}
                      className="product-packshot"
                      loading="lazy"
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description || ''}</p>
                    <div className="product-action">
                      <span className="btn-outline">View Details</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductsPage;
