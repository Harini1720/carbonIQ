import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { useAuth } from '../context/AuthContext';
import OrganizationScenarioSimulator from './OrganizationScenarioSimulator';
import BeforeAfterVisualizer from '../components/simulator/BeforeAfterVisualizer';
import ScenarioSlider from '../components/simulator/ScenarioSlider';
import DecarbonizationImpactCard from '../components/simulator/DecarbonizationImpactCard';
import BaselineVsProjectedBarChart from '../components/charts/BaselineVsProjectedBarChart';
import InfoNotice from '../components/common/InfoNotice';
import { AlertCircle, ArrowRight, ClipboardList, Sliders, Zap, Sun, Bus, Trash2, Sparkles, RotateCcw } from 'lucide-react';

function LocalScenarioSimulator({ onNavigate }) {
  const {
    scenarioLevers,
    updateScenarioLevers,
    resetScenario,
    scenarioResults,
    hasCompleteFootprint
  } = useCarbon();

  if (!hasCompleteFootprint) {
    return (
      <div className="page-content">
        <h1 className="page-header-title">Decarbonization Scenario Simulator</h1>
        <p className="page-header-subtitle">Enter complete facility activity data before exploring a what-if scenario.</p>
        <section className="glass-card" style={{ maxWidth: '680px', margin: '30px auto', textAlign: 'center' }}>
          <ClipboardList size={30} color="var(--primary)" style={{ marginBottom: '12px' }} />
          <h2 style={{ marginBottom: '8px' }}>No complete baseline to simulate</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
            Scenario results are estimates based on the activity values you enter. There are no sample baselines or preselected reductions.
          </p>
          <button onClick={() => onNavigate('calculator')} className="btn btn-primary btn-sm">
            Enter activity data <ArrowRight size={14} />
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">Decarbonization Scenario Simulator</h1>
            <span className="badge badge-green">What-If Intelligence</span>
          </div>
          <p className="page-header-subtitle">
            Explore user-defined reduction assumptions and compare estimated emissions across the entered activity categories.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={resetScenario} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <RotateCcw size={14} /> Reset All Levers
          </button>
          <button onClick={() => onNavigate('recommendations')} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Sparkles size={14} /> View Activity Recommendations
          </button>
        </div>
      </div>

      <InfoNotice
        title="User-defined scenario assumptions"
        message="Choose reduction percentages to explore a mathematical what-if scenario. Results are not measured savings, guaranteed outcomes, or project-specific engineering estimates."
        type="simulated"
      />

      <BeforeAfterVisualizer />

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--primary)" /> Reduction Assumptions
        </h3>
        <div className="grid-cols-2" style={{ gap: '16px' }}>
          <ScenarioSlider label="Electricity Energy Efficiency Levers" subtitle="HVAC setback, LED retrofits, smart scheduling" value={scenarioLevers.electricityReductionPct} onChange={value => updateScenarioLevers({ electricityReductionPct: value })} min={0} max={60} icon={Zap} color="var(--primary)" />
          <ScenarioSlider label="On-Site Clean Renewable Solar Share" subtitle="Rooftop PV panels, canopy arrays, micro-inverters" value={scenarioLevers.solarSharePct} onChange={value => updateScenarioLevers({ solarSharePct: value })} min={0} max={100} icon={Sun} color="var(--sky)" />
          <ScenarioSlider label="Transportation Modal Shift & Transit Electrification" subtitle="Electric campus shuttles, carpooling, active commuting" value={scenarioLevers.transportShiftPct} onChange={value => updateScenarioLevers({ transportShiftPct: value })} min={0} max={80} icon={Bus} color="var(--teal)" />
          <ScenarioSlider label="Circular Waste Diversion & Composting" subtitle="Organic composting, zero-waste dining, e-waste recovery" value={scenarioLevers.wasteDiversionPct} onChange={value => updateScenarioLevers({ wasteDiversionPct: value })} min={0} max={90} icon={Trash2} color="var(--amber)" />
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Category-by-Category Projected Carbon Mitigation</h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>User-defined activity baseline compared with the selected reduction assumptions</p>
        <BaselineVsProjectedBarChart scenarioResults={scenarioResults} />
      </div>

      <DecarbonizationImpactCard />
    </div>
  );
}

export default function SimulatorPage({ onNavigate }) {
  const { status } = useAuth();
  if (status === 'loading') {
    return <div className="page-content"><div className="glass-card organization-loading" role="status">Checking workspace access…</div></div>;
  }
  if (status === 'unavailable') {
    return (
      <div className="page-content">
        <h1 className="page-header-title">Decarbonization Scenario Simulator</h1>
        <div className="workspace-error" role="alert"><AlertCircle size={15} />The account service is unavailable. Organisation scenarios could not be loaded.</div>
      </div>
    );
  }
  return status === 'authenticated'
    ? <OrganizationScenarioSimulator onNavigate={onNavigate} />
    : <LocalScenarioSimulator onNavigate={onNavigate} />;
}
