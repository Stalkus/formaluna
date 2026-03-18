import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import './NovaAboutPage.css';

const NovaAboutPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <div className="nova-about-page">
        <motion.div 
          className="nova-about-hero"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
        >
          <h1 className="nova-statement">
            Engineered for professionals. Driven by two decades of expertise.
          </h1>
          <p className="nova-substatement">
            Forma Luna Nova is our dedicated trade division, founded by Fernand to serve the rigorous demands of electrical contractors. Backed by 20+ years of direct relationships with major lighting brands.
          </p>
        </motion.div>

        <motion.div 
          className="nova-specs-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <div className="spec-block">
            <span className="spec-number">01</span>
            <h3 className="spec-title">20 Years of Relationships</h3>
            <p className="spec-desc">Fernand's two decades of navigating wholesale and direct B2B supply chains ensures Nova secures Tier-1 components. We source only premium chipsets and pair them with heavily engineered, ripple-free DALI-2 drivers for absolute lighting control.</p>
          </div>
          <div className="spec-block">
            <span className="spec-number">02</span>
            <h3 className="spec-title">Installer First</h3>
            <p className="spec-desc">Every fixture is designed with the installer and contractor in mind. We feature toolless terminal connections, modular driver systems, standardized cutouts, and clear, robust mounting mechanisms. Rapid deployment on tight project schedules.</p>
          </div>
          <div className="spec-block">
            <span className="spec-number">03</span>
            <h3 className="spec-title">Trade Support</h3>
            <p className="spec-desc">As a Nova partner, you secure dedicated tiered pricing, priority stock allocation, and direct line access to our engineering team. We provide exhaustive photometric data (.ies, .ldt files for Dialux) and bespoke layout assistance.</p>
          </div>
        </motion.div>

        <motion.div 
          className="nova-featured-projects"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          style={{ paddingTop: '80px', paddingBottom: '120px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
             <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--deep-green)' }}>Proven Commercial Deployments</h2>
             <p style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', opacity: 0.8, maxWidth: '700px', lineHeight: 1.6 }}>
               From high-end retail boutiques to large-scale corporate headquarters, our technical lighting infrastructure is trusted by installers and system integrators across Europe.
             </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <img src="https://beneito-faure.com/wp-content/uploads/2025/05/portada-connecta-1.jpg" alt="Corporate Install" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} loading="lazy" />
               <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', color: 'var(--deep-green)' }}>The Gallery Workspace, Brussels</h3>
               <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>400+ Nova N-75 Units Delivered</p>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <img src="https://gealuce.com/wp-content/uploads/2023/12/Technical-Interno.jpg" alt="Hospitality Install" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} loading="lazy" />
               <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.125rem', color: 'var(--deep-green)' }}>Oasis Wellness Center, Ghent</h3>
               <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Aura Track Implementation</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NovaAboutPage;
