import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import BeforeAfterVisualizer from '../components/simulator/BeforeAfterVisualizer';
import ScenarioSlider from '../components/simulator/ScenarioSlider';
import MeasureToggleCard from '../components/simulator/MeasureToggleCard';
import DecarbonizationImpactCard from '../components/simulator/DecarbonizationImpactCard';
import BaselineVsProjectedBarChart from '../components/charts/BaselineVsProjectedBarChart';
import InfoNotice from '../components/common/InfoNotice';
import {
  Sliders,
  Zap,
  Sun,
  Bus,
  Trash2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function SimulatorPage({ onNavigate }) {
  const {
    scenarioLevers,
    updateScenarioLevers,
    toggleScenarioMeasure,
    resetScenario,
    scenarioResults
  } = useCarbon();

  // Discrete campus initiatives
  const availableMeasures = [
    { id: 'm-led', name: 'Smart LED & Occupancy Sensors', category: 'electricity', reductionPct: 8 },
    { id: 'm-hvac', name: 'AI HVAC Setpoint & Nighttime Setback', category: 'electricity', reductionPct: 14 },
    { id: 'm-solar-expand', name: '250 kWp Rooftop & Carport Solar PV', category: 'electricity', reductionPct: 20 },
    { id: 'm-ev-shuttle', name: 'Campus Electric Transit Shuttle Fleet', category: 'transport', reductionPct: 15 },
    { id: 'm-carpool', name: 'Carpooling Platform & Preferential EV Slots', category: 'transport', reductionPct: 10 },
    { id: 'm-compost', name: 'Zero-Waste Cafeteria & Biodigester Hub', category: 'waste', reductionPct: 25 },
    { id: 'm-waste-audit', name: 'Multi-Stream Sorting & E-Waste Recovery', category: 'waste', reductionPct: 12 },
    { id: 'm-servers', name: 'Green Computing & Server Virtualization', category: 'electricity', reductionPct: 6 }
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Decarbonization Scenario Simulator
            </h1>
            <span className="badge badge-green">
              What-If Intelligence
            </span>
          </div>
          <p className="page-header-subtitle">
            Simulate the environmental outcome of efficiency measures, clean mobility transitions, and circular waste systems before capital investment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={resetScenario}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RotateCcw size={14} />
            Reset All Levers
          </button>
          <button
            onClick={() => onNavigate('recommendations')}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Sparkles size={14} />
            View AI Recommendations
          </button>
        </div>
      </div>

      <InfoNotice
        title="Scientific Grounding in Simulator:"
        message="Simulated emissions reductions are strictly bound to underlying thermodynamic and mathematical constraints. Reductions can never exceed 100% of baseline consumption."
      />

      {/* Before / After Projection Result Dashboard */}
      <BeforeAfterVisualizer />

      {/* Simulator Sliders Section */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="#34d399" />
          Core Decarbonization Policy Levers
        </h3>

        <div className="grid-cols-2" style={{ gap: '16px' }}>
          <ScenarioSlider
            label="Electricity Energy Efficiency Levers"
            subtitle="HVAC setback, LED retrofits, smart scheduling"
            value={scenarioLevers.electricityReductionPct}
            onChange={(val) => updateScenarioLevers({ electricityReductionPct: val })}
            min={0}
            max={60}
            icon={Zap}
            color="#10b981"
          />

          <ScenarioSlider
            label="On-Site Clean Renewable Solar Share"
            subtitle="Rooftop PV panels, canopy arrays, micro-inverters"
            value={scenarioLevers.solarSharePct}
            onChange={(val) => updateScenarioLevers({ solarSharePct: val })}
            min={0}
            max={100}
            icon={Sun}
            color="#38bdf8"
          />

          <ScenarioSlider
            label="Transportation Modal Shift & Transit Electrification"
            subtitle="Electric campus shuttles, carpooling, active commuting"
            value={scenarioLevers.transportShiftPct}
            onChange={(val) => updateScenarioLevers({ transportShiftPct: val })}
            min={0}
            max={80}
            icon={Bus}
            color="#14b8a6"
          />

          <ScenarioSlider
            label="Circular Waste Diversion & Composting"
            subtitle="Organic composting, zero-waste dining, e-waste recovery"
            value={scenarioLevers.wasteDiversionPct}
            onChange={(val) => updateScenarioLevers({ wasteDiversionPct: val })}
            min={0}
            max={90}
            icon={Trash2}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Discrete Campus Initiatives Grid */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Specific Campus Decarbonization Initiatives
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click to activate modular projects and evaluate cumulative mitigation impacts.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
            {scenarioLevers.activeMeasures.length} Active Initiatives
          </span>
        </div>

        <div className="grid-cols-2" style={{ gap: '12px' }}>
          {availableMeasures.map((measure) => {
            const isSelected = scenarioLevers.activeMeasures.some(m => m.id === measure.id);
            return (
              <MeasureToggleCard
                key={measure.id}
                measure={measure}
                isSelected={isSelected}
                onToggle={() => toggleScenarioMeasure(measure)}
              />
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Category Breakdown */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
          Category-by-Category Projected Carbon Mitigation
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Real-time adjustment of baseline vs simulated output across all operational streams
        </p>
        <BaselineVsProjectedBarChart scenarioResults={scenarioResults} />
      </div>

      {/* Tangible Real-World Equivalencies */}
      <DecarbonizationImpactCard />
    </div>
  );
}
