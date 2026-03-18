import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Download, ArrowLeft, ArrowRight } from 'lucide-react';
import { MOCK_PRODUCTS, type MockProduct } from '../../data/mockProducts';
import './ProjectProductDetailPage.css';

const ProjectProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? Math.floor(n) : 1;
  }, [id]);

  const product: MockProduct = useMemo(() => {
    return MOCK_PRODUCTS.find((p) => p.id === productId) ?? MOCK_PRODUCTS[0]!;
  }, [productId]);

  const relatedProducts: MockProduct[] = useMemo(() => {
    const start = MOCK_PRODUCTS.findIndex((p) => p.id === product.id);
    const idx = start >= 0 ? start : 0;
    const out: MockProduct[] = [];
    for (let i = 1; i <= 3 && out.length < 3; i++) {
      out.push(MOCK_PRODUCTS[(idx + i) % MOCK_PRODUCTS.length]!);
    }
    return out;
  }, [product.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const specs = useMemo(() => {
    const base: Record<string, string> = {
      Category: product.category,
      Collection: 'Forma Luna Studio',
      LightSource: 'LED High-CRI 90+',
      Dimming: 'DALI / Phase-cut (varies)',
      Environment: 'Indoor (varies)',
    };
    return base;
  }, [product.category]);

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
           <img src={product.packshot} alt={product.name} className="product-detail-image" loading="lazy" />
        </div>

        <div className="product-detail-info">
          <div className="breadcrumb-nav">
            <Link to="/projects/products" className="breadcrumb-link">
              <ArrowLeft size={16} />
              Back to Archive
            </Link>
          </div>

          <span className="product-detail-category">{product.category} Series</span>
          <h1 className="product-detail-title">{product.name}</h1>
          <p className="product-detail-desc">{product.desc}</p>
          
          <div className="product-spec-list">
            {Object.entries(specs).map(([key, value]) => (
              <div className="spec-item" key={key}>
                <span className="spec-label">{key}</span>
                <span className="spec-value">{value as string}</span>
              </div>
            ))}
          </div>

          <div className="product-detail-cta">
             <Link to="/projects/contact" className="btn-solid-premium">Request Technical Quote</Link>
             <button className="btn-outline-premium">
               <Download size={18} style={{ marginRight: '8px' }} />
               Download Technical Sheet
             </button>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Related Products Section */}
      {relatedProducts.length > 0 && (
        <motion.div 
          className="project-related-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="project-related-header">
            <h2 className="project-related-title">Curated Complementary Pieces</h2>
            <Link to="/projects/products" className="project-related-link">
              View All Collection <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="project-related-grid">
            {relatedProducts.map((item) => (
              <Link to={`/projects/products/${item.id}`} key={item.id} className="project-related-card">
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
};

export default ProjectProductDetailPage;
