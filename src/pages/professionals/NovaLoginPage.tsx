import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './NovaLoginPage.css';

const NovaLoginPage: React.FC = () => {
  return (
    <div className="page-wrapper container">
      <Navbar />
      
      <motion.div 
        className="nova-login-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="nova-login-container">
          <div className="nova-login-header">
            <h1 className="nova-login-title">Trade Access.</h1>
            <p className="nova-login-subtitle">Sign in to view trade pricing and allocation.</p>
          </div>

          <form className="nova-login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="nova-form-group">
              <input 
                type="email" 
                className="nova-input" 
                placeholder="Professional Email" 
                required 
              />
            </div>
            <div className="nova-form-group">
              <input 
                type="password" 
                className="nova-input" 
                placeholder="Password" 
                required 
              />
            </div>

            <div className="nova-login-actions">
              <label className="form-checkbox-group" style={{ gap: '8px' }}>
                <input type="checkbox" className="brutalist-checkbox" />
                <span className="checkbox-label" style={{ fontSize: '0.875rem' }}>Remember me</span>
              </label>
              <span className="nova-login-link">Reset Password</span>
            </div>

            <button type="submit" className="nova-btn-login">Sign In</button>
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', opacity: 0.6 }}>No trade account? </span>
              <Link to="/professionals/contact" className="nova-login-link" style={{ textDecoration: 'none', fontWeight: 500 }}>Request Access</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NovaLoginPage;
