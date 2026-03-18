import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import './MoodboardsPage.css';

const MOODBOARDS = [
  {
    id: 1,
    title: 'Minimalist Residential',
    desc: 'Clean lines, recessed lighting, and warm color temperatures.',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/07/img_portada_casa-terral.jpg',
    className: 'large'
  },
  {
    id: 2,
    title: 'Retail High Contrast',
    desc: 'Track lighting and dramatic spotlighting for retail displays.',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/09/portada_projecte_chandigarh_cafe.jpg',
    className: 'tall'
  },
  {
    id: 3,
    title: 'Hospitality Ambiance',
    desc: 'Pendant clustering and low-level mood lighting for restaurants.',
    image: 'https://gealuce.com/wp-content/uploads/2023/12/Technical-Interno.jpg',
    className: 'square'
  },
  {
    id: 4,
    title: 'Corporate Office',
    desc: 'Uniform, glare-free linear illumination for workspaces.',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/05/portada-connecta-1.jpg',
    className: 'square'
  }
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } 
  }
};

const MoodboardsPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        style={{ paddingBottom: '80px' }}
      >
        <h1 className="hero-title">Inspiration.</h1>
        <p className="hero-subtitle">Curated textures, material combinations, and light simulations exploring the boundary between form and atmosphere.</p>
      </motion.div>

      <motion.div 
        className="moodboards-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {MOODBOARDS.map((board) => (
          <motion.div key={board.id} className={`moodboard-card ${board.className}`} variants={fadeInUp}>
            <img src={board.image} alt={board.title} className="moodboard-image" loading="lazy" />
            <div className="moodboard-overlay">
              <h3 className="moodboard-title">{board.title}</h3>
              <span className="moodboard-desc">{board.desc}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default MoodboardsPage;
