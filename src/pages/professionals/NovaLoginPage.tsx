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
        className="trade-login-layout"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
      >
        <div className="trade-login-container">
          <div className="trade-login-header">
            <h1 className="trade-login-title">Trade Access.</h1>
            <p className="trade-login-subtitle">Sign in to view trade pricing and allocation.</p>
          </div>

          <form className="trade-login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="trade-form-group">
              <input 
                type="email" 
                className="trade-input" 
                placeholder="Professional Email" 
                required 
              />
            </div>
            <div className="trade-form-group">
              <input 
                type="password" 
                className="trade-input" 
                placeholder="Password" 
                required 
              />
            </div>

            <div className="trade-login-actions">
              <label className="form-checkbox-group" style={{ gap: '8px' }}>
                <input type="checkbox" className="brutalist-checkbox" />
                <span className="checkbox-label" style={{ fontSize: '0.875rem' }}>Remember me</span>
              </label>
              <span className="trade-login-link">Reset Password</span>
            </div>

            <button type="submit" className="trade-btn-login">Sign In</button>
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', opacity: 0.6 }}>No trade account? </span>
              <Link to="/professionals/contact" className="trade-login-link" style={{ textDecoration: 'none', fontWeight: 500 }}>Request Access</Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NovaLoginPage;
