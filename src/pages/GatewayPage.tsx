import { useState } from 'react';
import { Link } from 'react-router-dom';
import './GatewayPage.css';

export default function GatewayPage() {
  const [hoverSide, setHoverSide] = useState<'studio' | 'trade' | null>(null);

  return (
    <div className="gateway-hero">

      <header className="gateway-header">
        <h1 className="gateway-sr-only">Forma Luna — affordable luxury, light that feels right.</h1>
        <div className="gateway-header-inner">
          <Link to="/" className="gateway-logo-link" aria-label="Forma Luna">
            <img src="/logo-dark.png" alt="" className="gateway-logo" />
          </Link>
        </div>
      </header>

      <div className="gateway-split" role="presentation" onMouseLeave={() => setHoverSide(null)}>
        <section
          className={`gateway-panel gateway-panel--studio${hoverSide === 'studio' ? ' is-elevated' : ''}`}
          aria-labelledby="gateway-studio-heading"
          onMouseEnter={() => setHoverSide('studio')}
        >
          <div className="gateway-panel-bg" aria-hidden />
          <div className="gateway-panel-inner">
            <h2 id="gateway-studio-heading" className="gateway-panel-eyebrow">
              Studio &amp; portfolio
            </h2>
            <p className="gateway-panel-oneliner">
              Residential and hospitality lighting — curated for architects and homes.
            </p>
            <div className="gateway-actions">
              <Link to="/projects/projects" className="gateway-btn primary">
                Go to studio
              </Link>
            </div>
          </div>
        </section>

        <section
          className={`gateway-panel gateway-panel--trade${hoverSide === 'trade' ? ' is-elevated' : ''}`}
          aria-labelledby="gateway-trade-heading"
          onMouseEnter={() => setHoverSide('trade')}
        >
          <div className="gateway-panel-bg" aria-hidden />
          <div className="gateway-panel-inner">
            <h2 id="gateway-trade-heading" className="gateway-panel-eyebrow">
              Trade portal
            </h2>
            <p className="gateway-panel-oneliner">
              Specs, trade pricing, and support for contractors and integrators.
            </p>
            <div className="gateway-actions">
              <Link to="/professionals/about" className="gateway-btn primary">
                Go to trade portal
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="gateway-footer">
        <p className="gateway-footer-tagline">
          <span className="gateway-tagline-accent">Affordable luxury</span>
          <span className="gateway-tagline-serif">Light that feels right.</span>
        </p>
      </footer>
    </div>
  );
}
