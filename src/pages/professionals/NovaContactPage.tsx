import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import './NovaContactPage.css';

const NovaContactPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="trade-contact-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="trade-contact-info-col">
          <h1 className="trade-contact-title">Partner with Trade.</h1>
          <p className="trade-contact-desc">
            Direct access to technical support, pricing tiers, and inventory availability for electrical contractors, architects, and B2B integrators.
          </p>
          
          <div className="trade-contact-details">
            <div className="trade-contact-entry">
              <span className="trade-contact-label">Trade Support</span>
              <a href="tel:+32478992563">+32 478 99 25 63</a>
            </div>
            <div className="trade-contact-entry">
              <span className="trade-contact-label">Technical Enquiries</span>
              <a href="mailto:trade@formaluna.be">trade@formaluna.be</a>
            </div>
            <div className="trade-contact-entry">
              <span className="trade-contact-label">Headquarters</span>
              <a href="#">Antwerp, Belgium</a>
            </div>
          </div>
        </div>

        <div className="trade-contact-form-col">
          <form className="trade-brutalist-form" onSubmit={(e) => e.preventDefault()}>
            <div className="trade-form-group">
              <input 
                type="text" 
                className="trade-input" 
                placeholder="Company Name" 
                required 
              />
            </div>
            
            <div className="trade-form-group">
              <input 
                type="text" 
                className="trade-input" 
                placeholder="Contact Person" 
                required 
              />
            </div>

            <div className="trade-form-group">
              <input 
                type="email" 
                className="trade-input" 
                placeholder="Professional Email Address" 
                required 
              />
            </div>

            <div className="trade-form-group">
              <input 
                type="text" 
                className="trade-input" 
                placeholder="VAT Number" 
                required 
              />
            </div>
            
            <button type="submit" className="trade-submit-btn">
              Request Trade Access
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NovaContactPage;
