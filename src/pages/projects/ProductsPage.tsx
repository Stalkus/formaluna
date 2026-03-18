import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import './ProductsPage.css';

const CATEGORIES = ['All', 'Recessed', 'Surface-mounted', 'Pendant', 'Linear Systems', 'Track'];

const ProductsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProducts = activeFilter === 'All' 
    ? MOCK_PRODUCTS 
    : MOCK_PRODUCTS.filter(p => p.category === activeFilter);

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
          <p className="hero-subtitle">Our curated selection of premium luminaires, blending pure aesthetics with uncompromised engineering.</p>
          <div className="products-filter">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: '32px' }}>
            <Link to="/projects/contact" className="btn-solid" style={{display: 'inline-block'}}>
              Download our catalogue here
            </Link>
          </div>
        </motion.header>

        <motion.div layout className="products-grid">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Link to={`/projects/products/${product.id}`} className="product-card" style={{ textDecoration: 'none' }}>
                  <div className="product-visual">
                    <img src={product.lifestyle} alt={`${product.name} in use`} className="product-lifestyle" loading="lazy" />
                    <img src={product.packshot} alt={product.name} className="product-packshot" loading="lazy" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.desc}</p>
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
