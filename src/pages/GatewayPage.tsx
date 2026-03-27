import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './GatewayPage.css';

export default function GatewayPage() {
  return (
    <div className="gateway-hero">
      <Navbar />

      <div className="gateway-split" role="presentation">
        <section
          className="gateway-panel gateway-panel--studio"
          aria-labelledby="gateway-studio-heading"
        >
          <div className="gateway-panel-bg" aria-hidden />
          <div className="gateway-panel-inner">
            <p className="gateway-panel-eyebrow">Studio &amp; portfolio</p>
            <h1 id="gateway-studio-heading" className="gateway-panel-title">
              Light for homes &amp; hospitality
            </h1>
            <p className="gateway-panel-text">
              Explore projects, moodboards, and our residential and hospitality collections — curated for
              architects and homeowners.
            </p>
            <div className="gateway-actions">
              <Link to="/projects/projects" className="gateway-btn primary">
                Explore projects
              </Link>
              <Link to="/projects/about" className="gateway-btn">
                About the studio
              </Link>
            </div>
          </div>
        </section>

        <section
          className="gateway-panel gateway-panel--trade"
          aria-labelledby="gateway-trade-heading"
        >
          <div className="gateway-panel-bg" aria-hidden />
          <div className="gateway-panel-inner">
            <p className="gateway-panel-eyebrow">Trade portal</p>
            <h1 id="gateway-trade-heading" className="gateway-panel-title">
              Specs &amp; wholesale for professionals
            </h1>
            <p className="gateway-panel-text">
              Technical sheets, trade pricing, and support for electrical contractors, integrators, and
              project teams.
            </p>
            <div className="gateway-actions">
              <Link to="/professionals/about" className="gateway-btn primary">
                Enter trade portal
              </Link>
              <Link to="/professionals/products" className="gateway-btn">
                Trade catalog
              </Link>
            </div>
          </div>
        </section>
      </div>

      <p className="gateway-kicker">Forma Luna — architectural lighting studio + trade portfolio</p>
    </div>
  );
}
