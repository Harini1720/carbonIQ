import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { formatNumber } from '../../utils/formatters';
import { Trees, Car, Fuel, Smartphone, Award } from 'lucide-react';

export default function DecarbonizationImpactCard({ equivalents: suppliedEquivalents }) {
  const carbon = useCarbon();
  const equivalents = suppliedEquivalents || carbon.equivalents;

  const metrics = [
    {
      icon: Trees,
      value: equivalents.treesPlantedOneYear,
      unit: 'trees',
      label: 'Tree Absorption Equivalent',
      desc: 'Annual carbon sequestration by mature urban trees',
      color: 'var(--primary)'
    },
    {
      icon: Car,
      value: equivalents.kmDrivenAvoided,
      unit: 'km',
      label: 'Vehicle Travel Removed',
      desc: 'Avoided passenger car tailpipe emissions',
      color: 'var(--teal)'
    },
    {
      icon: Fuel,
      value: equivalents.gasolineLitersSaved,
      unit: 'liters',
      label: 'Petrol Conserved',
      desc: 'Liquid fossil fuel combustion prevented',
      color: 'var(--amber)'
    },
    {
      icon: Smartphone,
      value: equivalents.smartphoneCharges,
      unit: 'charges',
      label: 'Smartphones Powered',
      desc: 'Equivalent mobile device zero-carbon charging cycles',
      color: 'var(--sky)'
    }
  ];

  return (
    <div className="glass-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--primary)" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Illustrative Emissions Equivalents
          </h4>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          EPA GHG Equivalency Formulae
        </span>
      </div>

      <div className="grid-cols-4" style={{ gap: '14px' }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {m.label}
                </span>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    background: 'var(--primary-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: m.color
                  }}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                  {formatNumber(m.value)} <span style={{ fontSize: '0.8rem', color: m.color, fontWeight: 700 }}>{m.unit}</span>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', lineHeight: 1.25 }}>
                  {m.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
