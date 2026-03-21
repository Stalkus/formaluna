import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, X } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isProfessionals = location.pathname.startsWith('/professionals');
  const isProjects = location.pathname.startsWith('/projects');
  const isLight = isProfessionals || isProjects;
  const logoSrc = isProfessionals ? '/logo-light.png' : '/logo-dark.png';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const projectLinks = [
    { name: 'About us', path: '/projects/about' },
    { name: 'Projects', path: '/projects/projects' },
    { name: 'Moodboards', path: '/projects/moodboards' },
    { name: 'Products', path: '/projects/products' },
    { name: 'Contact', path: '/projects/contact' },
  ];

  const professionalLinks = [
    { name: 'About us', path: '/professionals/about' },
    { name: 'Portfolio', path: '/professionals/products' },
    { name: 'Contact', path: '/professionals/contact' },
  ];

  const links = isProfessionals ? professionalLinks : projectLinks;

  useEffect(() => {
    if (!isLight) return;

    function onScroll() {
      setIsScrolled(window.scrollY > 10);
    }

    onScroll(); // initialize
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLight]);

  useEffect(() => {
    // Close mobile menu on navigation
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`navbar ${isProfessionals ? 'trade' : isProjects ? 'light' : 'dark'} ${isLight && isScrolled ? 'scrolled' : ''}`}
    >
      <Link to="/" className="nav-brand">
        <img src={logoSrc} alt="Forma Luna" className="nav-logo" />
      </Link>
      <button
        className="nav-menu-btn"
        type="button"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen((v) => !v)}
      >
        {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`nav-links ${isMobileOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(false)}
          >
            {link.name}
          </Link>
        ))}
        {isProfessionals ? (
          <Link to="/projects/projects" className="nav-cta nav-cta-studio" onClick={() => setIsMobileOpen(false)}>
            Studio
          </Link>
        ) : (
          <Link to="/professionals" className="nav-cta nav-cta-trade-entry" onClick={() => setIsMobileOpen(false)}>
            Enter Trade Portal
          </Link>
        )}
        {isProfessionals && (
          <Link
            to="/professionals/trade-login"
            title="Trade account login"
            className="nav-icon-link"
            onClick={() => setIsMobileOpen(false)}
          >
            <User size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
