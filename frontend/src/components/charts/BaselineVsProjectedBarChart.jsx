import React from 'react';
import { formatKg } from '../../utils/formatters';

export default function BaselineVsProjectedBarChart({ scenarioResults }) {
  if (!scenarioResults) return null;

  const { baselineTotalKg, projectedTotalKg, categories } = scenarioResults;

  const items = [
    {
      label: 'Electricity',
      baseline: categories.electricity.baseline,
      projected: categories.electricity.projected,
      avoided: categories.electricity.avoided,
      color: 'var(--primary)'
    },
    {
      label: 'Transportation',
      baseline: categories.transport.baseline,
      projected: categories.transport.projected,
      avoided: categories.transport.avoided,
      color: 'var(--teal)'
    },
    {
      label: 'Waste',
      baseline: categories.waste.baseline,
      projected: categories.waste.projected,
      avoided: categories.waste.avoided,
      color: 'var(--amber)'
    },
    {
      label: 'Total Footprint',
      baseline: baselineTotalKg,
      projected: projectedTotalKg,
      avoided: Math.max(0, baselineTotalKg - projectedTotalKg),
      color: 'var(--primary)',
      isTotal: true
    }
  ];

  const maxVal = Math.max(baselineTotalKg, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '10px 0' }}>
      {items.map((item, index) => {
        const baseWidth = item.baseline > 0 ? Math.max(2, (item.baseline / maxVal) * 100) : 0;
        const projWidth = item.projected > 0 ? Math.max(2, (item.projected / maxVal) * 100) : 0;
        const reductionPct = item.baseline > 0 ? ((item.avoided / item.baseline) * 100).toFixed(1) : 0;

        return (
          <div
            key={item.label}
            style={{
              padding: item.isTotal ? '12px' : '0',
              background: item.isTotal ? 'var(--primary-glow)' : 'transparent',
              borderRadius: '10px',
              border: item.isTotal ? '1px solid var(--border-subtle)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: item.isTotal ? 700 : 600, color: item.isTotal ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {item.label}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>
                  Base: {Math.round(item.baseline).toLocaleString()} kg
                </span>
                <span style={{ color: 'var(--text-muted)' }}>→</span>
                <strong style={{ color: 'var(--primary)' }}>
                  Proj: {Math.round(item.projected).toLocaleString()} kg
                </strong>
                {item.avoided > 0 && (
                  <span
                    style={{
                      background: 'var(--primary-glow)',
                      color: 'var(--primary)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    -{reductionPct}%
                  </span>
                )}
              </div>
            </div>

            {/* Bars container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {/* Baseline Bar */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'var(--bg-card-muted)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${baseWidth}%`,
                    height: '100%',
                    background: 'var(--border-medium)',
                    borderRadius: '6px',
                    transition: 'width 0.4s ease'
                  }}
                  title={`Baseline: ${Math.round(item.baseline)} kg CO2e`}
                />
              </div>

              {/* Projected Bar */}
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'var(--bg-card-muted)',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${projWidth}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${item.color} 0%, var(--teal) 100%)`,
                    borderRadius: '6px',
                    transition: 'width 0.4s ease',
                    boxShadow: `0 0 10px ${item.color}44`
                  }}
                  title={`Projected: ${Math.round(item.projected)} kg CO2e`}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)', paddingTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '6px', background: 'var(--border-medium)', borderRadius: '2px' }} />
          <span>Baseline</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '6px', background: 'var(--teal)', borderRadius: '2px' }} />
          <span>Projected (Decarbonized)</span>
        </div>
      </div>
    </div>
  );
}
