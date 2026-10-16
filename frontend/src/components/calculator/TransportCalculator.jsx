import React from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { TRANSPORT_MODES } from '../../data/emissionFactors';
import { formatKg } from '../../utils/formatters';
import { Bus, Car, Bike, Train, Footprints, Zap, BookOpen } from 'lucide-react';

export default function TransportCalculator() {
  const {
    inputs,
    updateInputs,
    currentTransportMode,
    transportEmissions
  } = useCarbon();

  const handleKmChange = (e) => {
    updateInputs({ dailyCommuteKm: e.target.value });
  };

  const handleDaysChange = (e) => {
    updateInputs({ commuteDays: e.target.value });
  };

  const handleCommutersChange = (e) => {
    updateInputs({ commutersCount: e.target.value });
  };

  const handleOccupancyChange = (e) => {
    updateInputs({ carpoolingOccupancy: e.target.value });
  };

  const modeIconMap = {
    car_petrol: Car,
    car_diesel: Car,
    ev: Zap,
    motorcycle: Bike,
    bus: Bus,
    train: Train,
    bicycle_walk: Footprints
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
              background: 'rgba(20, 184, 166, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2dd4bf'
            }}
          >
            <Bus size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Transportation Activity (Scope 3 - Category 7)
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Commuting distance, travel frequency, and selected mode
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2dd4bf' }}>
            {!currentTransportMode || inputs.dailyCommuteKm === '' || inputs.commuteDays === '' || inputs.commutersCount === '' ? '—' : formatKg(transportEmissions.emissionsKg)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Calculated emissions</span>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div style={{ marginBottom: '18px' }}>
        <label className="form-label">
          <span>Primary Commute Transport Mode</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {currentTransportMode ? `Factor: ${currentTransportMode.factorPerKm} ${currentTransportMode.unit}` : 'Choose your travel mode'}
          </span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
          {TRANSPORT_MODES.map((mode) => {
            const Icon = modeIconMap[mode.id] || Car;
            const isSelected = inputs.selectedTransportMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => updateInputs({ selectedTransportMode: mode.id })}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 8px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--primary-glow)' : 'var(--bg-card-muted)',
                  border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  color: isSelected ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={isSelected ? 'var(--primary)' : 'var(--text-dim)'} style={{ marginBottom: '4px' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                  {mode.name.split(' (')[0]}
                </span>
                <span style={{ fontSize: '0.65rem', color: isSelected ? 'var(--primary)' : 'var(--text-dim)', marginTop: '2px' }}>
                  {mode.factorPerKm} kg/km
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Numerical Inputs Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '18px', gap: '12px' }}>
        {/* Daily Commute Distance */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Roundtrip Distance</label>
          <div className="form-input-unit">
            <input
              type="number"
              min="0"
              step="0.5"
              value={inputs.dailyCommuteKm}
              onChange={handleKmChange}
              className="form-input"
            />
            <span className="unit-tag">km</span>
          </div>
        </div>

        {/* Travel Days Per Month */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Travel Days / Mo</label>
          <div className="form-input-unit">
            <input
              type="number"
              min="0"
              max="31"
              value={inputs.commuteDays}
              onChange={handleDaysChange}
              className="form-input"
            />
            <span className="unit-tag">days</span>
          </div>
        </div>

        {/* Commuters Count */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Commuter Count</label>
          <div className="form-input-unit">
            <input
              type="number"
              min="0"
              step="50"
              value={inputs.commutersCount}
              onChange={handleCommutersChange}
              className="form-input"
            />
            <span className="unit-tag">users</span>
          </div>
        </div>

        {/* Carpooling Occupancy (if vehicle based) */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>Vehicle Occupancy</label>
          <div className="form-input-unit">
            <input
              type="number"
              min="1"
              max="6"
              step="0.1"
              disabled={!currentTransportMode?.isVehicleBased}
              value={inputs.carpoolingOccupancy}
              onChange={handleOccupancyChange}
              className="form-input"
              style={{ opacity: currentTransportMode?.isVehicleBased ? 1 : 0.5 }}
            />
            <span className="unit-tag">passengers</span>
          </div>
        </div>
      </div>

      {/* Formula & Passenger-Km Derivation Box */}
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
          <BookOpen size={13} color="#2dd4bf" />
          Transportation Formula & Double-Counting Safeguard:
        </div>
        <div>
          {!currentTransportMode
            ? 'Select the actual commute mode and enter measured activity before calculating.'
            : currentTransportMode.isVehicleBased
              ? 'Vehicle-km Traveled = (Distance × Travel Days × Commuters) ÷ Vehicle Occupancy'
              : 'Passenger-km Traveled = Distance × Travel Days × Commuters'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: '#2dd4bf', marginTop: '3px' }}>
          = {Math.round(transportEmissions.vehicleKmTraveled).toLocaleString()} km × {currentTransportMode?.factorPerKm || 0} kg CO₂e/km = {currentTransportMode && inputs.dailyCommuteKm !== '' && inputs.commuteDays !== '' && inputs.commutersCount !== '' ? `${formatKg(transportEmissions.emissionsKg)} kg CO₂e/mo` : 'Enter all commute data'}
        </div>
      </div>
    </div>
  );
}
