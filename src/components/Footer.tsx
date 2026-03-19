import React from 'react';
import { useLocation } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const location = useLocation();
  const isProfessionals = location.pathname.startsWith('/professionals');

  return (
    <footer className="global-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">Forma Luna</span>
          <div className="footer-contact-details">
            <a href="tel:+32478992563">+32 478 99 25 63</a>
              <a href={isProfessionals ? "mailto:trade@formaluna.be" : "mailto:studio@formaluna.be"}>
                {isProfessionals ? "trade@formaluna.be" : "studio@formaluna.be"}
              </a>
            <span>Antwerp, Belgium</span>
          </div>
        </div>

        <div className="footer-form-container">
          <h3 className="footer-form-title">
            {isProfessionals ? 'Request Trade Details.' : 'Let\'s Discuss Light.'}
          </h3>
          <form className="footer-brutalist-form" onSubmit={(e) => e.preventDefault()}>
            <input type="text" className="footer-input" placeholder={isProfessionals ? "Company Name" : "Name"} required />
            <input type="email" className="footer-input" placeholder="Email Address" required />
            <textarea className="footer-input" placeholder={isProfessionals ? "Technical Enquiry" : "Project Overview"} rows={3} required></textarea>
            <button type="submit" className="footer-submit">Submit</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Forma Luna. All rights reserved.</span>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
