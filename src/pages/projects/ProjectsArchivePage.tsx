import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './ProjectsArchivePage.css';

export type ProjectSegment = 'residential' | 'horeca' | 'office';

export type ArchiveProject = {
  id: number;
  title: string;
  category: string;
  image: string;
  segment: ProjectSegment;
};

const SEGMENTS: { key: ProjectSegment | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'residential', label: 'Residential' },
  { key: 'horeca', label: 'Horeca' },
  { key: 'office', label: 'Office' },
];

/** Dummy projects — tagged by main segment only */
const PROJECTS: ArchiveProject[] = [
  {
    id: 101,
    title: 'Canal House Living',
    category: 'Residential · Living',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/07/portada_roomc.jpg',
    segment: 'residential',
  },
  {
    id: 102,
    title: 'Terral Family Lounge',
    category: 'Residential · Living',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/07/img_portada_casa-terral.jpg',
    segment: 'residential',
  },
  {
    id: 103,
    title: 'Spa Bathroom Suite',
    category: 'Residential · Bathroom',
    image: 'https://gealuce.com/wp-content/uploads/2023/12/Technical-Interno.jpg',
    segment: 'residential',
  },
  {
    id: 104,
    title: 'Limestone Master Bath',
    category: 'Residential · Bathroom',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/02/portada_proj_cuina_particular.jpg',
    segment: 'residential',
  },
  {
    id: 105,
    title: 'Velvet Bedroom Nook',
    category: 'Residential · Bedroom',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/08/portada_institut_ferres_amat-1.jpg',
    segment: 'residential',
  },
  {
    id: 106,
    title: 'Attic Guest Bedroom',
    category: 'Residential · Bedroom',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/01/portada-circuit_1.jpg',
    segment: 'residential',
  },
  {
    id: 107,
    title: 'Kitchen Pendant Cluster',
    category: 'Residential · Pendant',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/02/portada_proj_cuina_particular.jpg',
    segment: 'residential',
  },
  {
    id: 108,
    title: 'Dining Island Pendants',
    category: 'Residential · Pendant',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/09/portada_projecte_chandigarh_cafe.jpg',
    segment: 'residential',
  },
  {
    id: 109,
    title: 'Reading Corner Floor Lamp',
    category: 'Residential · Table lamps / standing lamps',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/04/foto-portada.jpg',
    segment: 'residential',
  },
  {
    id: 110,
    title: 'Library Task Lighting',
    category: 'Residential · Table lamps / standing lamps',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/11/desigual_portada.jpg',
    segment: 'residential',
  },
  {
    id: 111,
    title: 'Courtyard Garden',
    category: 'Residential · Outdoor',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/07/img_portada_casa-terral.jpg',
    segment: 'residential',
  },
  {
    id: 112,
    title: 'Pool Terrace Lighting',
    category: 'Residential · Outdoor',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/05/portada-connecta-1.jpg',
    segment: 'residential',
  },
  {
    id: 201,
    title: 'Boutique Hotel Lumina',
    category: 'Horeca · Hotel',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/04/foto-portada.jpg',
    segment: 'horeca',
  },
  {
    id: 202,
    title: 'Brasserie Zout',
    category: 'Horeca · Restaurant',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/11/desigual_portada.jpg',
    segment: 'horeca',
  },
  {
    id: 203,
    title: 'Chandigarh Café',
    category: 'Horeca · Café',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/09/portada_projecte_chandigarh_cafe.jpg',
    segment: 'horeca',
  },
  {
    id: 204,
    title: 'Wine Bar Cellar',
    category: 'Horeca · Bar',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/01/portada-circuit_1.jpg',
    segment: 'horeca',
  },
  {
    id: 301,
    title: 'Connecta HQ — Linear profiles',
    category: 'Office · Profiles',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/05/portada-connecta-1.jpg',
    segment: 'office',
  },
  {
    id: 302,
    title: 'Tech Hub Open Office',
    category: 'Office · Profiles',
    image: 'https://gealuce.com/wp-content/uploads/2023/12/Technical-Interno.jpg',
    segment: 'office',
  },
  {
    id: 303,
    title: 'Boardroom Ceiling Tiles',
    category: 'Office · Tiles',
    image: 'https://beneito-faure.com/wp-content/uploads/2025/07/portada_roomc.jpg',
    segment: 'office',
  },
  {
    id: 304,
    title: 'Reception Lay-in Grid',
    category: 'Office · Tiles',
    image: 'https://beneito-faure.com/wp-content/uploads/2024/08/portada_institut_ferres_amat-1.jpg',
    segment: 'office',
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const ProjectsArchivePage: React.FC = () => {
  const [segment, setSegment] = useState<ProjectSegment | 'all'>('all');

  const filtered = useMemo(() => {
    if (segment === 'all') return PROJECTS;
    return PROJECTS.filter((p) => p.segment === segment);
  }, [segment]);

  return (
    <div className="page-wrapper container">
      <Navbar />

      <motion.div
        className="projects-archive-hero"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <h1 className="hero-title">Explore projects.</h1>

        <div className="projects-filter-block" role="navigation" aria-label="Project filters">
          <div className="projects-filter-row">
            <span className="projects-filter-label">Type</span>
            <div className="projects-filter-pills">
              {SEGMENTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`projects-filter-pill ${segment === s.key ? 'is-active' : ''}`}
                  onClick={() => setSegment(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {filtered.length === 0 ? (
        <p className="projects-empty">No projects match these filters yet.</p>
      ) : (
        <motion.div
          layout
          className="standard-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project.id}
                layout
                className="grid-item-wrapper"
                variants={fadeInUp}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
              >
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
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ProjectsArchivePage;
