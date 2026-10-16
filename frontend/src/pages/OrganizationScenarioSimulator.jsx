import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../context/AuthContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';
import BeforeAfterVisualizer from '../components/simulator/BeforeAfterVisualizer';
import ScenarioSlider from '../components/simulator/ScenarioSlider';
import DecarbonizationImpactCard from '../components/simulator/DecarbonizationImpactCard';
import BaselineVsProjectedBarChart from '../components/charts/BaselineVsProjectedBarChart';
import InfoNotice from '../components/common/InfoNotice';
import { calculateEquivalents, calculateScenarioResults } from '../utils/calculations';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  Database,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sun,
  Trash2,
  Zap
} from 'lucide-react';

const EMPTY_LEVERS = {
  electricityReductionPct: 0,
  solarSharePct: 0,
  transportShiftPct: 0,
  wasteDiversionPct: 0
};

export default function OrganizationScenarioSimulator({ onNavigate }) {
  const {
    organizations,
    selectedOrganization,
    selectedOrganizationId,
    selectOrganization,
    status: organizationStatus,
    error: organizationError,
    refreshOrganizations
  } = useOrganizationSelection();
  const [reports, setReports] = useState([]);
  const [reportsStatus, setReportsStatus] = useState('loading');
  const [reportsError, setReportsError] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [loadedOrganizationId, setLoadedOrganizationId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [scenarioLevers, setScenarioLevers] = useState(EMPTY_LEVERS);

  const loadReports = useCallback(async signal => {
    if (!selectedOrganizationId) {
      setReports([]);
      setSelectedReportId('');
      setLoadedOrganizationId('');
      setReportsStatus('empty');
      setReportsError('');
      return;
    }
    setReportsStatus('loading');
    setReportsError('');
    try {
      const result = await apiRequest(`/api/organizations/${selectedOrganizationId}/reports`, { signal });
      setReports(result.reports);
      setSelectedReportId(currentId => (
        result.reports.some(report => report.id === currentId) ? currentId : result.reports[0]?.id || ''
      ));
      setLoadedOrganizationId(selectedOrganizationId);
      setReportsStatus(result.reports.length ? 'ready' : 'empty');
    } catch (error) {
      if (error.name !== 'AbortError') {
        setLoadedOrganizationId(selectedOrganizationId);
        setReportsError(error.message);
        setReportsStatus('error');
      }
    }
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (organizationStatus !== 'ready') {
      setReports([]);
      setSelectedReportId('');
      setLoadedOrganizationId('');
      setReportsStatus(organizationStatus === 'error' ? 'error' : 'loading');
      setReportsError('');
      return undefined;
    }
    if (!selectedOrganizationId) {
      setReports([]);
      setSelectedReportId('');
      setLoadedOrganizationId('');
      setReportsStatus('empty');
      setReportsError('');
      return undefined;
    }
    const controller = new AbortController();
    loadReports(controller.signal);
    return () => controller.abort();
  }, [organizationStatus, selectedOrganizationId, refreshKey, loadReports]);

  useEffect(() => {
    setScenarioLevers(EMPTY_LEVERS);
  }, [selectedOrganizationId, selectedReportId]);

  const reportStatus = loadedOrganizationId === selectedOrganizationId
    ? reportsStatus
    : selectedOrganizationId ? 'loading' : 'empty';
  const selectedReport = reports.find(report => report.id === selectedReportId) || null;
  const baseline = selectedReport ? {
    electricity: selectedReport.payload.electricityKg,
    transport: selectedReport.payload.transportKg,
    waste: selectedReport.payload.wasteKg
  } : null;
  const scenarioResults = useMemo(
    () => baseline ? calculateScenarioResults(baseline, scenarioLevers) : null,
    [baseline?.electricity, baseline?.transport, baseline?.waste, scenarioLevers]
  );
  const equivalents = useMemo(
    () => scenarioResults ? calculateEquivalents(scenarioResults.avoidedTotalKg) : null,
    [scenarioResults]
  );
  const updateLevers = partial => setScenarioLevers(current => ({ ...current, ...partial }));
  const resetScenario = () => setScenarioLevers(EMPTY_LEVERS);

  if (organizationStatus === 'loading') {
    return <div className="page-content"><div className="glass-card organization-loading" role="status">Loading authorised organisations…</div></div>;
  }
  if (organizationStatus === 'error') {
    return (
      <div className="page-content">
        <h1 className="page-header-title">Decarbonization Scenario Simulator</h1>
        <div className="workspace-error" role="alert"><AlertCircle size={15} />{organizationError}</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshOrganizations}>Try again</button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="workspace-page-heading">
        <div>
          <span className="workspace-eyebrow">SAVED REPORT SCENARIO</span>
          <h1 className="page-header-title">Decarbonization Scenario Simulator</h1>
          <p className="page-header-subtitle">Apply your own assumptions to a saved organisation report and inspect the calculated scenario.</p>
        </div>
        <button onClick={resetScenario} className="btn btn-secondary btn-sm" disabled={!selectedReport}>
          <RotateCcw size={14} /> Reset All Levers
        </button>
      </div>

      <InfoNotice
        title="User-defined mathematical scenario"
        message="The saved report provides the baseline only. All reduction percentages are your assumptions; results are simulations, not measured savings, forecasts, guaranteed outcomes, or engineering estimates."
        type="simulated"
      />

      <section className="glass-card dashboard-organization-bar">
        <label className="workspace-form-field">
          <span>Organisation</span>
          {organizations.length ? (
            <select className="form-input" aria-label="Scenario organisation" value={selectedOrganizationId} onChange={event => selectOrganization(event.target.value)}>
              {organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name} · {organization.role}</option>)}
            </select>
          ) : <span className="dashboard-no-organization">No organisation membership</span>}
        </label>
        {selectedOrganizationId && (
          <button className="btn btn-secondary btn-sm" disabled={reportStatus === 'loading'} onClick={() => setRefreshKey(key => key + 1)}>
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </section>

      {reportStatus === 'loading' && <section className="glass-card organization-loading" role="status">Loading saved reports for {selectedOrganization?.name || 'your organisation'}…</section>}
      {reportStatus === 'error' && (
        <section className="glass-card">
          <div className="workspace-error" role="alert"><AlertCircle size={15} />{reportsError || 'Could not load saved reports.'}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => setRefreshKey(key => key + 1)}>Try again</button>
        </section>
      )}
      {reportStatus === 'empty' && (
        <section className="glass-card analytics-empty-card">
          <div className="workspace-empty-icon"><Database size={24} /></div>
          <div>
            <h2>{selectedOrganizationId ? 'No saved baseline to simulate' : 'Create or join an organisation'}</h2>
            <p>{selectedOrganizationId
              ? 'Save a carbon report with real activity values from the organisation details page. The report becomes the scenario baseline.'
              : 'Select an organisation you belong to before loading saved carbon reports.'}</p>
            <button onClick={() => onNavigate('organizations')} className="btn btn-primary btn-sm">
              Open Organisations <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}
      {reportStatus === 'ready' && (
        <>
          <section className="glass-card organization-scope-bar simulator-report-picker">
            <label className="workspace-form-field">
              <span>Baseline report</span>
              <select className="form-input" aria-label="Scenario baseline report" value={selectedReportId} onChange={event => setSelectedReportId(event.target.value)}>
                {reports.map(report => <option key={report.id} value={report.id}>{report.title} · {report.reportingPeriod} · {new Date(report.createdAt).toLocaleDateString()}</option>)}
              </select>
            </label>
            {selectedReport && <span><ShieldCheck size={15} /> Saved by organisation member · {selectedReport.title}</span>}
          </section>

          {selectedReport && scenarioResults && (
            <>
              <BeforeAfterVisualizer scenarioResults={scenarioResults} onReset={resetScenario} />
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="var(--primary)" /> Your scenario assumptions
                </h3>
                <p className="workspace-section-copy" style={{ marginBottom: '14px' }}>
                  Baseline: {selectedReport.reportingPeriod} saved report “{selectedReport.title}”. Adjust the sliders to explore hypothetical values.
                </p>
                <div className="grid-cols-2" style={{ gap: '16px' }}>
                  <ScenarioSlider label="Electricity efficiency assumption" subtitle="Applied to saved electricity emissions" value={scenarioLevers.electricityReductionPct} onChange={value => updateLevers({ electricityReductionPct: value })} min={0} max={60} icon={Zap} color="var(--primary)" />
                  <ScenarioSlider label="Clean electricity share assumption" subtitle="Applied after the efficiency assumption" value={scenarioLevers.solarSharePct} onChange={value => updateLevers({ solarSharePct: value })} min={0} max={100} icon={Sun} color="var(--sky)" />
                  <ScenarioSlider label="Transport activity reduction assumption" subtitle="Applied to saved transport emissions" value={scenarioLevers.transportShiftPct} onChange={value => updateLevers({ transportShiftPct: value })} min={0} max={80} icon={Bus} color="var(--teal)" />
                  <ScenarioSlider label="Waste emissions reduction assumption" subtitle="Applied to saved waste emissions" value={scenarioLevers.wasteDiversionPct} onChange={value => updateLevers({ wasteDiversionPct: value })} min={0} max={90} icon={Trash2} color="var(--amber)" />
                </div>
              </div>
              <section className="glass-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Category comparison</h3>
                <p className="workspace-section-copy" style={{ marginBottom: '14px' }}>Saved report baseline compared with your current slider assumptions. Values are modelled, not observed.</p>
                <BaselineVsProjectedBarChart scenarioResults={scenarioResults} />
              </section>
              <DecarbonizationImpactCard equivalents={equivalents} />
              <p className="workspace-footnote simulator-assumption-footnote">
                Illustrative equivalencies are mathematical comparisons derived from the simulated difference using fixed equivalency factors. They do not indicate actual trees planted, travel removed, or fuel saved.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
