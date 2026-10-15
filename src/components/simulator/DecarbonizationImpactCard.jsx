import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { formatNumber } from '../../utils/formatters';
import { Trees, Car, Fuel, Smartphone, Award } from 'lucide-react';

export default function DecarbonizationImpactCard() {
  const { equivalents, scenarioResults } = useCarbon();

  const metrics = [
    {
      icon: Trees,
      value: equivalents.treesPlantedOneYear,
      unit: 'trees',
      label: 'Tree Absorption Equivalent',
      desc: 'Annual carbon sequestration by mature urban trees',
      color: '#10b981'
    },
    {
      icon: Car,
      value: equivalents.kmDrivenAvoided,
      unit: 'km',
      label: 'Vehicle Travel Removed',
      desc: 'Avoided passenger car tailpipe emissions',
      color: '#14b8a6'
    },
    {
      icon: Fuel,
      value: equivalents.gasolineLitersSaved,
      unit: 'liters',
      label: 'Petrol Conserved',
      desc: 'Liquid fossil fuel combustion prevented',
      color: '#f59e0b'
    },
    {
      icon: Smartphone,
      value: equivalents.smartphoneCharges,
      unit: 'charges',
      label: 'Smartphones Powered',
      desc: 'Equivalent mobile device zero-carbon charging cycles',
      color: '#0ea5e9'
    }
  ];

  return (
    <div className="glass-card" style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="#34d399" />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
            Tangible Decarbonization Equivalencies
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
                background: 'rgba(16, 28, 24, 0.6)',
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
                    background: `${m.color}22`,
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
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '2px' }}>
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
