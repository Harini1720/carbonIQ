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
    updateInputs({ electricityKwh: e.target.value });
  };

  const handleSolarChange = (e) => {
    updateInputs({ solarOffsetPercent: e.target.value });
  };

  const handleRegionChange = (e) => {
    const regId = e.target.value;
    updateInputs({ gridFactorId: regId });
  };

  const handleCustomFactorChange = (e) => {
    updateInputs({ customGridFactor: e.target.value });
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
              color: 'var(--primary)'
            }}
          >
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Electricity Consumption (Scope 2)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Purchased grid power and onsite renewable generation
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {inputs.electricityKwh === '' || !inputs.gridFactorId ? '—' : formatKg(electricityEmissions.netEmissions)}
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
              step="any"
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
              {inputs.gridFactorId ? `${currentGridFactor.toFixed(3)} kg CO₂e/kWh` : 'Choose a factor'}
            </span>
          </label>
          <select
            value={inputs.gridFactorId}
            onChange={handleRegionChange}
            className="form-select"
          >
            <option value="" disabled>Select a grid region</option>
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
            <Sun size={15} color="var(--sky)" />
            Onsite Solar PV / Renewable Generation Offset
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--sky)' }}>
            {inputs.solarOffsetPercent === '' ? 'Enter measured offset' : `${Number(inputs.solarOffsetPercent).toFixed(1)}% (${formatKwh(electricityEmissions.solarKwh)}/mo)`}
          </span>
        </div>
        <div className="form-input-unit">
          <input type="number" min="0" max="100" step="0.1" value={inputs.solarOffsetPercent} onChange={handleSolarChange} className="form-input" placeholder="Enter measured percentage (0–100)" />
          <span className="unit-tag">%</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Use a measured or documented renewable electricity share. Enter 0 if none is used.</span>
      </div>

      {/* Mathematical Derivation Box */}
      <div
        style={{
          background: 'var(--bg-card-muted)',
          padding: '12px 14px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
          <BookOpen size={13} color="var(--primary)" />
          Mathematical Formula & Factor Derivation:
        </div>
        <div>
          Net Electricity Emissions = (Total Consumption - Onsite Solar) × Grid Emission Factor
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', marginTop: '3px' }}>
          = ({Number(inputs.electricityKwh || 0).toLocaleString()} - {Math.round(electricityEmissions.solarKwh).toLocaleString()}) kWh × {currentGridFactor} kg CO₂e/kWh = {inputs.electricityKwh === '' || !inputs.gridFactorId ? 'Enter activity data' : `${formatKg(electricityEmissions.netEmissions)} kg CO₂e`}
        </div>
      </div>
    </div>
  );
}
