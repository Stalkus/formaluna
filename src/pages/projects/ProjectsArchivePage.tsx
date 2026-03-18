import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './ProjectsArchivePage.css';

// Mock CMS data with standardized lighting-specific architectural photography
const PROJECTS = [
  {
    id: 1,
    title: 'Galeria Unico Iconico Co',
    category: 'INDOOR / CLOTHING RETAIL (BENEITO FAURE)',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/09/portada_projecte_chandigarh_cafe.jpg',
  },
  {
    id: 2,
    title: 'Melababy Concept Store',
    category: 'INDOOR / KIDS RETAIL (BENEITO FAURE)',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/08/portada_institut_ferres_amat-1.jpg',
  },
  {
    id: 3,
    title: 'Oasis Wellness Spa',
    category: 'INDOOR / LUXURY RESIDENTIAL (GEA LUCE)',
    image: 'https://gealuce.com/wp-content/uploads/2023/12/Technical-Interno.jpg',
  },
  {
    id: 4,
    title: 'Maison Noir Courtyard',
    category: 'OUTDOOR / PRIVATE ESTATE (NOVA)',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/07/img_portada_casa-terral.jpg',
  },
  {
    id: 5,
    title: 'The Gallery Penthouse',
    category: 'INDOOR / HIGH-END RESI (KEYLITE)',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/07/portada_roomc.jpg',
  },
  {
    id: 6,
    title: 'Antwerp Tech Hub',
    category: 'OFFICE / COMMERCIAL (ESSENZIALED)',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/05/portada-connecta-1.jpg',
  },
  {
    id: 7,
    title: 'Boutique Hotel Lumina',
    category: 'HOSPITALITY / HORECA (ILUM)',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/04/foto-portada.jpg',
  },
  {
    id: 8,
    title: 'Villa Verde Kitchen',
    category: 'INDOOR / RESIDENTIAL (NOVA)',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/02/portada_proj_cuina_particular.jpg',
  },
  {
    id: 9,
    title: 'Logistics Center South',
    category: 'INDUSTRIAL / B2B (VYSN)',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/01/portada-circuit_1.jpg',
  },
  {
    id: 10,
    title: 'Brasserie Zout',
    category: 'HOSPITALITY / RESTAURANT (ILUM)',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/11/desigual_portada.jpg',
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const ProjectsArchivePage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="projects-archive-hero"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h1 className="hero-title">Selected Projects.</h1>
        <p className="hero-subtitle">Quiet spaces elevated by dramatic, deliberate interior and exterior illumination.</p>
      </motion.div>

      <motion.div 
        className="standard-grid"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {PROJECTS.map((project) => (
          <motion.div key={project.id} className="grid-item-wrapper" variants={fadeInUp}>
            {/* Linking to the individual case study route */}
            <Link to={`/projects/projects/${project.id}`} className="grid-item">
              <div className="grid-image-wrapper">
                <img src={project.image} alt={project.title} className="grid-image" loading="lazy" />
                <div className="project-meta-overlay">
                  <h3 className="project-name">{project.title}</h3>
                  <span className="project-category">{project.category}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProjectsArchivePage;
