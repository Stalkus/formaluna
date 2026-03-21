import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS, type MockProduct } from '../../data/mockProducts';
import { fetchProductBySlug } from '../../api/publicApi';
import { parseLegacyStudioSlug } from '../../lib/legacyProductSlug';
import type { PublicProductDetail } from '../../types/catalog';
import './ProjectProductDetailPage.css';

const ProjectProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [apiProduct, setApiProduct] = useState<PublicProductDetail | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  const legacyId = useMemo(() => parseLegacyStudioSlug(slug), [slug]);

  const mockProduct: MockProduct | null = useMemo(() => {
    if (legacyId == null) return null;
    return MOCK_PRODUCTS.find((p) => p.id === legacyId) ?? MOCK_PRODUCTS[0]!;
  }, [legacyId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!slug || legacyId != null) {
      setApiProduct(null);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    fetchProductBySlug(slug)
      .then((p) => {
        if (!cancelled) setApiProduct(p);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setApiProduct(null);
          setLoadError(e instanceof Error ? e.message : 'Failed to load product');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, legacyId]);

  const relatedFromMock: MockProduct[] = useMemo(() => {
    if (!mockProduct) return [];
    const start = MOCK_PRODUCTS.findIndex((p) => p.id === mockProduct.id);
    const idx = start >= 0 ? start : 0;
    const out: MockProduct[] = [];
    for (let i = 1; i <= 3 && out.length < 3; i++) {
      out.push(MOCK_PRODUCTS[(idx + i) % MOCK_PRODUCTS.length]!);
    }
    return out;
  }, [mockProduct]);

  if (apiProduct === undefined && legacyId == null) {
    return (
      <div className="page-wrapper container">
        <Navbar />
        <p style={{ padding: '2rem' }}>Loading…</p>
      </div>
    );
  }

  if (apiProduct) {
    const mainImg = apiProduct.packshotUrl || apiProduct.lifestyleUrl || '';
    const specEntries =
      apiProduct.specs && typeof apiProduct.specs === 'object' && !Array.isArray(apiProduct.specs)
        ? Object.entries(apiProduct.specs as Record<string, unknown>)
        : [];
    const extra = [
      ['Collection', 'Forma Luna Studio'],
      ['Light source', 'LED High-CRI 90+'],
      ['Dimming', 'DALI / Phase-cut (varies)'],
    ] as [string, string][];
    const specRows = [
      ...specEntries.map(([k, v]) => [k, String(v)] as [string, string]),
      ...extra,
    ];

    return (
      <div className="page-wrapper container">
        <Navbar />

        <motion.div
          className="product-detail-layout"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="product-detail-visual">
            <img src={mainImg} alt={apiProduct.name} className="product-detail-image" loading="lazy" />
          </div>

          <div className="product-detail-info">
            <div className="breadcrumb-nav">
              <Link to="/projects/products" className="breadcrumb-link">
                <ArrowLeft size={16} />
                Back to Archive
              </Link>
            </div>

            <span className="product-detail-category">{(apiProduct.category || 'Product') + ' Series'}</span>
            <h1 className="product-detail-title">{apiProduct.name}</h1>
            <p className="product-detail-desc">{apiProduct.description || ''}</p>

            <div className="product-spec-list">
              {specRows.map(([key, value]) => (
                <div className="spec-item" key={key}>
                  <span className="spec-label">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>

            <div className="product-detail-cta">
              <Link to="/projects/contact" className="btn-solid-premium">
                Request Technical Quote
              </Link>
              {apiProduct.technicalSheets[0]?.url ? (
                <a
                  href={apiProduct.technicalSheets[0].url}
                  className="btn-outline-premium"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={18} style={{ marginRight: '8px' }} />
                  {apiProduct.technicalSheets[0].label}
                </a>
              ) : (
                <button type="button" className="btn-outline-premium">
                  <Download size={18} style={{ marginRight: '8px' }} />
                  Download Technical Sheet
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {apiProduct.relatedProducts.length > 0 && (
          <motion.div
            className="project-related-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="project-related-header">
              <h2 className="project-related-title">Curated Complementary Pieces</h2>
              <Link to="/projects/products" className="project-related-link">
                View All Collection <ArrowRight size={16} />
              </Link>
            </div>

            <div className="project-related-grid">
              {apiProduct.relatedProducts.map((item) => (
                <Link
                  to={`/projects/products/${encodeURIComponent(item.slug)}`}
                  key={item.id}
                  className="project-related-card"
                >
                  <div className="project-related-image-container">
                    <img src={item.packshotUrl || ''} alt={item.name} loading="lazy" />
                  </div>
                  <div className="project-related-data">
                    <span className="project-related-category">{item.category || ''}</span>
                    <h3 className="project-related-name">{item.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  if (mockProduct) {
    const specs: Record<string, string> = {
      Category: mockProduct.category,
      Collection: 'Forma Luna Studio',
      LightSource: 'LED High-CRI 90+',
      Dimming: 'DALI / Phase-cut (varies)',
      Environment: 'Indoor (varies)',
    };

    return (
      <div className="page-wrapper container">
        <Navbar />

        <motion.div
          className="product-detail-layout"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="product-detail-visual">
            <img src={mockProduct.packshot} alt={mockProduct.name} className="product-detail-image" loading="lazy" />
          </div>

          <div className="product-detail-info">
            <div className="breadcrumb-nav">
              <Link to="/projects/products" className="breadcrumb-link">
                <ArrowLeft size={16} />
                Back to Archive
              </Link>
            </div>

            <span className="product-detail-category">{mockProduct.category} Series</span>
            <h1 className="product-detail-title">{mockProduct.name}</h1>
            <p className="product-detail-desc">{mockProduct.desc}</p>

            <div className="product-spec-list">
              {Object.entries(specs).map(([key, value]) => (
                <div className="spec-item" key={key}>
                  <span className="spec-label">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>

            <div className="product-detail-cta">
              <Link to="/projects/contact" className="btn-solid-premium">
                Request Technical Quote
              </Link>
              <button type="button" className="btn-outline-premium">
                <Download size={18} style={{ marginRight: '8px' }} />
                Download Technical Sheet
              </button>
            </div>
          </div>
        </motion.div>

        {relatedFromMock.length > 0 && (
          <motion.div
            className="project-related-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
          >
            <div className="project-related-header">
              <h2 className="project-related-title">Curated Complementary Pieces</h2>
              <Link to="/projects/products" className="project-related-link">
                View All Collection <ArrowRight size={16} />
              </Link>
            </div>

            <div className="project-related-grid">
              {relatedFromMock.map((item) => (
                <Link
                  to={`/projects/products/legacy-studio-${item.id}`}
                  key={item.id}
                  className="project-related-card"
                >
                  <div className="project-related-image-container">
                    <img src={item.packshot} alt={item.name} loading="lazy" />
                  </div>
                  <div className="project-related-data">
                    <span className="project-related-category">{item.category}</span>
                    <h3 className="project-related-name">{item.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <p>{loadError || 'Product not found.'}</p>
        <Link to="/projects/products">Back to products</Link>
      </div>
    </div>
  );
};

export default ProjectProductDetailPage;
