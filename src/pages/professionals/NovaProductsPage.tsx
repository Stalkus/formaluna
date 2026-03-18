import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Download } from 'lucide-react';
import './NovaProductsPage.css';

const CATEGORIES = ['All', 'Downlights', 'Surface', 'Linear Systems', 'Drivers/Gear'];

const PRODUCTS = [
  {
    id: 1,
    name: 'Vysn Tevo Track',
    category: 'Linear Systems',
    specs: '48V System | Suspended/Recessed | Black/White | Lengths: 1m, 2m, 3m',
    packshot: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 2,
    name: 'Beneito Faure Pulso',
    category: 'Downlights',
    specs: '75mm Cutout | 12W | 1000lm | CRI95+ | IP44 | Phase-cut',
    packshot: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 3,
    name: 'Vysn Mezy CCT Panel',
    category: 'Surface',
    specs: 'Selectable 3000K-4000K | 40W | 3600lm | UGR<19 | Office Grade',
    packshot: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 4,
    name: 'Beneito Faure Driver',
    category: 'Drivers/Gear',
    specs: '48V Constant Voltage | 150W | DALI-2 Driver | Ripple-free',
    packshot: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 5,
    name: 'Vysn Onis Spot',
    category: 'Downlights',
    specs: '100mm Cutout | 18W | 1800lm | IP20 | Tiltable 30°',
    packshot: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 6,
    name: 'Vysn Industrial High Bay',
    category: 'Surface',
    specs: 'Warehouse Spec | 150W | 21,000lm | IP65 | 1-10V Dimming',
    packshot: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 7,
    name: 'Beneito Faure Box Surface',
    category: 'Surface',
    specs: 'Twin Square Mount | 2x10W | 1800lm | Rotatable 350°',
    packshot: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 8,
    name: 'Vysn Linea Continuous',
    category: 'Linear Systems',
    specs: 'Trunking System | Connectable up to 50m | 5 Wire Through-wiring',
    packshot: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 9,
    name: 'Beneito Faure EM Module',
    category: 'Drivers/Gear',
    specs: 'Universal Emergency Pack | 3 Hour Output | LiFePO4 Battery',
    packshot: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=700&h=700',
  },
  {
    id: 10,
    name: 'Vysn Vasari Mirror',
    category: 'Surface',
    specs: 'IP44 Bathroom Spec | 1200mm | Backlit 3000K | Defogger Array',
    packshot: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=700&h=700',
  }
];

const NovaProductsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProducts = activeFilter === 'All' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeFilter);

  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <div className="nova-products-layout">
        <motion.header 
          className="nova-products-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="hero-title">Technical Portfolio.</h1>
          <p className="hero-subtitle">Comprehensive specifications and photometric data for trade professionals.</p>
          
          <div className="nova-filter-row">
            <span className="nova-filter-label">Filter:</span>
            <div className="nova-filter-group">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  className={`nova-filter-btn ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        <motion.div layout className="nova-grid">
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
                <Link to={`/professionals/products/${product.id}`} className="nova-card" style={{ textDecoration: 'none' }}>
                  <div className="nova-visual" style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'var(--deep-green)', color: 'var(--off-white)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px' }}>Specifier Data</span>
                    <img src={product.packshot} alt={product.name} className="nova-packshot" loading="lazy" />
                  </div>
                  <div className="nova-info">
                    <h3 className="nova-name">{product.name}</h3>
                    <p className="nova-specs">{product.specs}</p>
                    <div className="nova-action">
                      <Download size={16} /> Data Sheet (.PDF)
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

export default NovaProductsPage;
