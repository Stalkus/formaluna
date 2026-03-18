import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="contact-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="contact-info-col">
          <h1 className="contact-title">Start a dialogue.</h1>
          <p className="hero-subtitle">Whether refining a residential sanctuary or illuminating a commercial landmark, our studio is ready to translate your vision.</p>
          <div className="contact-details">
            <a href="tel:+32478992563">+32 478 99 25 63</a>
            <a href="mailto:studio@formaluna.be">studio@formaluna.be</a>
          </div>
        </div>

        <div className="contact-form-col">
          <form className="brutalist-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <input 
                type="text" 
                className="brutalist-input" 
                placeholder="Full Name" 
                required 
              />
            </div>
            
            <div className="form-group">
              <input 
                type="email" 
                className="brutalist-input" 
                placeholder="Email Address" 
                required 
              />
            </div>
            
            <div className="form-group">
              <textarea 
                className="brutalist-input" 
                placeholder="Project Overview (Location, Scale, Objectives)" 
                required 
              ></textarea>
            </div>
            
            <label className="form-checkbox-group">
              <input type="checkbox" className="brutalist-checkbox" />
              <span className="checkbox-label">Request private material and fitting catalogue.</span>
            </label>
            
            <button type="submit" className="submit-btn">
              Submit Inquiry
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
