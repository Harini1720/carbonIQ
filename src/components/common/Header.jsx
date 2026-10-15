import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { CAMPUS_PRESETS } from '../../data/campusPresets';
import {
  Calendar,
  Building2,
  Download,
  Check,
  Sparkles,
  Menu,
  X,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  const {
    activePresetId,
    switchPreset,
    reportingPeriod,
    setReportingPeriod,
    totalFootprint,
    scenarioResults
  } = useCarbon();

  const [showExportModal, setShowExportModal] = useState(false);

  const triggerExport = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#10b981', '#34d399', '#14b8a6']
    });
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ['CarbonIQ — Carbon Footprint Audit Report (PS05)'],
      ['Generated Date', new Date().toISOString().split('T')[0]],
      ['Campus Profile', activePreset.name],
      ['Reporting Period', reportingPeriod],
      [],
      ['Emission Category', 'Scope', 'Activity Quantity', 'Unit', 'Emission Factor', 'Emissions (kg CO2e)', 'Emissions (tCO2e)'],
      ['Electricity (Net Grid)', 'Scope 2', inputs.electricityKwh, 'kWh/mo', `${currentGridFactor} kg/kWh`, electricityEmissions.netEmissions.toFixed(1), (electricityEmissions.netEmissions / 1000).toFixed(2)],
      ['Onsite Solar Offset', 'Scope 2', electricityEmissions.solarKwh.toFixed(0), 'kWh/mo', '0.0 kg/kWh (Avoided)', (-electricityEmissions.avoidedBySolar).toFixed(1), (-electricityEmissions.avoidedBySolar / 1000).toFixed(2)],
      ['Commuter Transportation', 'Scope 3', Math.round(transportEmissions.vehicleKmTraveled), 'vehicle-km/mo', `${currentTransportMode.factorPerKm} kg/km`, transportEmissions.emissionsKg.toFixed(1), (transportEmissions.emissionsKg / 1000).toFixed(2)],
      ['Solid Waste (Landfill)', 'Scope 3', inputs.wasteBreakdown.landfill || 0, 'kg/mo', '0.587 kg/kg', ((inputs.wasteBreakdown.landfill || 0) * 0.587).toFixed(1), (((inputs.wasteBreakdown.landfill || 0) * 0.587) / 1000).toFixed(2)],
      ['Solid Waste (Recycled)', 'Scope 3', inputs.wasteBreakdown.recycled || 0, 'kg/mo', '0.021 kg/kg', ((inputs.wasteBreakdown.recycled || 0) * 0.021).toFixed(1), (((inputs.wasteBreakdown.recycled || 0) * 0.021) / 1000).toFixed(2)],
      ['Solid Waste (Composted)', 'Scope 3', inputs.wasteBreakdown.composted || 0, 'kg/mo', '0.010 kg/kg', ((inputs.wasteBreakdown.composted || 0) * 0.010).toFixed(1), (((inputs.wasteBreakdown.composted || 0) * 0.010) / 1000).toFixed(2)],
      [],
      ['Summary Metrics', 'Value (kg CO2e)', 'Value (tCO2e)', 'Percentage'],
      ['Total Baseline Footprint', totalFootprint.totalKg.toFixed(1), totalFootprint.totalTonnes.toFixed(2), '100%'],
      ['Projected Decarbonized', scenarioResults.projectedTotalKg.toFixed(1), scenarioResults.projectedTotalTonnes.toFixed(2), `${(100 - scenarioResults.percentageReduction).toFixed(1)}%`],
      ['Avoided Emissions Delta', `-${scenarioResults.avoidedTotalKg.toFixed(1)}`, `-${scenarioResults.avoidedTotalTonnes.toFixed(2)}`, `-${scenarioResults.percentageReduction.toFixed(1)}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CarbonIQ_Audit_${activePreset.id}_${reportingPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const payload = {
      platform: 'CarbonIQ — PS05',
      exportDate: new Date().toISOString(),
      preset: activePreset,
      period: reportingPeriod,
      inputs: inputs,
      footprint: totalFootprint,
      scenarioProjections: scenarioResults
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CarbonIQ_Dataset_${activePreset.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(18, 33, 28, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onMobileMenuToggle}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
            id="mobile-nav-toggle"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Campus Preset Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#34d399" />
            <select
              value={activePresetId}
              onChange={(e) => switchPreset(e.target.value)}
              className="form-select"
              style={{
                padding: '6px 12px',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'rgba(16, 28, 24, 0.9)',
                borderColor: 'var(--border-medium)',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              aria-label="Select Campus Preset"
            >
              {CAMPUS_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <span className="badge badge-simulated" style={{ display: 'inline-flex' }}>
            Demo Model (PS05)
          </span>
        </div>

        {/* Right Section: Period Toggle & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Period Selector Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(16, 28, 24, 0.9)',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: 'quarterly', label: 'Quarterly' },
              { id: 'annual', label: 'Annual' }
            ].map((p) => {
              const active = reportingPeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setReportingPeriod(p.id)}
                  style={{
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#ffffff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <Download size={15} />
            <span style={{ display: 'inline' }}>Export Report</span>
          </button>
        </div>
      </header>

      {/* Export Report Modal */}
      {showExportModal && (
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
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="glass-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#13241e',
              border: '1px solid var(--border-bright)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText color="#34d399" size={20} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  Carbon Intelligence Executive Summary
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Snapshot generated for hackathon review and sustainability committee presentations.
            </p>

            <div
              style={{
                background: 'rgba(16, 28, 24, 0.8)',
                padding: '16px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Baseline Footprint:</span>
                <strong>{totalFootprint.totalKg.toLocaleString()} kg CO₂e ({totalFootprint.totalTonnes.toFixed(2)} t)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Projected Decarbonized:</span>
                <strong style={{ color: '#34d399' }}>
                  {scenarioResults.projectedTotalKg.toLocaleString()} kg CO₂e ({scenarioResults.projectedTotalTonnes.toFixed(2)} t)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Avoided Emissions:</span>
                <strong style={{ color: '#10b981' }}>
                  -{scenarioResults.avoidedTotalKg.toLocaleString()} kg CO₂e (-{scenarioResults.percentageReduction.toFixed(1)}%)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Reporting Period:</span>
                <span style={{ textTransform: 'capitalize' }}>{reportingPeriod}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={exportCSV}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gap: '4px' }}
                  title="Download metered breakdown in CSV format"
                >
                  <Download size={13} />
                  Export CSV
                </button>
                <button
                  onClick={exportJSON}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', gap: '4px' }}
                  title="Download full JSON dataset"
                >
                  <Download size={13} />
                  Export JSON
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  onClick={triggerExport}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Style for mobile nav toggle */}
      <style>{`
        @media (max-width: 900px) {
          #mobile-nav-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </>
  );
}
