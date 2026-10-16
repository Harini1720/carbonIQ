import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { ArrowRight, Building2, Image, Upload } from 'lucide-react';

export default function CampusTwinPage({ onNavigate }) {
  const { hasCompleteFootprint } = useCarbon();

  return (
    <div className="page-content">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-header-title">Facility Data</h1>
        <p className="page-header-subtitle">
          Facility-specific visualizations require building records supplied by you. No sample campus or building measurements are included.
        </p>
      </div>

      <section className="glass-card" style={{ maxWidth: '760px', margin: '0 auto', padding: '36px', textAlign: 'center' }}>
        <Building2 size={34} color="var(--primary)" style={{ marginBottom: '14px' }} />
        <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No building records available</h2>
        <p style={{ maxWidth: '540px', margin: '0 auto 20px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          Add your own activity data to calculate a facility footprint, or upload a building photo to view an explicitly illustrative greener concept. A photo is not used to infer measurements or emissions.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('calculator')} className="btn btn-primary btn-sm">
            <Upload size={15} /> Enter facility activity <ArrowRight size={14} />
          </button>
          <button onClick={() => onNavigate('image-impact')} className="btn btn-secondary btn-sm">
            <Image size={15} /> Open image impact
          </button>
        </div>
        {hasCompleteFootprint && (
          <p style={{ marginTop: '18px', color: 'var(--primary)', fontSize: '0.75rem' }}>
            A complete emissions estimate is available from the activity data you entered.
          </p>
        )}
      </section>
    </div>
  );
}
