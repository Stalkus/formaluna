import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './QuotationTemplatePage.css';

const QuotationTemplatePage: React.FC = () => {
  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f7f7f0' }}>
      <Navbar />

      <div className="quotation-wrapper">
        <Link to="/professionals" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', color: 'var(--deep-green)', opacity: 0.6, textDecoration: 'none', alignSelf: 'flex-start', marginLeft: 'max(0px, calc(50% - 400px))', marginBottom: '24px' }}>
          &larr; Exit Quotation View
        </Link>
        
        <motion.div 
          className="quotation-document"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* PAGE 1: Cover */}
          <div className="quote-page quote-cover">
             <div className="quote-logo">Forma Luna</div>
             <img src="https://beneito-faure.com/wp-content/uploads/2024/07/img_portada_casa-terral.jpg" alt="Villa Lena Project" className="quote-cover-img" />
             <h1 className="quote-title">Lighting Proposal:<br/>Villa Lena Residence</h1>
             <p style={{ opacity: 0.6 }}>Date: October 24, 2026 <br/> Prepared for: Studio Arch</p>
          </div>

          {/* PAGE 2: Description */}
          <div className="quote-page">
            <h2 className="quote-heading">Project Overview</h2>
            <p className="quote-text">
              A comprehensive lighting study and fulfillment proposal for the Villa Lena residence. The objective is to deploy a combination of low-glare architectural downlights and bespoke linear surface profiles to accentuate the raw concrete textures of the interior, while maintaining visual quietness during the day. All fixtures specified utilize DALI-2 dimming protocols for seamless integration with the client's home automation system.
            </p>
          </div>

          {/* PAGE 3: Units Listing */}
          <div className="quote-page">
            <h2 className="quote-heading">Specified Luminaires</h2>
            <div className="quote-units-grid">
              
              <div className="quote-unit-card">
                <img src="https://beneito-faure.com/wp-content/uploads/2025/03/PR_OCULUM_3PH_Black_V1_00-15_1-700x700.jpg" alt="N-75" className="quote-unit-img" />
                <div>
                  <h3 className="quote-unit-name">N-75 Downlight</h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Recessed / 12W / 2700K</p>
                </div>
              </div>

              <div className="quote-unit-card">
                <img src="https://beneito-faure.com/wp-content/uploads/2025/03/PR_MAGNET_TRACK_48V_MINI_SURFACE_5578_5579_1-700x700.jpg" alt="Track" className="quote-unit-img" />
                <div>
                  <h3 className="quote-unit-name">Aura Track Line</h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Surface / 48V / Black</p>
                </div>
              </div>

               <div className="quote-unit-card">
                <img src="https://beneito-faure.com/wp-content/uploads/2025/03/PR_LONJA_3PH_BLACK_1-700x700.jpg" alt="Stella" className="quote-unit-img" />
                <div>
                  <h3 className="quote-unit-name">Stella Surface</h3>
                  <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>Cylindrical / 15W / 3000K</p>
                </div>
              </div>

            </div>
          </div>

          {/* PAGE 4: Quotation Breakdown */}
          <div className="quote-page">
            <h2 className="quote-heading">Financial Overview</h2>
            
            <table className="quote-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Item No.</th>
                  <th className="align-right">Qty</th>
                  <th className="align-right">Unit Price</th>
                  <th className="align-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Concept & Lighting Plan (Tier 2)</td>
                  <td>SRV-002</td>
                  <td className="align-right">1</td>
                  <td className="align-right">€ 750.00</td>
                  <td className="align-right">€ 750.00</td>
                </tr>
                <tr>
                  <td>N-75 Downlight (2700K)</td>
                  <td>NV-75-27K</td>
                  <td className="align-right">24</td>
                  <td className="align-right">€ 145.00</td>
                  <td className="align-right">€ 3,480.00</td>
                </tr>
                <tr>
                  <td>Aura Track Line (2m, Black)</td>
                  <td>AU-TR-2M-BLK</td>
                  <td className="align-right">6</td>
                  <td className="align-right">€ 210.00</td>
                  <td className="align-right">€ 1,260.00</td>
                </tr>
                <tr>
                  <td>Stella Surface Cylinder</td>
                  <td>ST-SRF-30K</td>
                  <td className="align-right">8</td>
                  <td className="align-right">€ 185.00</td>
                  <td className="align-right">€ 1,480.00</td>
                </tr>
                <tr>
                  <td>Installation (Estimated T&M)</td>
                  <td>SRV-INST</td>
                  <td className="align-right">1</td>
                  <td className="align-right">€ 2,400.00</td>
                  <td className="align-right">€ 2,400.00</td>
                </tr>
              </tbody>
            </table>

            <div className="quote-totals">
               <div className="quote-row">
                 <span>Subtotal</span>
                 <span>€ 9,370.00</span>
               </div>
               <div className="quote-row">
                 <span>VAT (21%)</span>
                 <span>€ 1,967.70</span>
               </div>
               <div className="quote-row bold" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(75, 96, 76, 0.2)'}}>
                 <span>Total (Incl. VAT)</span>
                 <span>€ 11,337.70</span>
               </div>
            </div>

            <div className="quote-terms">
              <strong>Terms & Conditions:</strong><br/>
              Proposal valid for 30 days. Lead time on fixtures is 4-6 weeks from receipt of 50% deposit. Installation costs are estimated on a Time & Materials basis and are subject to final site assessment. Standard Forma Luna terms of service apply.
            </div>

          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default QuotationTemplatePage;
