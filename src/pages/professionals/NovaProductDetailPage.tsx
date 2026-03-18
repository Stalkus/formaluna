import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { Download, ArrowRight } from 'lucide-react';
import './NovaProductDetailPage.css';

// Technical data for B2B View (simplified without complex variants)
const NOVA_MOCK_DB = {
  1: {
    name: 'Vysn Tevo Track Profile',
    category: 'Linear Systems',
    desc: 'The Tevo track system by Vysn provides professional installers with rapid, click-and-lock 48V magnetic track mounting. Designed strictly for commercial specifications with extremely tight UGR controls.',
    image: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Mounting': 'Surface / Suspended',
      'Voltage': '48V DC',
      'Body Material': 'Extruded Aluminum',
      'Finish Options': 'Black / White',
      'IP Rating': 'IP20',
      'Warranty': '5 Years Trade Warranty'
    },
    relatedIds: [2, 3, 4]
  },
  2: {
    name: 'Beneito Faure Pulso Downlight',
    category: 'Recessed / Downlights',
    desc: 'An accessible, highly reliable architectural downlight by Beneito Faure. Perfect for broad residential rollouts ensuring minimal glare and simple spring-clip installation.',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Cutout': '75mm',
      'Power': '12W',
      'Lumen Output': '1050lm (delivered)',
      'Efficacy': '87.5 lm/W',
      'CRI': 'CRI95+',
      'IP Rating': 'IP44',
      'Warranty': '3 Years Trade Warranty'
    },
    relatedIds: [1, 5, 7]
  },
  3: {
    name: 'Vysn Mezy CCT Panel',
    category: 'Surface',
    desc: 'Robust commercial 600x600 lay-in panel featuring selectable color temperatures directly on the driver for ultimate job site flexibility.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Dimensions': '595 x 595mm',
      'Power': '40W',
      'Output': '3600lm',
      'IP Rating': 'IP20',
      'Warranty': '5 Years'
    },
    relatedIds: [1, 6, 8]
  },
  4: {
    name: 'Beneito Faure Driver',
    category: 'Drivers/Gear',
    desc: 'Premium 48V constant voltage driver for magnetic track systems. Completely ripple-free out of the box with optional DALI-2 interfaces.',
    image: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Voltage': '48V DC',
      'Max Load': '150W',
      'Dimming': 'DALI-2 / PUSH',
      'IP Rating': 'IP20'
    },
    relatedIds: [1, 8, 9]
  },
  5: {
    name: 'Vysn Onis Spot',
    category: 'Downlights',
    desc: 'Deep baffle architectural downlight designed for precise lighting tasks in hospitality applications.',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Cutout': '100mm',
      'Power': '18W',
      'Lumen Output': '1800lm',
      'Tilt': '30°'
    },
    relatedIds: [2, 7, 10]
  },
  6: {
    name: 'Vysn Industrial High Bay',
    category: 'Surface',
    desc: 'Heavy-duty UFO style high bay engineered for massive warehouses and distribution centers.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Power': '150W',
      'Output': '21,000lm',
      'IP Rating': 'IP65',
      'Dimming': '1-10V'
    },
    relatedIds: [3, 8, 9]
  },
  7: {
    name: 'Beneito Faure Box Surface',
    category: 'Surface',
    desc: 'Twin square surface mounted downlight providing directional punch without false ceilings.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Power': '2x10W',
      'Lumen Output': '1800lm',
      'Rotation': '350°',
      'IP Rating': 'IP20'
    },
    relatedIds: [2, 5, 10]
  },
  8: {
    name: 'Vysn Linea Continuous',
    category: 'Linear Systems',
    desc: 'Professional continuous trunking system allowing runs up to 50m from a single feed point.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Wiring': '5 Wire Through-wiring',
      'Max Run': '50m',
      'Power': 'Various',
      'IP' : 'IP20'
    },
    relatedIds: [1, 3, 6]
  },
  9: {
    name: 'Beneito Faure EM Module',
    category: 'Drivers/Gear',
    desc: 'Universal emergency lighting conversion pack with deeply reliable LiFePO4 battery tech.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Output Duration': '3 Hours',
      'Battery': 'LiFePO4',
      'Test': 'Self-Test'
    },
    relatedIds: [4, 6, 8]
  },
  10: {
    name: 'Vysn Vasari Mirror',
    category: 'Surface',
    desc: 'Commercial IP44 backlit bathroom luminaire featuring integrated defogger and clean 3000K output.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Length': '1200mm',
      'IP Rating': 'IP44',
      'CCT': '3000K',
      'Feature': 'Integrated Defogger'
    },
    relatedIds: [2, 5, 7]
  },
  default: {
    name: 'Vysn Trade Fixture',
    category: 'Technical Assortment',
    desc: 'Robust commercial fixture designed for rapid deployment. Consult your trade representative for project-specific pricing.',
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
    specs: {
      'Power': 'Various',
      'CRI': 'CRI90+',
      'IP Rating': 'IP20',
      'Warranty': '5 Years Trade'
    },
    relatedIds: [1, 2, 3]
  }
};

const NovaProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // @ts-expect-error dynamic mock lookup
  const product = NOVA_MOCK_DB[id] || NOVA_MOCK_DB['default'];
  
  const relatedProducts = product.relatedIds 
    ? product.relatedIds.map((rid: number) => ({ id: rid, ...NOVA_MOCK_DB[rid as keyof typeof NOVA_MOCK_DB] }))
    : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="nova-detail-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="nova-detail-visual">
           <img src={product.image} alt={product.name} className="nova-detail-image" loading="lazy" />
        </div>

        <div className="nova-detail-info">
          <span className="nova-tech-badge">Wholesale & Trade Portal</span>
          <h1 className="nova-detail-title">{product.name}</h1>
          <p className="nova-detail-desc">{product.desc}</p>
          
          <div className="nova-spec-grid">
            {Object.entries(product.specs).map(([key, value]) => (
              <div className="nova-spec-item" key={key}>
                <span className="nova-spec-label">{key}</span>
                <span className="nova-spec-value">{value as string}</span>
              </div>
            ))}
          </div>

          <div className="nova-detail-cta">
             <button className="btn-download">
               <Download size={18} /> Detailed Spec Sheet (.PDF)
             </button>
             <Link to="/professionals/contact" className="btn-download btn-quote">
               Get Quote
             </Link>
          </div>
          <p className="nova-login-prompt">Login to see pricing.</p>
          
          <div style={{ marginTop: '24px' }}>
            <Link to="/professionals/products" className="btn-outline" style={{ border: 'none', paddingLeft: 0, textDecoration: 'none' }}>
              &larr; Back to Trade Portfolio
            </Link>
          </div>

        </div>
      </motion.div>

      {/* Dynamic Related Products Section */}
      {relatedProducts.length > 0 && (
        <motion.div 
          className="nova-related-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="nova-related-header">
            <h2 className="nova-related-title">Technical Compatibilities</h2>
            <Link to="/professionals/products" className="nova-related-link">
              View All Components <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="nova-related-grid">
            {relatedProducts.map((item: any) => (
              <Link to={`/professionals/products/${item.id}`} key={item.id} className="nova-related-card">
                <div className="nova-related-image-container">
                  <img src={item.image} alt={item.name} loading="lazy" />
                </div>
                <div className="nova-related-data">
                  <span className="nova-related-category">{item.category}</span>
                  <h3 className="nova-related-name">{item.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default NovaProductDetailPage;
