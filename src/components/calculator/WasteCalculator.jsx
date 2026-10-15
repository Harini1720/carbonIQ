import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { WASTE_STREAMS } from '../../data/emissionFactors';
import { formatKg, formatPercent } from '../../utils/formatters';
import { Trash2, Recycle, Apple, Cpu, AlertTriangle, BookOpen } from 'lucide-react';

export default function WasteCalculator() {
  const {
    inputs,
    updateInputs,
    wasteEmissions
  } = useCarbon();

  const handleStreamChange = (streamId, val) => {
    const safeVal = Math.max(0, parseFloat(val) || 0);
    updateInputs({
      wasteBreakdown: {
        ...inputs.wasteBreakdown,
        [streamId]: safeVal
      }
    });
  };

  const streamMeta = {
    landfill: { icon: Trash2, color: '#f59e0b', label: 'Landfill Disposal (Mixed)' },
    recycled: { icon: Recycle, color: '#38bdf8', label: 'Recycled Materials (Paper, Plastic, Metal)' },
    composted: { icon: Apple, color: '#10b981', label: 'Composted Organics & Food Scraps' },
    ewaste: { icon: Cpu, color: '#a855f7', label: 'Certified E-Waste Recycling' }
  };

  // Compute total waste kg & diversion rate
  const totalWasteKg = Object.values(inputs.wasteBreakdown).reduce((a, b) => a + (Number(b) || 0), 0);
  const divertedKg = (inputs.wasteBreakdown.recycled || 0) + (inputs.wasteBreakdown.composted || 0) + (inputs.wasteBreakdown.ewaste || 0);
  const diversionRate = totalWasteKg > 0 ? (divertedKg / totalWasteKg) * 100 : 0;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}
          >
            <Trash2 size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Waste Generation & Disposal (Scope 3 - Category 5)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Solid waste lifecycle emissions, diversion, and circular composting
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
            {formatKg(wasteEmissions.totalEmissionsKg)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Monthly Waste Footprint</span>
        </div>
      </div>

      {/* Diversion Progress Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(16, 28, 24, 0.8)',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
            Campus Circular Diversion Rate
          </span>
          <strong style={{ fontSize: '1.1rem', color: diversionRate > 50 ? '#34d399' : '#fbbf24' }}>
            {formatPercent(diversionRate)} diverted from landfills
          </strong>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div>Total Waste: <strong>{totalWasteKg.toLocaleString()} kg/mo</strong></div>
          <div>Diverted: <strong style={{ color: '#34d399' }}>{divertedKg.toLocaleString()} kg</strong></div>
        </div>
      </div>

      {/* Stream Input Fields */}
      <div className="grid-cols-2" style={{ marginBottom: '18px' }}>
        {WASTE_STREAMS.map((stream) => {
          const meta = streamMeta[stream.id] || { icon: Trash2, color: '#fff', label: stream.name };
          const Icon = meta.icon;
          const currentKg = inputs.wasteBreakdown[stream.id] || 0;
          const streamEmissions = currentKg * stream.factorPerKg;

          return (
            <div key={stream.id} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={14} color={meta.color} />
                  {meta.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {stream.factorPerKg} kg/kg
                </span>
              </label>
              <div className="form-input-unit">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={currentKg}
                  onChange={(e) => handleStreamChange(stream.id, e.target.value)}
                  className="form-input"
                  placeholder="0"
                />
                <span className="unit-tag">kg / mo</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                <span>Emits: {formatKg(streamEmissions)}</span>
                <span style={{ color: stream.treatment === 'Diversion' ? '#34d399' : '#fbbf24' }}>
                  {stream.treatment}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scientific Limitation & Transparency Note */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          padding: '12px 14px',
          borderRadius: '8px',
          fontSize: '0.78rem',
          color: '#fde68a',
          marginBottom: '14px',
          display: 'flex',
          gap: '10px'
        }}
      >
        <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', color: '#fff', marginBottom: '2px' }}>
            Waste Modeling Scope & Methodological Boundary:
          </strong>
          Factors reflect EPA WARM v15 and IPCC Municipal Solid Waste biological models. Hazardous chemical laboratory wastes and clinical biological wastes are excluded due to lack of open-source life-cycle factors.
        </div>
      </div>

      {/* Mathematical Breakdown Box */}
      <div
        style={{
          background: 'rgba(16, 28, 24, 0.7)',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
          <BookOpen size={13} color="#fbbf24" />
          Waste Emission Formula:
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24', marginTop: '2px' }}>
          Total Waste CO₂e = Σ (Stream Quantity in kg × Stream Factor in kg CO₂e/kg)
          = {formatKg(wasteEmissions.totalEmissionsKg)}
        </div>
      </div>
    </div>
  );
}
