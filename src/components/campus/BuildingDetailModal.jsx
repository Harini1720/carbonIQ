import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { formatKg, formatKwh, formatPercent } from '../../utils/formatters';
import {
  X,
  Zap,
  Leaf,
  Sun,
  ShieldCheck,
  TrendingDown,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

export default function BuildingDetailModal({ building, onClose }) {
  const {
    activeBuildingRetrofits,
    toggleBuildingRetrofit,
    currentGridFactor
  } = useCarbon();

  if (!building) return null;

  const activeRetrofitIds = activeBuildingRetrofits[building.id] || [];
  const selectedMeasures = building.availableMeasures.filter(m => activeRetrofitIds.includes(m.id));

  // Compute total savings from active retrofits for this building
  const totalKwhSaved = selectedMeasures.reduce((sum, m) => sum + m.kwhSavingsMonthly, 0);
  const baselineKwh = building.monthlyKwh;
  const netBaselineKwh = Math.max(0, baselineKwh - building.solarMonthlyKwh);
  const baselineEmissionsKg = netBaselineKwh * currentGridFactor;

  const projectedKwh = Math.max(0, baselineKwh - totalKwhSaved);
  const projectedNetKwh = Math.max(0, projectedKwh - building.solarMonthlyKwh);
  const projectedEmissionsKg = projectedNetKwh * currentGridFactor;
  const avoidedEmissionsKg = Math.max(0, baselineEmissionsKg - projectedEmissionsKg);
  const reductionPct = baselineEmissionsKg > 0 ? (avoidedEmissionsKg / baselineEmissionsKg) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#13251e',
          border: '1px solid var(--border-bright)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-green">{building.type}</span>
              <span className="badge badge-simulated">Simulated Facility</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              {building.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {building.description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Structural & Energy Metrics Grid */}
        <div className="grid-cols-4" style={{ marginBottom: '20px', gap: '10px' }}>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Floor Area</span>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>{building.areaSqM.toLocaleString()} m²</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{building.floors} Floors</span>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Daily Occupants</span>
            <strong style={{ fontSize: '1rem', color: '#fff' }}>{building.occupants.toLocaleString()}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Staff & Students</span>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Solar PV Capacity</span>
            <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>{building.solarCapacityKwp} kWp</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{formatKwh(building.solarMonthlyKwh)}/mo</span>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block' }}>Energy Use Index</span>
            <strong style={{ fontSize: '1rem', color: '#34d399' }}>{building.euiKwhPerSqM}</strong>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>kWh / m² / yr</span>
          </div>
        </div>

        {/* Live Emissions Impact Overview Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(20, 184, 166, 0.06) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="#34d399" />
              <strong style={{ fontSize: '0.95rem', color: '#fff' }}>Building Carbon Performance</strong>
            </div>
            {avoidedEmissionsKg > 0 && (
              <span className="badge badge-green">
                <TrendingDown size={12} />
                -{reductionPct.toFixed(1)}% Avoided
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Baseline Monthly</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                {formatKg(baselineEmissionsKg)}
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatKwh(baselineKwh)}</span>
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>→</div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>With Active Retrofits</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                {formatKg(projectedEmissionsKg)}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>{formatKwh(projectedKwh)}</span>
            </div>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-dim)' }}>=</div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Net Avoided CO₂</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                {formatKg(avoidedEmissionsKg)}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#34d399' }}>Avoided/month</span>
            </div>
          </div>
        </div>

        {/* Available Sustainability Retrofits */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
              Available Decarbonization Measures
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Toggle measure to simulate impact
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {building.availableMeasures.map((measure) => {
              const isApplied = activeRetrofitIds.includes(measure.id);
              const measureEmissionsAvoided = measure.kwhSavingsMonthly * currentGridFactor;

              return (
                <div
                  key={measure.id}
                  onClick={() => toggleBuildingRetrofit(building.id, measure.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isApplied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 28, 24, 0.6)',
                    border: `1px solid ${isApplied ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        background: isApplied ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '2px',
                        flexShrink: 0
                      }}
                    >
                      {isApplied && <CheckCircle2 size={14} color="#fff" />}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block' }}>
                        {measure.title}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        {measure.description}
                      </span>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        <span>Savings: <strong style={{ color: '#34d399' }}>{formatKwh(measure.kwhSavingsMonthly)}/mo (-{measure.reductionPct}%)</strong></span>
                        <span>Avoids: <strong style={{ color: '#10b981' }}>{formatKg(measureEmissionsAvoided)}</strong></span>
                        <span>Est. Cost: <strong style={{ color: '#fff' }}>{measure.costEstimate}</strong></span>
                        <span>Payback: <strong style={{ color: '#fcd34d' }}>{measure.paybackYears} yrs</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={`btn btn-sm ${isApplied ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.75rem' }}
                  >
                    {isApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Existing Implemented Measures */}
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
            Current Operational Features:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {building.currentMeasures.map((cm, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)'
                }}
              >
                ✓ {cm}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <button
            onClick={() => {
              activeRetrofitIds.forEach(id => toggleBuildingRetrofit(building.id, id));
            }}
            className="btn btn-secondary btn-sm"
          >
            <RotateCcw size={14} />
            Reset Measures
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Done Inspecting
          </button>
        </div>
      </div>
    </div>
  );
}
