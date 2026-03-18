import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const isProfessionals = location.pathname.startsWith('/professionals');
  const isProjects = location.pathname.startsWith('/projects');
  const isLight = isProfessionals || isProjects;
  const [isScrolled, setIsScrolled] = useState(false);

  const projectLinks = [
    { name: 'About us', path: '/projects/about' },
    { name: 'Projects', path: '/projects/projects' },
    { name: 'Moodboards', path: '/projects/moodboards' },
    { name: 'Products', path: '/projects/products' },
    { name: 'Contact', path: '/projects/contact' },
  ];

  const professionalLinks = [
    { name: 'About us (Nova)', path: '/professionals/about' },
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

  return (
    <nav className={`navbar ${isLight ? 'light' : 'dark'} ${isLight && isScrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-brand">
        <img src="/logo.png" alt="Forma Luna" className="nav-logo" />
      </Link>
      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.name}
          </Link>
        ))}
        <Link to="/professionals" className="nav-cta">
          Enter Trade Portal
        </Link>
        {isProfessionals && (
          <Link
            to="/professionals/login"
            title="Trade Login"
            style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}
          >
            <User size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
