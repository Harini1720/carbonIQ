import React from 'react';
import { useCarbon } from '../context/CarbonContext';
import { formatKg, formatTonnes } from '../utils/formatters';
import MetricCard from '../components/common/MetricCard';
import InfoNotice from '../components/common/InfoNotice';
import EmissionsDonutChart from '../components/charts/EmissionsDonutChart';
import BaselineVsProjectedBarChart from '../components/charts/BaselineVsProjectedBarChart';
import EmissionsTrendLineChart from '../components/charts/EmissionsTrendLineChart';
import Campus3DViewer from '../components/campus/Campus3DViewer';
import {
  Zap,
  Bus,
  Trash2,
  Leaf,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target
} from 'lucide-react';

export default function DashboardPage({ onNavigate, onSelectBuilding }) {
  const {
    activePreset,
    reportingPeriod,
    electricityEmissions,
    transportEmissions,
    wasteEmissions,
    totalFootprint,
    scenarioResults
  } = useCarbon();

  return (
    <div className="page-content">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Campus Carbon Intelligence Dashboard
            </h1>
            <span className="badge badge-green">
              {reportingPeriod.toUpperCase()} REPORT
            </span>
          </div>
          <p className="page-header-subtitle">
            Holistic Scope 1, 2, and 3 carbon accounting, decarbonization tracking, and interactive scenario simulation for {activePreset.name}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigate('simulator')}
            className="btn btn-primary btn-sm"
          >
            <Sparkles size={15} />
            Simulate Scenarios
          </button>
          <button
            onClick={() => onNavigate('calculator')}
            className="btn btn-secondary btn-sm"
          >
            Adjust Data
          </button>
        </div>
      </div>

      {/* Simulated Notice */}
      <InfoNotice
        title="Demonstration Model Notice:"
        message={`Displaying calibrated simulated footprint for ${activePreset.name}. All formulas use verifiable CEA India (v19) and IPCC AR6 factors. Not connected to live IoT telemetry.`}
      />

      {/* 5 Key Metric Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
        <MetricCard
          title="Total Gross Emissions"
          value={totalFootprint.totalKg}
          unit="kg CO₂e"
          subtitle={`${totalFootprint.totalTonnes.toFixed(2)} metric tonnes`}
          icon={Leaf}
          color="emerald"
          tooltip="Sum of Scope 2 electricity plus Scope 3 commuting and waste"
        />

        <MetricCard
          title="Electricity (Scope 2)"
          value={electricityEmissions.netEmissions}
          unit="kg CO₂e"
          subtitle={`${totalFootprint.breakdown.electricity.share.toFixed(1)}% of total footprint`}
          icon={Zap}
          color="emerald"
          tooltip="Grid power consumption adjusted for onsite solar generation"
        />

        <MetricCard
          title="Commute Transit (Scope 3)"
          value={transportEmissions.emissionsKg}
          unit="kg CO₂e"
          subtitle={`${totalFootprint.breakdown.transport.share.toFixed(1)}% of total footprint`}
          icon={Bus}
          color="teal"
          tooltip="Student & faculty passenger commute emissions"
        />

        <MetricCard
          title="Solid Waste (Scope 3)"
          value={wasteEmissions.totalEmissionsKg}
          unit="kg CO₂e"
          subtitle={`${totalFootprint.breakdown.waste.share.toFixed(1)}% of total footprint`}
          icon={Trash2}
          color="amber"
          tooltip="Municipal landfill disposal and recycling life-cycle impacts"
        />
      </div>

      {/* Highlight Card: Avoided Emissions & Net-Zero Target */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(20, 184, 166, 0.08) 100%)',
          border: '1px solid var(--border-bright)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <TrendingDown size={28} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>
              Simulated Mitigation Trajectory
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                -{scenarioResults.avoidedTotalKg.toLocaleString()} kg CO₂e Avoided
              </h3>
              <span className="badge badge-green">
                -{scenarioResults.percentageReduction.toFixed(1)}% vs Baseline
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Projected footprint: <strong>{scenarioResults.projectedTotalTonnes.toFixed(2)} tCO₂e</strong> through active scenario levers & rooftop solar.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('simulator')}
          className="btn btn-primary btn-sm"
          style={{ gap: '8px' }}
        >
          <span>Explore Decarbonization Levers</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Visualizations Section */}
      <div className="grid-cols-2" style={{ marginBottom: '24px' }}>
        {/* Doughnut Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Emissions Contribution Breakdown
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Category Share
            </span>
          </div>
          <EmissionsDonutChart
            breakdown={totalFootprint.breakdown}
            totalKg={totalFootprint.totalKg}
          />
        </div>

        {/* Comparative Bar Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Baseline vs Projected Emissions
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Avoidance Impact
            </span>
          </div>
          <BaselineVsProjectedBarChart scenarioResults={scenarioResults} />
        </div>
      </div>

      {/* Historical Trend Line Chart */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              12-Month Campus Carbon Emission History & Target Trajectory
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Monthly measured totals compared against Campus 2030 Climate Neutral Target path
            </p>
          </div>
          <span className="badge badge-teal">
            2023-2024 Audit
          </span>
        </div>
        <EmissionsTrendLineChart />
      </div>

      {/* Interactive Digital Twin Preview */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#34d399" />
              Live Interactive Smart Campus Digital Twin
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inspect physical facilities, rooftop solar irradiance, wind generation, and EV transit routes.
            </p>
          </div>
          <button
            onClick={() => onNavigate('twin')}
            className="btn btn-secondary btn-sm"
          >
            Open Full Digital Twin View
            <ArrowRight size={14} />
          </button>
        </div>

        <Campus3DViewer onSelectBuilding={onSelectBuilding} />
      </div>
    </div>
  );
}
