import Navbar from '../components/Navbar';
import './GatewayPage.css';

export default function GatewayPage() {
  return (
    <div className="gateway-hero">
      <Navbar />

      <div className="gateway-overlay" />

      <div className="gateway-content">
        <h1 className="gateway-title">Light that feels right.</h1>
        <p className="gateway-subtitle">
          We design and supply premium luminaires for residential and hospitality spaces, with a dedicated trade portal for
          professionals to access technical data and approved pricing.
        </p>

        {/* No CTA button in the middle hero. */}
        <div className="gateway-kicker">Architectural lighting studio + trade portfolio</div>
      </div>
    </div>
  );
}
