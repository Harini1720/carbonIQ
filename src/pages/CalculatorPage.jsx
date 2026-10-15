import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { formatKg, formatTonnes } from '../utils/formatters';
import ElectricityCalculator from '../components/calculator/ElectricityCalculator';
import TransportCalculator from '../components/calculator/TransportCalculator';
import WasteCalculator from '../components/calculator/WasteCalculator';
import InfoNotice from '../components/common/InfoNotice';
import {
  Calculator,
  RotateCcw,
  Zap,
  Bus,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CalculatorPage({ onNavigate }) {
  const {
    activePreset,
    resetToPreset,
    totalFootprint,
    switchPreset,
    reportingPeriod
  } = useCarbon();

  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Multimodal Carbon Emissions Calculator
            </h1>
            <span className="badge badge-green">
              Live Mathematical Engine
            </span>
          </div>
          <p className="page-header-subtitle">
            Configure metered electricity, commuter mobility patterns, and solid waste streams. All calculations update dynamically in real time across the entire platform.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={resetToPreset}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RotateCcw size={14} />
            Reset to Preset Defaults
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="btn btn-primary btn-sm"
          >
            Simulate Decarbonization
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <InfoNotice
        title="Transparent Emission Factor Calibration:"
        message="Inputs are verified against physical operational units (kWh, passenger-km, kg waste). Negative values are automatically rejected to preserve calculation integrity."
      />

      {/* Real-Time Total Footprint Summary Ribbon */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(18, 33, 28, 0.9) 100%)',
          border: '1px solid var(--border-bright)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <Calculator size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>
              Calculated {reportingPeriod.toUpperCase()} Footprint
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
              {formatKg(totalFootprint.totalKg)}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '8px' }}>
                ({totalFootprint.totalTonnes.toFixed(2)} metric tonnes CO₂e)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Category breakdown pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Electricity</span>
            <strong style={{ fontSize: '0.85rem', color: '#34d399' }}>{totalFootprint.breakdown.electricity.share.toFixed(1)}%</strong>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Transportation</span>
            <strong style={{ fontSize: '0.85rem', color: '#2dd4bf' }}>{totalFootprint.breakdown.transport.share.toFixed(1)}%</strong>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Waste Streams</span>
            <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>{totalFootprint.breakdown.waste.share.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All Emission Scopes', icon: Layers },
          { id: 'electricity', label: 'Electricity (Scope 2)', icon: Zap },
          { id: 'transport', label: 'Transportation (Scope 3)', icon: Bus },
          { id: 'waste', label: 'Waste Streams (Scope 3)', icon: Trash2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: '6px' }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Calculators Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(activeCategory === 'all' || activeCategory === 'electricity') && (
          <ElectricityCalculator />
        )}

        {(activeCategory === 'all' || activeCategory === 'transport') && (
          <TransportCalculator />
        )}

        {(activeCategory === 'all' || activeCategory === 'waste') && (
          <WasteCalculator />
        )}
      </div>
    </div>
  );
}
