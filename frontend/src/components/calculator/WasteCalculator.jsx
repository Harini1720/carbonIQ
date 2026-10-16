import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { WASTE_STREAMS } from '../../data/emissionFactors';
import { formatKg, formatPercent } from '../../utils/formatters';
import { Trash2, Recycle, Apple, Cpu } from 'lucide-react';

export default function WasteCalculator() {
  const {
    inputs,
    updateInputs,
    wasteEmissions
  } = useCarbon();

  const handleStreamChange = (streamId, val) => {
    updateInputs({
      wasteBreakdown: {
        ...inputs.wasteBreakdown,
        [streamId]: val
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Waste Generation & Disposal (Scope 3 - Category 5)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Solid waste lifecycle emissions, diversion, and circular composting
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--amber)' }}>
            {Object.values(inputs.wasteBreakdown).every(value => value === '') ? '—' : formatKg(wasteEmissions.totalEmissionsKg)}
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
          background: 'var(--bg-card-muted)',
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '18px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
            Waste Diversion Rate
          </span>
          <strong style={{ fontSize: '1.1rem', color: diversionRate > 50 ? 'var(--primary)' : 'var(--amber)' }}>
            {totalWasteKg > 0 ? `${formatPercent(diversionRate)} diverted from landfills` : 'Enter measured waste by stream'}
          </strong>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <div>Total Waste: <strong>{totalWasteKg > 0 ? `${totalWasteKg.toLocaleString()} kg/mo` : '—'}</strong></div>
          <div>Diverted: <strong style={{ color: 'var(--primary)' }}>{totalWasteKg > 0 ? `${divertedKg.toLocaleString()} kg` : '—'}</strong></div>
        </div>
      </div>

      {/* Stream Input Fields */}
      <div className="grid-cols-2" style={{ marginBottom: '18px' }}>
        {WASTE_STREAMS.map((stream) => {
          const meta = streamMeta[stream.id] || { icon: Trash2, color: '#fff', label: stream.name };
          const Icon = meta.icon;
          const currentKg = inputs.wasteBreakdown[stream.id];
          const streamEmissions = (Number(currentKg) || 0) * stream.factorPerKg;

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
                <span>Emissions: {currentKg === '' ? 'Not entered' : `${formatKg(streamEmissions)} kg CO₂e`}</span>
                <span style={{ color: stream.treatment === 'Diversion' ? 'var(--primary)' : 'var(--amber)' }}>
                  {stream.treatment}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
