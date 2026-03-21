import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { MOCK_PRODUCTS, type MockProduct } from '../../data/mockProducts';
import './ProjectDetailPage.css';

// Mock DB for Project Case Studies
const MOCK_PROJECTS = {
  1: {
    title: 'Galeria Unico Iconico Co',
    location: 'Spain',
    architect: 'Beneito Faure Installers',
    completion: '2025',
    text: 'A comprehensive study in high-end retail illumination. For Galeria Unico Iconico Co, we deployed specialized tracks, suspended circular halos, and low-glare architectural downlights to accentuate the raw textures of the garments. The objective was to maintain visual quietness while allowing the retail architecture to glow organically, guiding the customer journey through precise CRI fidelity.',
    images: [
      'https://beneito-faure.com/wp-content/uploads/2024/09/portada_projecte_chandigarh_cafe.jpg',
      'https://beneito-faure.com/wp-content/uploads/2024/11/portada_restaurant_jardiel-2.jpg',
      'https://beneito-faure.com/wp-content/uploads/2024/03/portada_projecte_bureau_vallee.jpg',
    ]
  },
  2: {
    title: 'Melababy Concept Store',
    location: 'Italy',
    architect: 'Studio Retail',
    completion: '2024',
    text: 'Showcasing the versatility of Beneito Faure fixtures, the Melababy project utilizes large suspended circular halos combined with directional track lighting to create a warm, inviting, and perfectly illuminated environment for high-end children’s retail.',
    images: [
      'https://beneito-faure.com/wp-content/uploads/2024/08/portada_institut_ferres_amat-1.jpg',
      'https://beneito-faure.com/wp-content/uploads/2025/05/portada-connecta-1.jpg',
      'https://beneito-faure.com/wp-content/uploads/2024/10/portada_la_resclosa.jpg',
    ]
  },
  default: {
    title: 'Project Details',
    location: 'Brussels, Belgium',
    architect: 'Forma Partners',
    completion: '2026',
    text: 'Forma Luna partners with visionary architects and interior designers to craft complete lighting narratives. From the initial photometric study of a raw space, through the painstaking selection of materials, down to the final turnkey installation, our process is entirely bespoke.',
    images: [
      'https://gealuce.com/wp-content/uploads/2023/12/Technical-Interno.jpg',
      'https://beneito-faure.com/wp-content/uploads/2024/08/portada_dental_albert_merida-1.jpg',
      'https://beneito-faure.com/wp-content/uploads/2024/10/portada_bellesArts-2.jpg'
    ]
  }
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // @ts-expect-error dynamic mock lookup
  const project = MOCK_PROJECTS[id] || MOCK_PROJECTS['default'];

  const usedProducts: MockProduct[] = useMemo(() => {
    // Deterministic: different projects get different slices.
    const n = Number(id);
    const start = Number.isFinite(n) ? Math.max(0, (Math.floor(n) - 1) * 2) : 0;
    const picked: MockProduct[] = [];
    for (let i = 0; i < MOCK_PRODUCTS.length && picked.length < 6; i++) {
      picked.push(MOCK_PRODUCTS[(start + i) % MOCK_PRODUCTS.length]!);
    }
    return picked;
  }, [id]);

  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="project-case-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="case-hero">
          <Link to="/projects/projects" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', textDecoration: 'none', color: 'var(--deep-green)', opacity: 0.6 }}>&larr; Back to Projects</Link>
          <h1 className="case-title">{project.title}</h1>
          
          <div className="case-meta">
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-value">{project.location}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Architect</span>
              <span className="meta-value">{project.architect}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Completion</span>
              <span className="meta-value">{project.completion}</span>
            </div>
          </div>

          <p className="case-text">{project.text}</p>
        </div>

        <div className="case-gallery">
          {project.images.map((img: string, idx: number) => (
             <img 
               key={idx} 
               src={img} 
               alt={`Project Detail ${idx + 1}`} 
               className={`case-gallery-img ${idx === 0 ? 'full' : ''}`} 
               loading="lazy" 
             />
          ))}
        </div>

        <motion.section
          className="project-related-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <div className="project-related-header">
            <h2 className="project-related-title">Products used in this project</h2>
            <Link to="/projects/products" className="project-related-link">
              View All Collection
            </Link>
          </div>

          <div className="project-related-grid">
            {usedProducts.map((p) => (
              <Link to={`/projects/products/legacy-studio-${p.id}`} key={p.id} className="project-related-card">
                <div className="project-related-image-container">
                  <img src={p.packshot} alt={p.name} loading="lazy" />
                </div>
                <div className="project-related-data">
                  <span className="project-related-category">{p.category}</span>
                  <h3 className="project-related-name">{p.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default ProjectDetailPage;
