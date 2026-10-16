import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { formatKg } from '../../utils/formatters';
import AnimatedCounter from '../common/AnimatedCounter';
import { TrendingDown, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BeforeAfterVisualizer({ scenarioResults: suppliedResults, onReset }) {
  const carbon = useCarbon();
  const scenarioResults = suppliedResults || carbon.scenarioResults;
  const resetScenario = onReset || carbon.resetScenario;

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
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '24px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="badge badge-green" style={{ marginBottom: '6px' }}>
            <Sparkles size={12} />
            Interactive Decarbonization Projection
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Entered Activity vs Scenario Estimate
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
            background: 'var(--bg-card-muted)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Entered Baseline
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0' }}>
            <AnimatedCounter value={scenarioResults.baselineTotalKg} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {scenarioResults.baselineTotalTonnes.toFixed(2)} tonnes CO₂e
          </span>
        </div>

        {/* Projected Decarbonized Card */}
        <div
          style={{
            background: 'var(--bg-card-muted)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border-bright)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700 }}>
            Scenario Estimate
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>
            <AnimatedCounter value={scenarioResults.projectedTotalKg} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {scenarioResults.projectedTotalTonnes.toFixed(2)} tonnes CO₂e
          </span>
        </div>

        {/* Avoided Delta Card */}
        <div
          onClick={handleCelebrate}
          style={{
            background: 'var(--primary-glow)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--primary)',
            cursor: 'pointer'
          }}
          title="Click to celebrate progress!"
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <TrendingDown size={14} />
            Estimated Difference
          </span>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>
            -<AnimatedCounter value={scenarioResults.avoidedTotalKg} />
          </div>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'inline-block'
            }}
          >
            {scenarioResults.percentageReduction.toFixed(1)}% estimated reduction
          </span>
        </div>
      </div>
    </div>
  );
}
