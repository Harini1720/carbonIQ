import React from 'react';
import { GRID_EMISSION_REGIONS, TRANSPORT_MODES, WASTE_STREAMS, EQUIVALENCY_FACTORS } from '../data/emissionFactors';
import { BookOpen, ShieldCheck, FileCheck, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 className="page-header-title">
            Scientific Methodology & Standards Documentation
          </h1>
          <span className="badge badge-green">
            GHG Protocol Aligned
          </span>
        </div>
        <p className="page-header-subtitle">
          Transparent scientific foundations, emission factors, thermodynamic assumptions, mathematical formulas, and scope limitations governing CarbonIQ.
        </p>
      </div>

      {/* GHG Protocol Scope Mapping Grid */}
      <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-teal">Scope 1</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Direct Onsite Combustion</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Direct emissions from campus boilers, campus-owned maintenance vehicles, and backup diesel generators. In this prototype version, on-campus fleet activity is aggregated under campus transport.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-green">Scope 2</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Indirect Purchased Energy</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Emissions associated with the generation of electricity purchased from the regional transmission grid, offset by zero-carbon verified on-site solar photovoltaic generation.
          </p>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-blue">Scope 3</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Value Chain & Commuter Mobility</strong>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Includes Category 7 (Employee & Student Commuting) and Category 5 (Waste Generated in Operations), modeled through vehicle occupancies and municipal waste disposal streams.
          </p>
        </div>
      </div>

      {/* Core Mathematical Formulations */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileCheck size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Core Governing Mathematical Formulations
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
          {/* Formula 1: Electricity */}
          <div style={{ background: 'var(--bg-card-muted)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>
              1. Scope 2 Net Electricity Formula
            </strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'var(--bg-card-hover)', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' }}>
              E_electricity (kg CO₂e) = [ Consumption_kWh × (1 - Solar_Offset_Pct) ] × EF_grid (kg CO₂e/kWh)
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Where <code>EF_grid</code> represents the verified national/regional combined-margin grid emission factor (e.g. 0.82 kg CO₂e/kWh for the Indian National Grid per CEA Baseline Database v19).
            </p>
          </div>

          {/* Formula 2: Transport */}
          <div style={{ background: 'var(--bg-card-muted)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--teal)', display: 'block', marginBottom: '4px' }}>
              2. Scope 3 Commuter Transportation Formula (Double-Counting Safeguarded)
            </strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'var(--bg-card-hover)', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' }}>
              For private vehicles: E_transport = [ (Roundtrip_km × Days × Commuters) ÷ Vehicle_Occupancy ] × EF_vehicle<br />
              For public transit:   E_transport = (Roundtrip_km × Days × Commuters) × EF_passenger_km
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Dividing by <code>Vehicle_Occupancy</code> ensures that carpooling groups do not multiply emissions per vehicle.
            </p>
          </div>

          {/* Formula 3: Waste */}
          <div style={{ background: 'var(--bg-card-muted)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <strong style={{ color: 'var(--amber)', display: 'block', marginBottom: '4px' }}>
              3. Scope 3 Solid Waste Stream Formulation
            </strong>
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', background: 'var(--bg-card-hover)', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px' }}>
              E_waste (kg CO₂e) = Σ [ Waste_Quantity_Stream_i (kg) × EF_stream_i (kg CO₂e/kg) ]
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Where Landfill = 0.587 kg CO₂e/kg (reflecting methane degradation via EPA WARM v15) and Organic Composting = 0.010 kg CO₂e/kg (controlled aerobic biological stabilization).
            </p>
          </div>
        </div>
      </div>

      {/* Emission Factor Tables */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Documented Emission Factor Sources
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Sub-Item / Stream</th>
                <th style={{ padding: '10px' }}>Factor Value</th>
                <th style={{ padding: '10px' }}>Unit</th>
                <th style={{ padding: '10px' }}>Identifiable Source & Authority</th>
              </tr>
            </thead>
            <tbody>
              {GRID_EMISSION_REGIONS.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--primary)', fontWeight: 600 }}>Grid Power</td>
                  <td style={{ padding: '10px', color: 'var(--text-primary)' }}>{r.name}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{r.factor}</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{r.unit}</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{r.source}</td>
                </tr>
              ))}
              {TRANSPORT_MODES.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--teal)', fontWeight: 600 }}>Transport</td>
                  <td style={{ padding: '10px', color: 'var(--text-primary)' }}>{t.name}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{t.factorPerKm}</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{t.unit}</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{t.source}</td>
                </tr>
              ))}
              {WASTE_STREAMS.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--amber)', fontWeight: 600 }}>Waste</td>
                  <td style={{ padding: '10px', color: 'var(--text-primary)' }}>{w.name}</td>
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{w.factorPerKg}</td>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>{w.unit}</td>
                  <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{w.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodological Limitations & Integrity Disclaimers */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <ShieldCheck size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Scientific Integrity & Boundary Disclaimers
          </h3>
        </div>

        <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>
            <strong>Demonstration Status:</strong> All current facility building profiles, occupant densities, and solar generation meters represent simulated academic baseline models. They should not be conflated with physical utility revenue meters or live IoT hardware telemetry.
          </li>
          <li>
            <strong>No Fictitious Claims:</strong> CarbonIQ strictly avoids fabricating real-time sensor streams or claiming unverified machine learning models. The recommendation system runs on transparent, deterministic marginal carbon equations.
          </li>
          <li>
            <strong>Thermodynamic Conservation:</strong> Mitigation scenarios enforce strict conservation constraints: scenario reductions can never exceed 100% of baseline consumption, avoiding mathematically impossible negative footprints.
          </li>
          <li>
            <strong>Equivalency Factors:</strong> Real-world equivalents (trees planted, vehicle km eliminated) utilize standard US EPA Greenhouse Gas Equivalencies formulae (21.77 kg CO₂/tree/year, 0.170 kg CO₂/km passenger car).
          </li>
        </ul>
      </div>
    </div>
  );
}
