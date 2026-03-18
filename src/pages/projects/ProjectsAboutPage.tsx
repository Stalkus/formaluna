import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import './ProjectsAboutPage.css';

const ProjectsAboutPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <div className="about-page">
        <motion.div 
          className="about-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="about-statement">
            Illuminating architecture with intent and precision.
          </h1>
          <p className="about-substatement">
            Forma Luna is a bespoke lighting design studio. We guide your project from initial concept and lighting study through to flawless turnkey installation.
          </p>
        </motion.div>

        <motion.div 
          className="about-content-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <div className="about-text-block">
            <h2>The Art of Space</h2>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>
              At the heart of Forma Luna is our founder, Fernand, who brings over 20 years of dedicated experience to the architectural lighting business. Having cultivated deep relationships and done business with major global lighting brands over two decades, Fernand recognized a crucial gap in the market. 
            </p>
            <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>
              We believe that light is the invisible architecture of any interior. It defines boundaries, guides the eye, and establishes the emotional resonance of a room before a single surface is touched. 
            </p>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.125rem' }}>
              Founded on principles of aesthetic purity and uncompromising technical rigor, Forma Luna partners with visionary architects, interior designers, and discerning homeowners to craft complete lighting narratives. From the initial photometric study of a raw space, through the painstaking selection of materials, down to the final turnkey installation, our process is entirely bespoke.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', borderTop: '1px solid rgba(75, 96, 76, 0.2)', paddingTop: '2.5rem' }}>
              <div>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-green)' }}>20+</div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Years Experience</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-green)' }}>150+</div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Turnkey Projects</div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--deep-green)' }}>Tier 1</div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>Global Brand Partners</div>
              </div>
            </div>
          </div>
          
          <div className="about-image-wrapper">
            <img 
              src="https://beneito-faure.com/wp-content/uploads/2025/02/portada_pomfusa_1.jpg" 
              alt="Forma Luna Studio Design" 
              className="about-image"
              style={{ filter: 'brightness(0.9)', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectsAboutPage;
