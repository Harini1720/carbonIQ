import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { GRID_EMISSION_REGIONS } from '../../data/emissionFactors';
import { formatKg, formatKwh, formatPercent } from '../../utils/formatters';
import { Zap, Sun, ShieldAlert, BookOpen } from 'lucide-react';

export default function ElectricityCalculator() {
  const {
    inputs,
    updateInputs,
    currentGridFactor,
    electricityEmissions
  } = useCarbon();

  const handleKwhChange = (e) => {
    const val = Math.max(0, parseFloat(e.target.value) || 0);
    updateInputs({ electricityKwh: val });
  };

  const handleSolarChange = (e) => {
    const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
    updateInputs({ solarOffsetPercent: val });
  };

  const handleRegionChange = (e) => {
    const regId = e.target.value;
    updateInputs({ gridFactorId: regId });
  };

  const handleCustomFactorChange = (e) => {
    const val = Math.max(0, parseFloat(e.target.value) || 0);
    updateInputs({ customGridFactor: val });
  };

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Electricity Consumption (Scope 2)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Purchased grid power and onsite renewable generation
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
            {formatKg(electricityEmissions.netEmissions)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Net Monthly Emissions</span>
        </div>
      </div>

      {/* Grid Inputs */}
      <div className="grid-cols-2" style={{ marginBottom: '18px' }}>
        {/* Monthly kWh Input */}
        <div className="form-group">
          <label className="form-label">
            <span>Total Monthly Consumption</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Metered grid power</span>
          </label>
          <div className="form-input-unit">
            <input
              type="number"
              min="0"
              step="500"
              value={inputs.electricityKwh}
              onChange={handleKwhChange}
              className="form-input"
              placeholder="e.g. 147500"
            />
            <span className="unit-tag">kWh / mo</span>
          </div>
        </div>

        {/* Grid Emission Factor Region */}
        <div className="form-group">
          <label className="form-label">
            <span>Grid Emission Factor Source</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {currentGridFactor.toFixed(3)} kg CO₂e/kWh
            </span>
          </label>
          <select
            value={inputs.gridFactorId}
            onChange={handleRegionChange}
            className="form-select"
          >
            {GRID_EMISSION_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.factor} kg/kWh)
              </option>
            ))}
            <option value="custom">Custom Emission Factor...</option>
          </select>
        </div>
      </div>

      {/* Custom Factor Input if selected */}
      {inputs.gridFactorId === 'custom' && (
        <div className="form-group" style={{ marginBottom: '18px' }}>
          <label className="form-label">
            <span>Custom Emission Factor</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Documented local utility factor</span>
          </label>
          <div className="form-input-unit">
            <input
              type="number"
              min="0"
              step="0.01"
              value={inputs.customGridFactor}
              onChange={handleCustomFactorChange}
              className="form-input"
              placeholder="e.g. 0.82"
            />
            <span className="unit-tag">kg CO₂e / kWh</span>
          </div>
        </div>
      )}

      {/* Onsite Solar / Green Offset Slider */}
      <div className="form-group" style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sun size={15} color="#38bdf8" />
            Onsite Solar PV / Renewable Generation Offset
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
            {inputs.solarOffsetPercent.toFixed(1)}% ({formatKwh(electricityEmissions.solarKwh)}/mo)
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={inputs.solarOffsetPercent}
          onChange={handleSolarChange}
          className="slider-range"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          <span>0% (100% Grid Dependent)</span>
          <span>50% Hybrid Microgrid</span>
          <span>100% Net-Zero Energy Campus</span>
        </div>
      </div>

      {/* Mathematical Derivation Box */}
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
          <BookOpen size={13} color="#34d399" />
          Mathematical Formula & Factor Derivation:
        </div>
        <div>
          Net Electricity Emissions = (Total Consumption - Onsite Solar) × Grid Emission Factor
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#34d399', marginTop: '3px' }}>
          = ({inputs.electricityKwh.toLocaleString()} - {Math.round(electricityEmissions.solarKwh).toLocaleString()}) kWh × {currentGridFactor} kg CO₂e/kWh = {formatKg(electricityEmissions.netEmissions)}
        </div>
      </div>
    </div>
  );
}
