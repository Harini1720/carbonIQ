import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { formatKg, formatTonnes, formatPercent } from '../../utils/formatters';
import AnimatedCounter from '../common/AnimatedCounter';
import { TrendingDown, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BeforeAfterVisualizer() {
  const { scenarioResults, resetScenario } = useCarbon();

  const handleCelebrate = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#38bdf8']
    });
  };

  return (
    <div
      className="glass-card"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 33, 28, 0.9) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom: '6px' }}>
            <Sparkles size={12} />
            Interactive Decarbonization Projection
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            Baseline vs Simulated Decarbonization Footprint
          </h3>
        </div>

        <button
          onClick={resetScenario}
          className="btn btn-secondary btn-sm"
          style={{ gap: '6px' }}
        >
          <RotateCcw size={14} />
          Reset Simulator
        </button>
      </div>

      <div className="grid-cols-3" style={{ gap: '16px', textAlign: 'center' }}>
        {/* Baseline Card */}
        <div
          style={{
            background: 'rgba(16, 28, 24, 0.8)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Current Campus Baseline
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', margin: '6px 0' }}>
            <AnimatedCounter value={scenarioResults.baselineTotalKg} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {scenarioResults.baselineTotalTonnes.toFixed(2)} tonnes CO₂e
          </span>
        </div>

        {/* Projected Decarbonized Card */}
        <div
          style={{
            background: 'rgba(16, 28, 24, 0.8)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-bright)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>
            Projected Emissions
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#34d399', margin: '6px 0' }}>
            <AnimatedCounter value={scenarioResults.projectedTotalKg} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
            {scenarioResults.projectedTotalTonnes.toFixed(2)} tonnes CO₂e
          </span>
        </div>

        {/* Avoided Delta Card */}
        <div
          onClick={handleCelebrate}
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--primary)',
            cursor: 'pointer'
          }}
          title="Click to celebrate progress!"
        >
          <span style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <TrendingDown size={14} />
            Avoided Carbon Footprint
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981', margin: '6px 0' }}>
            -<AnimatedCounter value={scenarioResults.avoidedTotalKg} />
          </div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.25)',
              color: '#6ee7b7',
              display: 'inline-block'
            }}
          >
            -{scenarioResults.percentageReduction.toFixed(1)}% Decarbonized
          </span>
        </div>
      </div>
    </div>
  );
}
