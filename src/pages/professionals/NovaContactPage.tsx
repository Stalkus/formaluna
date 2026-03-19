import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import './NovaContactPage.css';

const NovaContactPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="nova-contact-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="nova-contact-info-col">
          <h1 className="nova-contact-title">Partner with Trade.</h1>
          <p className="nova-contact-desc">
            Direct access to technical support, pricing tiers, and inventory availability for electrical contractors, architects, and B2B integrators.
          </p>
          
          <div className="nova-contact-details">
            <div className="nova-contact-entry">
              <span className="nova-contact-label">Trade Support</span>
              <a href="tel:+32478992563">+32 478 99 25 63</a>
            </div>
            <div className="nova-contact-entry">
              <span className="nova-contact-label">Technical Enquiries</span>
              <a href="mailto:trade@formaluna.be">trade@formaluna.be</a>
            </div>
            <div className="nova-contact-entry">
              <span className="nova-contact-label">Headquarters</span>
              <a href="#">Antwerp, Belgium</a>
            </div>
          </div>
        </div>

        <div className="nova-contact-form-col">
          <form className="nova-brutalist-form" onSubmit={(e) => e.preventDefault()}>
            <div className="nova-form-group">
              <input 
                type="text" 
                className="nova-input" 
                placeholder="Company Name" 
                required 
              />
            </div>
            
            <div className="nova-form-group">
              <input 
                type="text" 
                className="nova-input" 
                placeholder="Contact Person" 
                required 
              />
            </div>

            <div className="nova-form-group">
              <input 
                type="email" 
                className="nova-input" 
                placeholder="Professional Email Address" 
                required 
              />
            </div>

            <div className="nova-form-group">
              <input 
                type="text" 
                className="nova-input" 
                placeholder="VAT Number" 
                required 
              />
            </div>
            
            <button type="submit" className="nova-submit-btn">
              Request Trade Access
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NovaContactPage;
