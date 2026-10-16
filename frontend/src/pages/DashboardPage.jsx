import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { apiRequest, useAuth } from '../context/AuthContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';
import MetricCard from '../components/common/MetricCard';
import InfoNotice from '../components/common/InfoNotice';
import EmissionsDonutChart from '../components/charts/EmissionsDonutChart';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  Building2,
  CalendarDays,
  ClipboardList,
  Database,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Zap
} from 'lucide-react';

function PageHeading({ reportingPeriod, subtitle = 'Review your saved carbon reports, buildings, and sustainability actions.', onNavigate }) {
  return (
    <div className="dashboard-heading">
      <div>
        <div className="dashboard-title-line">
          <h1 className="page-header-title">Carbon Emissions Dashboard</h1>
          {reportingPeriod && <span className="badge badge-green">{reportingPeriod.toUpperCase()} REPORT</span>}
        </div>
        <p className="page-header-subtitle">{subtitle}</p>
      </div>
      <button onClick={() => onNavigate('calculator')} className="btn btn-primary btn-sm">
        <ClipboardList size={15} /> Enter activity data
      </button>
    </div>
  );
}

function LocalInputDashboard({ onNavigate }) {
  const {
    reportingPeriod,
    dataCompleteness,
    hasCompleteFootprint,
    electricityEmissions,
    transportEmissions,
    wasteEmissions,
    totalFootprint,
    scenarioResults
  } = useCarbon();

  const completeCategories = Object.values(dataCompleteness).filter(Boolean).length;

  return (
    <div className="page-content">
      <PageHeading
        reportingPeriod={reportingPeriod}
        subtitle="Enter activity data to calculate your estimated carbon footprint."
        onNavigate={onNavigate}
      />
      <InfoNotice
        title="Calculation basis"
        message="Emissions are estimates calculated from user-provided activity and documented emission factors. They are not live meter readings or independently verified measurements."
        type="verified"
      />

      {!hasCompleteFootprint ? (
        <section className="glass-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <ClipboardList size={22} color="var(--primary)" />
            <div>
              <h2 style={{ fontSize: '1.05rem' }}>No complete footprint entered yet</h2>
              <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Complete each section with your own records. Categories entered: {completeCategories} of 3.
              </p>
            </div>
          </div>
          <div className="grid-cols-3">
            {[
              ['Electricity', dataCompleteness.electricity, Zap],
              ['Commuting', dataCompleteness.transport, Bus],
              ['Waste', dataCompleteness.waste, Trash2]
            ].map(([label, complete, Icon]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '13px', borderRadius: '10px', background: 'var(--bg-card-muted)', border: '1px solid var(--border-subtle)' }}>
                <Icon size={17} color={complete ? 'var(--primary)' : 'var(--text-dim)'} />
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>{label}</strong>
                <span style={{ marginLeft: 'auto', color: complete ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.72rem' }}>
                  {complete ? 'Entered' : 'Not entered'}
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('calculator')} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>
            Open emissions calculator <ArrowRight size={14} />
          </button>
        </section>
      ) : (
        <>
          <div className="grid-cols-4" style={{ marginBottom: '24px' }}>
            <MetricCard
              title="Total Estimated Emissions"
              value={totalFootprint.totalKg}
              unit="kg CO₂e"
              subtitle={`${totalFootprint.totalTonnes.toFixed(2)} metric tonnes`}
              icon={Leaf}
              color="emerald"
            />
            <MetricCard
              title="Electricity"
              value={electricityEmissions.netEmissions}
              unit="kg CO₂e"
              subtitle={`${totalFootprint.breakdown.electricity.share.toFixed(1)}% of entered footprint`}
              icon={Zap}
              color="emerald"
            />
            <MetricCard
              title="Commuting"
              value={transportEmissions.emissionsKg}
              unit="kg CO₂e"
              subtitle={`${totalFootprint.breakdown.transport.share.toFixed(1)}% of entered footprint`}
              icon={Bus}
              color="teal"
            />
            <MetricCard
              title="Waste"
              value={wasteEmissions.totalEmissionsKg}
              unit="kg CO₂e"
              subtitle={`${totalFootprint.breakdown.waste.share.toFixed(1)}% of entered footprint`}
              icon={Trash2}
              color="amber"
            />
          </div>

          <section className="glass-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span className="badge badge-green">User-defined scenario estimate</span>
              <h2 style={{ marginTop: '8px', fontSize: '1.2rem' }}>
                {Math.round(scenarioResults.avoidedTotalKg).toLocaleString()} kg CO₂e estimated avoided
              </h2>
              <p style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Projected emissions: {scenarioResults.projectedTotalTonnes.toFixed(2)} tCO₂e · {scenarioResults.percentageReduction.toFixed(1)}% reduction from the entered baseline
              </p>
            </div>
            <button onClick={() => onNavigate('simulator')} className="btn btn-primary btn-sm">
              <ArrowRight size={14} /> Adjust scenario
            </button>
          </section>

          <div className="grid-cols-2">
            <section className="glass-card">
              <h2 style={{ fontSize: '1rem', marginBottom: '8px' }}>Entered emissions breakdown</h2>
              <EmissionsDonutChart breakdown={totalFootprint.breakdown} totalKg={totalFootprint.totalKg} />
            </section>
            <section className="glass-card">
              <h2 style={{ fontSize: '1rem', marginBottom: '8px' }}>Baseline and scenario estimate</h2>
              <p className="workspace-section-copy">Scenario projections are based on the current calculator inputs and user-selected assumptions.</p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function calculateReportTotals(report) {
  const electricity = report.payload.electricityKg;
  const transport = report.payload.transportKg;
  const waste = report.payload.wasteKg;
  const total = electricity + transport + waste;
  const share = value => total > 0 ? (value / total) * 100 : 0;
  return {
    total,
    breakdown: {
      electricity: { kg: electricity, share: share(electricity) },
      transport: { kg: transport, share: share(transport) },
      waste: { kg: waste, share: share(waste) }
    }
  };
}

function ReportHistory({ reports, selectedReportId, onSelect }) {
  return (
    <section className="glass-card dashboard-report-history">
      <div className="dashboard-section-heading">
        <div>
          <h2 className="workspace-card-title"><CalendarDays size={18} /> Saved report history</h2>
          <p className="workspace-section-copy">Only report snapshots saved to this organisation are shown.</p>
        </div>
        <span className="workspace-count">{reports.length}</span>
      </div>
      <div className="dashboard-report-list">
        {reports.map(report => {
          const totals = calculateReportTotals(report);
          const selected = selectedReportId === report.id;
          return (
            <button
              type="button"
              key={report.id}
              className={`dashboard-report-row${selected ? ' selected' : ''}`}
              onClick={() => onSelect(report.id)}
              aria-pressed={selected}
            >
              <span className="dashboard-report-copy">
                <strong>{report.title}</strong>
                <small>{report.reportingPeriod} · {new Date(report.createdAt).toLocaleDateString()}</small>
                <small className="dashboard-report-categories">
                  Electricity {report.payload.electricityKg.toLocaleString()} · Transport {report.payload.transportKg.toLocaleString()} · Waste {report.payload.wasteKg.toLocaleString()} kg CO₂e
                </small>
              </span>
              <span className="dashboard-report-total">{totals.total.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function currentDateOnly() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function OrganizationRecords({ buildings, actions }) {
  const today = currentDateOnly();
  const activeActions = actions.filter(action => action.status !== 'Completed');
  const completedActions = actions.length - activeActions.length;

  return (
    <>
      <section className="dashboard-record-summary" aria-label="Organisation record totals">
        <div className="dashboard-record-stat">
          <Building2 size={18} />
          <span><strong>{buildings.length}</strong><small>Buildings</small></span>
        </div>
        <div className="dashboard-record-stat">
          <ClipboardList size={18} />
          <span><strong>{actions.length}</strong><small>Tracked actions</small></span>
        </div>
        <div className="dashboard-record-stat">
          <ShieldCheck size={18} />
          <span><strong>{activeActions.length}</strong><small>Open actions</small></span>
        </div>
        <div className="dashboard-record-stat">
          <Leaf size={18} />
          <span><strong>{completedActions}</strong><small>Completed actions</small></span>
        </div>
      </section>

      <div className="grid-cols-2 dashboard-organization-records">
        <section className="glass-card dashboard-record-list-card">
          <div className="dashboard-section-heading">
            <div>
              <h2 className="workspace-card-title"><Building2 size={18} /> Organisation buildings</h2>
              <p className="workspace-section-copy">Persisted building records in the selected organisation.</p>
            </div>
            <span className="workspace-count">{buildings.length}</span>
          </div>
          {buildings.length ? (
            <div className="dashboard-building-list">
              {buildings.map(building => (
                <div className="dashboard-building-row" key={building.id}>
                  <span className="dashboard-building-icon"><Building2 size={16} /></span>
                  <span className="dashboard-building-copy">
                    <strong>{building.name}</strong>
                    <small>{[building.type, building.address].filter(Boolean).join(' · ') || 'No type or address recorded'}</small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="dashboard-record-empty">No buildings have been saved to this organisation.</p>
          )}
        </section>

        <section className="glass-card dashboard-record-list-card">
          <div className="dashboard-section-heading">
            <div>
              <h2 className="workspace-card-title"><ClipboardList size={18} /> Sustainability actions</h2>
              <p className="workspace-section-copy">Current saved actions and progress for this organisation.</p>
            </div>
            <span className="workspace-count">{actions.length}</span>
          </div>
          {actions.length ? (
            <div className="dashboard-action-list">
              {actions.map(action => {
                const overdue = action.status !== 'Completed' && action.dueDate && action.dueDate < today;
                const status = overdue ? 'Overdue' : action.status;
                return (
                  <div className="dashboard-action-row" key={action.id}>
                    <div className="dashboard-action-topline">
                      <strong>{action.name}</strong>
                      <span className={`dashboard-action-status ${status.toLowerCase().replaceAll(' ', '-')}`}>{status}</span>
                    </div>
                    <div className="dashboard-action-meta">
                      <span>{action.owner ? `Owner: ${action.owner}` : 'No owner assigned'}</span>
                      <span>{action.dueDate ? `Due ${action.dueDate}` : 'No due date'}</span>
                    </div>
                    <div className="dashboard-action-progress" role="progressbar" aria-label={`Progress for ${action.name}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={action.progress}>
                      <span style={{ width: `${action.progress}%` }} />
                    </div>
                    <small className="dashboard-action-progress-label">{action.progress}% complete</small>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="dashboard-record-empty">No actions have been saved to this organisation.</p>
          )}
        </section>
      </div>
    </>
  );
}

function OrganizationReportsDashboard({ onNavigate }) {
  const { user, status: authStatus, refreshSession } = useAuth();
  const {
    organizations,
    selectedOrganization,
    selectedOrganizationId,
    selectOrganization,
    status: organizationStatus,
    error: organizationError,
    refreshOrganizations
  } = useOrganizationSelection();
  const [records, setRecords] = useState({ reports: [], buildings: [], actions: [] });
  const [recordsOrganizationId, setRecordsOrganizationId] = useState('');
  const [recordsStatus, setRecordsStatus] = useState('loading');
  const [recordsError, setRecordsError] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOrganizationData = useCallback(async signal => {
    if (!selectedOrganizationId) {
      setRecords({ reports: [], buildings: [], actions: [] });
      setRecordsStatus('empty');
      setRecordsError('');
      return;
    }
    setRecordsStatus('loading');
    setRecordsError('');
    try {
      const [reportResult, buildingResult, actionResult] = await Promise.all([
        apiRequest(`/api/organizations/${selectedOrganizationId}/reports`, { signal }),
        apiRequest(`/api/organizations/${selectedOrganizationId}/buildings`, { signal }),
        apiRequest(`/api/organizations/${selectedOrganizationId}/actions`, { signal })
      ]);
      const nextRecords = {
        reports: reportResult.reports,
        buildings: buildingResult.buildings,
        actions: actionResult.actions
      };
      setRecords(nextRecords);
      setRecordsOrganizationId(selectedOrganizationId);
      setSelectedReportId(currentId => (
        nextRecords.reports.some(report => report.id === currentId) ? currentId : nextRecords.reports[0]?.id || ''
      ));
      setRecordsStatus('ready');
    } catch (error) {
      if (error.name !== 'AbortError') {
        setRecordsOrganizationId(selectedOrganizationId);
        setRecordsError(error.message);
        setRecordsStatus('error');
      }
    }
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (authStatus !== 'authenticated' || organizationStatus !== 'ready') {
      setRecords({ reports: [], buildings: [], actions: [] });
      setRecordsOrganizationId('');
      setRecordsStatus(authStatus === 'unavailable' || organizationStatus === 'error' ? 'error' : 'loading');
      setRecordsError('');
      return undefined;
    }
    if (!selectedOrganizationId) {
      setRecords({ reports: [], buildings: [], actions: [] });
      setRecordsOrganizationId('');
      setRecordsStatus('empty');
      setRecordsError('');
      return undefined;
    }
    const controller = new AbortController();
    loadOrganizationData(controller.signal);
    return () => controller.abort();
  }, [authStatus, organizationStatus, selectedOrganizationId, refreshKey, loadOrganizationData]);

  const { reports, buildings, actions } = records;
  const currentRecordsStatus = recordsOrganizationId === selectedOrganizationId
    ? recordsStatus
    : selectedOrganizationId ? 'loading' : 'empty';
  const selectedReport = reports.find(report => report.id === selectedReportId) || reports[0] || null;
  const selectedTotals = useMemo(() => selectedReport ? calculateReportTotals(selectedReport) : null, [selectedReport]);

  if (authStatus === 'loading' || organizationStatus === 'loading') {
    return <div className="page-content"><div className="glass-card organization-loading" role="status">Loading your organisation dashboard…</div></div>;
  }
  if (authStatus === 'unavailable') {
    return (
      <div className="page-content">
        <PageHeading onNavigate={onNavigate} />
        <div className="workspace-error" role="alert"><AlertCircle size={15} />The account service is unavailable. No organisation dashboard data was loaded.</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshSession}>Try again</button>
      </div>
    );
  }
  if (organizationStatus === 'error') {
    return (
      <div className="page-content">
        <PageHeading onNavigate={onNavigate} />
        <div className="workspace-error" role="alert"><AlertCircle size={15} />{organizationError}</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshOrganizations}>Try again</button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <PageHeading reportingPeriod={selectedReport?.reportingPeriod} onNavigate={onNavigate} />
      <InfoNotice
        title="Saved organisation data"
        message="Buildings, actions, and carbon reports below are loaded from the selected organisation. Emissions are calculated estimates from saved user-entered activity, not live measurements or independently verified values."
        type="verified"
      />

      <section className="glass-card dashboard-organization-bar">
        <label className="workspace-form-field">
          <span>Organisation data</span>
          {organizations.length ? (
            <select className="form-input" aria-label="Dashboard organisation" value={selectedOrganizationId} onChange={event => selectOrganization(event.target.value)}>
              {organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name} · {organization.role}</option>)}
            </select>
          ) : (
            <span className="dashboard-no-organization">No organisation membership</span>
          )}
        </label>
        <span className="dashboard-data-source"><ShieldCheck size={15} /> Private to {selectedOrganization?.name || user?.email || 'your account'}</span>
        {selectedOrganizationId && (
          <button className="btn btn-secondary btn-sm" disabled={currentRecordsStatus === 'loading'} onClick={() => setRefreshKey(key => key + 1)}>
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </section>

      {currentRecordsStatus === 'loading' && <section className="glass-card organization-loading" role="status">Loading your saved organisation records…</section>}
      {currentRecordsStatus === 'error' && (
        <section className="glass-card">
          <div className="workspace-error" role="alert"><AlertCircle size={15} />{recordsError || 'Could not load organisation records.'}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => setRefreshKey(key => key + 1)}>Try again</button>
        </section>
      )}
      {currentRecordsStatus === 'empty' && (
        <section className="glass-card dashboard-no-reports">
          <span className="workspace-empty-icon"><Building2 size={22} /></span>
          <h2>No organisation membership yet</h2>
          <p>Create an organisation or join one to view its persisted buildings, sustainability actions, and carbon reports here.</p>
          <div className="dashboard-empty-actions">
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('organizations')}>Open Organisations <ArrowRight size={14} /></button>
          </div>
        </section>
      )}
      {currentRecordsStatus === 'ready' && !reports.length && (
        <section className="glass-card dashboard-no-reports">
          <span className="workspace-empty-icon"><Database size={22} /></span>
          <h2>No saved carbon reports yet</h2>
          <p>Enter activity data, then open this organisation and choose “Save current calculation” under Carbon reports. The dashboard will show the saved report here.</p>
          <div className="dashboard-empty-actions">
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('calculator')}>Enter activity data <ArrowRight size={14} /></button>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('organizations')}>Open organisation details</button>
          </div>
        </section>
      )}
      {currentRecordsStatus === 'ready' && selectedReport && selectedTotals && (
        <>
          <div className="dashboard-report-caption">
            <Database size={14} />
            <span>Showing saved report: <strong>{selectedReport.title}</strong> · {new Date(selectedReport.createdAt).toLocaleString()}</span>
          </div>
          <div className="grid-cols-4 dashboard-report-metrics">
            <MetricCard
              title="Total Reported Emissions"
              value={selectedTotals.total}
              unit="kg CO₂e"
              subtitle={`${(selectedTotals.total / 1000).toFixed(2)} metric tonnes · ${selectedReport.reportingPeriod}`}
              icon={Leaf}
              color="emerald"
              decimals={1}
            />
            <MetricCard
              title="Electricity"
              value={selectedReport.payload.electricityKg}
              unit="kg CO₂e"
              subtitle={`${selectedTotals.breakdown.electricity.share.toFixed(1)}% of saved report`}
              icon={Zap}
              color="emerald"
              decimals={1}
            />
            <MetricCard
              title="Commuting"
              value={selectedReport.payload.transportKg}
              unit="kg CO₂e"
              subtitle={`${selectedTotals.breakdown.transport.share.toFixed(1)}% of saved report`}
              icon={Bus}
              color="teal"
              decimals={1}
            />
            <MetricCard
              title="Waste"
              value={selectedReport.payload.wasteKg}
              unit="kg CO₂e"
              subtitle={`${selectedTotals.breakdown.waste.share.toFixed(1)}% of saved report`}
              icon={Trash2}
              color="amber"
              decimals={1}
            />
          </div>

          <div className="grid-cols-2 dashboard-report-visuals">
            <section className="glass-card">
              <h2 className="dashboard-visual-title">Saved report breakdown</h2>
              <EmissionsDonutChart breakdown={selectedTotals.breakdown} totalKg={selectedTotals.total} />
            </section>
            <ReportHistory reports={reports} selectedReportId={selectedReport.id} onSelect={setSelectedReportId} />
          </div>
          <div className="dashboard-report-footnote">
            <ShieldCheck size={15} />
            <span>Report totals are derived from the saved electricity, transport, and waste categories. No missing category is filled with sample data.</span>
          </div>
        </>
      )}
      {currentRecordsStatus === 'ready' && <OrganizationRecords buildings={buildings} actions={actions} />}
    </div>
  );
}

export default function DashboardPage({ onNavigate }) {
  const { status } = useAuth();
  if (status === 'unauthenticated') return <LocalInputDashboard onNavigate={onNavigate} />;
  return <OrganizationReportsDashboard onNavigate={onNavigate} />;
}
