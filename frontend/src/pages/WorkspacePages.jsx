import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  LockKeyhole,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  X,
  Settings,
  Trash2
} from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import { apiRequest, useAuth } from '../context/AuthContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';
import MetricCard from '../components/common/MetricCard';
import OrganizationsPage from './OrganizationsPage';
import { OrganizationActionTrackerPage, OrganizationBuildingsPage } from './OrganizationWorkspacePages';
import MethodologyPage from './MethodologyPage';

function useBrowserRecords(storageKey) {
  const [records, setRecords] = useState([]);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    try {
      const serialized = localStorage.getItem(storageKey);
      if (!serialized) return;
      const parsed = JSON.parse(serialized);
      if (!Array.isArray(parsed)) throw new Error('Stored data is not a list.');
      setRecords(parsed);
    } catch (error) {
      setStorageError(`Could not read saved browser data: ${error.message}`);
    }
  }, [storageKey]);

  const saveRecords = (nextRecords) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextRecords));
      setRecords(nextRecords);
      setStorageError('');
    } catch (error) {
      setStorageError(`Could not save browser data: ${error.message}`);
    }
  };

  return { records, saveRecords, storageError };
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="workspace-page-heading">
      <div>
        {eyebrow && <span className="workspace-eyebrow">{eyebrow}</span>}
        <h1 className="page-header-title">{title}</h1>
        <p className="page-header-subtitle">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StorageNotice({ children }) {
  return (
    <p className="workspace-storage-notice">
      <Database size={14} />
      {children}
    </p>
  );
}

function StorageError({ message }) {
  if (!message) return null;
  return (
    <div className="workspace-error" role="alert">
      <AlertCircle size={16} />
      {message}
    </div>
  );
}

function LocalBuildingsPage({ onNavigate }) {
  const { records, saveRecords, storageError } = useBrowserRecords('carbonvision_buildings');
  const [name, setName] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const visibleRecords = records.filter(record => (
    `${record.name} ${record.type || ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  ));

  const addBuilding = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter a building name.');
      return;
    }
    if (records.some(record => record.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('A building with that name is already in this browser workspace.');
      return;
    }
    saveRecords([{ id: crypto.randomUUID(), name: trimmedName, type: buildingType.trim() }, ...records]);
    setName('');
    setBuildingType('');
    setError('');
  };

  const removeBuilding = (id) => {
    saveRecords(records.filter(record => record.id !== id));
  };

  return (
    <div className="page-content workspace-page">
      <PageHeading
        eyebrow="FACILITY RECORDS"
        title="Buildings"
        description="Create a local building record to organise your own uploaded photos and facility work."
        action={<span className="workspace-capability-badge"><Database size={14} /> {records.length} local {records.length === 1 ? 'building' : 'buildings'}</span>}
      />
      <StorageNotice>Building names are saved only in this browser. They are not uploaded or shared.</StorageNotice>
      <section className="glass-card building-create-card">
        <div>
          <h2 className="workspace-card-title"><Plus size={18} /> Add a building</h2>
          <p className="workspace-section-copy">Add a name and optional type. These details stay on this device.</p>
        </div>
        <form onSubmit={addBuilding} className="building-create-form">
          <label className="workspace-form-field">
            <span>Building name</span>
            <input className="form-input" value={name} onChange={event => setName(event.target.value)} maxLength={100} placeholder="e.g. Main office" required />
          </label>
          <label className="workspace-form-field">
            <span>Building type <small>optional</small></span>
            <input className="form-input" value={buildingType} onChange={event => setBuildingType(event.target.value)} maxLength={80} placeholder="e.g. Office, laboratory, residential" />
          </label>
          <button type="submit" className="btn btn-primary btn-sm"><Plus size={15} /> Add building</button>
        </form>
        {error && <p className="workspace-error" role="alert"><AlertCircle size={15} />{error}</p>}
        <StorageError message={storageError} />
      </section>

      <section className="glass-card building-list-card">
        <div className="building-list-heading">
          <div>
            <h2 className="workspace-card-title"><Building2 size={18} /> Your buildings <span className="workspace-count">{records.length}</span></h2>
            <p className="workspace-section-copy">Local facility records. No emissions data is inferred from building names or types.</p>
          </div>
          {records.length > 0 && (
            <label className="building-search">
              <Search size={15} />
              <input
                aria-label="Search buildings"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search buildings"
              />
              {searchQuery && <button type="button" aria-label="Clear building search" onClick={() => setSearchQuery('')}><X size={14} /></button>}
            </label>
          )}
        </div>
        {records.length === 0 ? (
          <div className="building-empty-state">
            <span className="workspace-empty-icon"><Building2 size={22} /></span>
            <strong>No buildings added yet</strong>
            <span>Add a local record above, or open Sustainability Studio to review a building photo and enter its electricity data.</span>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('image-impact')}>Open Sustainability Studio <ArrowRight size={14} /></button>
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="workspace-inline-empty">No buildings match “{searchQuery}”. Try a different name or type.</div>
        ) : (
          <div className="workspace-record-list">
            {visibleRecords.map(record => (
              <div className="workspace-record-row" key={record.id}>
                <span className="workspace-record-icon"><Building2 size={17} /></span>
                <div className="workspace-record-copy">
                  <strong>{record.name}</strong>
                  <span>{record.type || 'Type not specified'}</span>
                </div>
                <span className="building-record-scope">Local record</span>
                <button className="icon-button danger" onClick={() => removeBuilding(record.id)} aria-label={`Remove ${record.name}`} title="Remove building">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LocalAnalyticsPage({ onNavigate }) {
  const { hasCompleteFootprint, totalFootprint, dataCompleteness, reportingPeriod } = useCarbon();
  const enteredCategories = Object.values(dataCompleteness).filter(Boolean).length;
  const categories = [
    { id: 'electricity', label: 'Electricity', detail: 'Purchased grid electricity', color: '#087f5b' },
    { id: 'transport', label: 'Transport', detail: 'Recorded commuter activity', color: '#15966c' },
    { id: 'waste', label: 'Waste', detail: 'Entered waste streams', color: '#b86e12' }
  ];

  return (
    <div className="page-content workspace-page">
      <PageHeading
        eyebrow="ACTIVITY ANALYTICS"
        title="Analytics"
        description="Breakdown of the emissions calculated from your entered activity for the selected reporting period."
        action={<span className="workspace-capability-badge">{hasCompleteFootprint ? `${reportingPeriod[0].toUpperCase()}${reportingPeriod.slice(1)} · entered data` : `${enteredCategories} of 3 categories complete`}</span>}
      />
      {!hasCompleteFootprint ? (
        <>
          <section className="glass-card analytics-empty-card">
            <div className="workspace-empty-icon"><BarChart3 size={24} /></div>
            <div>
              <span className="workspace-eyebrow">NO COMPLETE DATASET</span>
              <h2>Finish entering activity data to see a breakdown</h2>
              <p>Combined analytics appear when electricity, commuting, and waste inputs are complete. Use 0 where you have confirmed no activity for a category.</p>
              <button onClick={() => onNavigate('calculator')} className="btn btn-primary btn-sm">Enter activity data <ArrowRight size={14} /></button>
            </div>
          </section>
          <section className="glass-card analytics-completeness-card">
            <h2 className="workspace-card-title"><Activity size={18} /> Dataset completeness</h2>
            <div className="analytics-completeness-list">
              {categories.map(category => (
                <div className="analytics-completeness-row" key={category.id}>
                  <span className={`analytics-completeness-indicator${dataCompleteness[category.id] ? ' is-complete' : ''}`} />
                  <span>{category.label}</span>
                  <strong>{dataCompleteness[category.id] ? 'Complete' : 'Needs input'}</strong>
                </div>
              ))}
            </div>
            <p className="workspace-footnote">No missing category is treated as zero in the combined report.</p>
          </section>
        </>
      ) : (
        <>
          <section className="glass-card analytics-summary-card">
            <div className="analytics-summary-copy">
              <span className="workspace-eyebrow">CALCULATED FOOTPRINT</span>
              <h2>Total estimated emissions</h2>
              <p>Calculated from the activity data and emission factors currently entered.</p>
            </div>
            <div className="analytics-summary-total">
              <strong>{totalFootprint.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
              <span>kg CO₂e</span>
              <small>{totalFootprint.totalTonnes.toFixed(2)} tCO₂e · {reportingPeriod} period</small>
            </div>
          </section>

          <section className="glass-card analytics-breakdown-card">
            <div className="analytics-breakdown-heading">
              <div>
                <h2 className="workspace-card-title"><Activity size={18} /> Category breakdown</h2>
                <p className="workspace-section-copy">Share of calculated emissions for the selected period.</p>
              </div>
              <span className="workspace-capability-badge">Activity-based estimate</span>
            </div>
            <div className="analytics-category-list">
              {categories.map(category => {
                const value = totalFootprint.breakdown[category.id];
                return (
                  <article className="analytics-category-row" key={category.id}>
                    <span className="analytics-category-marker" style={{ background: category.color }} />
                    <div className="analytics-category-main">
                      <div className="analytics-category-heading">
                        <div><strong>{category.label}</strong><span>{category.detail}</span></div>
                        <div className="analytics-category-value">
                          <strong>{value.kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</strong>
                          <span>{value.share.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="workspace-chart-track">
                        <span style={{ width: `${Math.min(100, Math.max(0, value.share))}%`, background: category.color }} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="workspace-footnote">No historical trend is available: dated activity history is not stored by this browser calculator.</p>
          </section>
        </>
      )}
    </div>
  );
}

function reportTotals(report) {
  const electricity = report.payload.electricityKg;
  const transport = report.payload.transportKg;
  const waste = report.payload.wasteKg;
  const totalKg = electricity + transport + waste;
  const share = value => totalKg > 0 ? value / totalKg * 100 : 0;
  return {
    totalKg,
    categories: [
      { id: 'electricity', label: 'Electricity', detail: 'Saved electricity-related emissions', kg: electricity, share: share(electricity), color: '#087f5b' },
      { id: 'transport', label: 'Transport', detail: 'Saved transport-related emissions', kg: transport, share: share(transport), color: '#15966c' },
      { id: 'waste', label: 'Waste', detail: 'Saved waste-related emissions', kg: waste, share: share(waste), color: '#b86e12' }
    ]
  };
}

function downloadReportFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) {
  const text = String(value ?? '');
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
}

function OrganizationAnalyticsPage() {
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedOrganizationId, setLoadedOrganizationId] = useState('');

  const loadReports = useCallback(async signal => {
    if (!selectedOrganizationId) {
      setReports([]);
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
      setLoadedOrganizationId('');
      setReportsStatus(organizationStatus === 'error' ? 'error' : 'loading');
      return undefined;
    }
    if (!selectedOrganizationId) {
      setReports([]);
      setLoadedOrganizationId('');
      setReportsStatus('empty');
      setReportsError('');
      return undefined;
    }
    const controller = new AbortController();
    loadReports(controller.signal);
    return () => controller.abort();
  }, [organizationStatus, selectedOrganizationId, refreshKey, loadReports]);

  const visibleStatus = loadedOrganizationId === selectedOrganizationId
    ? reportsStatus
    : selectedOrganizationId ? 'loading' : 'empty';
  const selectedReport = reports.find(report => report.id === selectedReportId) || reports[0] || null;
  const selectedTotals = useMemo(() => selectedReport ? reportTotals(selectedReport) : null, [selectedReport]);
  const exportRows = reports.map(report => ({
    title: report.title,
    reportingPeriod: report.reportingPeriod,
    savedAt: report.createdAt,
    electricityKg: report.payload.electricityKg,
    transportKg: report.payload.transportKg,
    wasteKg: report.payload.wasteKg,
    totalKg: reportTotals(report).totalKg
  }));
  const fileOrganizationName = (selectedOrganization?.name || 'organisation')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'organisation';
  const exportCsv = () => {
    const columns = ['title', 'reportingPeriod', 'savedAt', 'electricityKg', 'transportKg', 'wasteKg', 'totalKg'];
    const csv = [columns.join(','), ...exportRows.map(row => columns.map(column => csvCell(row[column])).join(','))].join('\r\n');
    downloadReportFile(`carbon-reports-${fileOrganizationName}.csv`, `\uFEFF${csv}`, 'text/csv;charset=utf-8');
  };
  const exportJson = () => {
    downloadReportFile(`carbon-reports-${fileOrganizationName}.json`, JSON.stringify({
      organization: selectedOrganization.name,
      exportedAt: new Date().toISOString(),
      scope: 'Saved category emissions only. Activity inputs, emission-factor selections, and source documents are not stored with these reports.',
      reports: exportRows
    }, null, 2), 'application/json;charset=utf-8');
  };

  if (organizationStatus === 'loading') {
    return <div className="page-content workspace-page"><div className="glass-card organization-loading" role="status">Loading authorised organisations…</div></div>;
  }
  if (organizationStatus === 'error') {
    return (
      <div className="page-content workspace-page">
        <PageHeading eyebrow="ACTIVITY ANALYTICS" title="Analytics" description="Review saved report history and category breakdowns." />
        <div className="workspace-error" role="alert"><AlertCircle size={15} />{organizationError}</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshOrganizations}>Try again</button>
      </div>
    );
  }

  return (
    <div className="page-content workspace-page">
      <PageHeading
        eyebrow="SAVED REPORT ANALYTICS"
        title="Analytics"
        description="Explore category totals and saved report snapshots for an organisation you can access."
        action={selectedOrganization && <span className="workspace-capability-badge">{selectedOrganization.name} · {reports.length} saved reports</span>}
      />
      <section className="glass-card dashboard-organization-bar">
        <label className="workspace-form-field">
          <span>Organisation</span>
          {organizations.length ? (
            <select className="form-input" aria-label="Analytics organisation" value={selectedOrganizationId} onChange={event => selectOrganization(event.target.value)}>
              {organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name} · {organization.role}</option>)}
            </select>
          ) : <span className="dashboard-no-organization">No organisation membership</span>}
        </label>
        <span className="dashboard-data-source"><ShieldCheck size={15} /> Membership-checked saved reports</span>
        {selectedOrganizationId && (
          <button className="btn btn-secondary btn-sm" disabled={visibleStatus === 'loading'} onClick={() => setRefreshKey(key => key + 1)}>
            <RefreshCw size={14} /> Refresh
          </button>
        )}
        {visibleStatus === 'ready' && (
          <div className="analytics-export-actions">
            <button className="btn btn-secondary btn-sm" onClick={exportCsv}>Export CSV</button>
            <button className="btn btn-secondary btn-sm" onClick={exportJson}>Export JSON</button>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>Print / Save PDF</button>
          </div>
        )}
      </section>

      <StorageNotice>Analytics use saved user-entered report snapshots only. Exports include saved category totals and report metadata; activity inputs, emission-factor selections, and source documents are not stored. Historical changes are not interpolated or presented as measured trends.</StorageNotice>
      {visibleStatus === 'loading' && <section className="glass-card organization-loading" role="status">Loading saved report analytics…</section>}
      {visibleStatus === 'error' && (
        <section className="glass-card">
          <div className="workspace-error" role="alert"><AlertCircle size={15} />{reportsError || 'Could not load saved report analytics.'}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => setRefreshKey(key => key + 1)}>Try again</button>
        </section>
      )}
      {visibleStatus === 'empty' && (
        <section className="glass-card analytics-empty-card">
          <div className="workspace-empty-icon"><BarChart3 size={24} /></div>
          <div>
            <span className="workspace-eyebrow">{selectedOrganizationId ? 'NO SAVED REPORTS' : 'NO ORGANISATION SELECTED'}</span>
            <h2>{selectedOrganizationId ? 'There is no report history yet' : 'Create or join an organisation'}</h2>
            <p>{selectedOrganizationId
              ? 'Add real activity data and save a carbon report from the organisation details page. Analytics will show its values and history here.'
              : 'Organisation analytics are private. Join or create an organisation to view its saved reports.'}</p>
          </div>
        </section>
      )}
      {visibleStatus === 'ready' && selectedReport && selectedTotals && (
        <>
          <div className="grid-cols-2 analytics-report-summary">
            <MetricCard
              title="Latest saved report"
              value={selectedTotals.totalKg}
              unit="kg CO₂e"
              subtitle={`${selectedReport.reportingPeriod} · ${selectedReport.title}`}
              icon={BarChart3}
              color="emerald"
              decimals={1}
            />
            <MetricCard
              title="Saved report snapshots"
              value={reports.length}
              subtitle={`Available to ${selectedOrganization?.name || 'this organisation'}`}
              icon={Database}
              color="teal"
            />
          </div>
          <section className="glass-card analytics-breakdown-card">
            <div className="analytics-breakdown-heading">
              <div>
                <h2 className="workspace-card-title"><Activity size={18} /> Selected report category breakdown</h2>
                <p className="workspace-section-copy">{selectedReport.title} · {selectedReport.reportingPeriod} · {new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
              <span className="workspace-capability-badge">Saved estimate</span>
            </div>
            <div className="analytics-category-list">
              {selectedTotals.categories.map(category => (
                <article className="analytics-category-row" key={category.id}>
                  <span className="analytics-category-marker" style={{ background: category.color }} />
                  <div className="analytics-category-main">
                    <div className="analytics-category-heading">
                      <div><strong>{category.label}</strong><span>{category.detail}</span></div>
                      <div className="analytics-category-value">
                        <strong>{category.kg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</strong>
                        <span>{category.share.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="workspace-chart-track">
                      <span style={{ width: `${Math.min(100, Math.max(0, category.share))}%`, background: category.color }} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section className="glass-card analytics-history-card">
            <div className="workspace-table-heading">
              <div>
                <h2 className="workspace-card-title"><CalendarDays size={18} /> Saved report history</h2>
                <p className="workspace-section-copy">Select a snapshot to inspect its saved category values. Reports are not combined across different periods.</p>
              </div>
              <span className="workspace-count">{reports.length}</span>
            </div>
            <div className="workspace-table-scroll">
              <table className="workspace-table analytics-history-table">
                <thead><tr><th>Report</th><th>Period</th><th>Saved</th><th>Electricity</th><th>Transport</th><th>Waste</th><th>Total</th></tr></thead>
                <tbody>
                  {reports.map(report => {
                    const totals = reportTotals(report);
                    return (
                      <tr key={report.id} className={report.id === selectedReport.id ? 'is-selected' : ''}>
                        <td data-label="Report"><button className="organization-inline-link" onClick={() => setSelectedReportId(report.id)} aria-pressed={report.id === selectedReport.id}>{report.title}</button></td>
                        <td data-label="Period">{report.reportingPeriod}</td>
                        <td data-label="Saved">{new Date(report.createdAt).toLocaleDateString()}</td>
                        <td data-label="Electricity">{report.payload.electricityKg.toLocaleString()} kg</td>
                        <td data-label="Transport">{report.payload.transportKg.toLocaleString()} kg</td>
                        <td data-label="Waste">{report.payload.wasteKg.toLocaleString()} kg</td>
                        <td data-label="Total"><strong>{totals.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function AnalyticsPage({ onNavigate }) {
  const { status } = useAuth();
  if (status === 'loading') {
    return <div className="page-content workspace-page"><div className="glass-card organization-loading" role="status">Checking workspace access…</div></div>;
  }
  if (status === 'unavailable') {
    return (
      <div className="page-content workspace-page">
        <PageHeading eyebrow="ACTIVITY ANALYTICS" title="Analytics" description="Saved organisation analytics require the account service." />
        <div className="workspace-error" role="alert"><AlertCircle size={15} />The account service is unavailable. No organisation analytics were loaded.</div>
      </div>
    );
  }
  return status === 'authenticated'
    ? <OrganizationAnalyticsPage />
    : <LocalAnalyticsPage onNavigate={onNavigate} />;
}

const ACTION_STATUSES = ['Planned', 'In progress', 'Completed'];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function actionStatus(action) {
  if (action.status !== 'Completed' && action.dueDate && action.dueDate < getLocalDateString()) {
    return 'Overdue';
  }
  return action.status;
}

function LocalActionTrackerPage({ onNavigate }) {
  const { records, saveRecords, storageError } = useBrowserRecords('carbonvision_actions');
  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const addAction = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter an action name.');
      return;
    }
    saveRecords([{ id: crypto.randomUUID(), name: trimmedName, owner: owner.trim(), dueDate, status: 'Planned', progress: 0 }, ...records]);
    setName('');
    setOwner('');
    setDueDate('');
    setError('');
  };

  const updateAction = (id, changes) => {
    saveRecords(records.map(record => record.id === id ? { ...record, ...changes } : record));
  };

  const removeAction = (id) => saveRecords(records.filter(record => record.id !== id));

  return (
    <div className="page-content workspace-page">
      <PageHeading
        eyebrow="SUSTAINABILITY DELIVERY"
        title="Action Tracker"
        description="Track actions you add, update progress, and review due dates."
        action={<span className="workspace-capability-badge">Saved in this browser</span>}
      />
      <StorageNotice>
        Actions are stored locally on this device while signed out. <button className="organization-inline-link" onClick={() => onNavigate('organizations')}>Sign in to use shared organisation actions.</button>
      </StorageNotice>
      <section className="glass-card workspace-action-form-card">
        <h2 className="workspace-card-title"><Plus size={18} /> Add action</h2>
        <form onSubmit={addAction} className="workspace-action-form">
          <label className="workspace-form-field">
            <span>Action name</span>
            <input className="form-input" value={name} onChange={event => setName(event.target.value)} required maxLength={140} />
          </label>
          <label className="workspace-form-field">
            <span>Owner <small>optional</small></span>
            <input className="form-input" value={owner} onChange={event => setOwner(event.target.value)} maxLength={100} />
          </label>
          <label className="workspace-form-field">
            <span>Due date <small>optional</small></span>
            <input className="form-input" type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} />
          </label>
          <button className="btn btn-primary btn-sm" type="submit"><Plus size={15} /> Add action</button>
        </form>
        {error && <p className="workspace-error" role="alert"><AlertCircle size={15} />{error}</p>}
        <StorageError message={storageError} />
      </section>

      <section className="glass-card workspace-table-card">
        <div className="workspace-table-heading">
          <h2 className="workspace-card-title"><ClipboardList size={18} /> Actions</h2>
          <span className="workspace-count">{records.length}</span>
        </div>
        {records.length === 0 ? (
          <div className="workspace-inline-empty">No actions yet. Add an action above to start tracking progress.</div>
        ) : (
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead>
                <tr><th>Action</th><th>Owner</th><th>Due date</th><th>Status</th><th>Progress</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {records.map(action => {
                  const status = actionStatus(action);
                  return (
                    <tr key={action.id}>
                      <td data-label="Action"><strong>{action.name}</strong></td>
                      <td data-label="Owner">{action.owner || '—'}</td>
                      <td data-label="Due date"><span className="workspace-date"><CalendarDays size={14} />{action.dueDate || '—'}</span></td>
                      <td data-label="Status">
                        <select
                          className={`workspace-status-select ${status.toLowerCase().replace(' ', '-')}`}
                          value={action.status}
                          onChange={event => {
                            const status = event.target.value;
                            updateAction(action.id, {
                              status,
                              ...(status === 'Completed' ? { progress: 100 } : action.status === 'Completed' ? { progress: 0 } : {})
                            });
                          }}
                          aria-label={`Status for ${action.name}`}
                        >
                          {ACTION_STATUSES.map(value => <option key={value}>{value}</option>)}
                        </select>
                        {status === 'Overdue' && <span className="workspace-overdue">Overdue</span>}
                      </td>
                      <td data-label="Progress">
                        <div className="workspace-progress-input">
                          <div className="workspace-progress-track"><span style={{ width: `${action.progress}%` }} /></div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={action.progress}
                            onChange={event => {
                              const progress = Math.min(100, Math.max(0, Number(event.target.value) || 0));
                              updateAction(action.id, { progress, ...(progress === 100 ? { status: 'Completed' } : {}) });
                            }}
                            aria-label={`Progress percentage for ${action.name}`}
                          />
                          <span>%</span>
                        </div>
                      </td>
                      <td data-label="Remove">
                        <button className="icon-button danger" onClick={() => removeAction(action.id)} aria-label={`Remove ${action.name}`} title="Remove action">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function BuildingsPage({ onNavigate }) {
  const { status } = useAuth();
  if (status === 'unauthenticated') return <LocalBuildingsPage onNavigate={onNavigate} />;
  return <OrganizationBuildingsPage onNavigate={onNavigate} />;
}

function ActionTrackerPage({ onNavigate }) {
  const { status } = useAuth();
  if (status === 'unauthenticated') return <LocalActionTrackerPage onNavigate={onNavigate} />;
  return <OrganizationActionTrackerPage onNavigate={onNavigate} />;
}

function SettingsPage({ onNavigate }) {
  const { theme, setTheme, reportingPeriod, setReportingPeriod } = useCarbon();
  return (
    <div className="page-content workspace-page">
      <PageHeading eyebrow="PREFERENCES" title="Settings" description="Manage appearance and review connected service availability." />
      <div className="workspace-columns">
        <section className="glass-card">
          <h2 className="workspace-card-title"><Settings size={18} /> Appearance</h2>
          <p className="workspace-section-copy">Choose a display theme for this browser.</p>
          <div className="workspace-theme-options">
            {[
              ['light', 'Light'],
              ['ocean', 'Ocean blue'],
              ['lavender', 'Lavender']
            ].map(([value, label]) => (
              <button key={value} onClick={() => setTheme(value)} className={`workspace-theme-option${theme === value ? ' selected' : ''}`}>
                {theme === value && <CheckCircle2 size={15} />}
                {label}
              </button>
            ))}
          </div>
          <div className="workspace-period-setting">
            <span>Reporting period</span>
            <select value={reportingPeriod} onChange={event => setReportingPeriod(event.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </section>
        <section className="glass-card">
          <h2 className="workspace-card-title"><LockKeyhole size={18} /> Connected services</h2>
          <div className="workspace-service-row"><span>Carbon calculation</span><strong className="service-ready">Available in browser</strong></div>
          <div className="workspace-service-row"><span>Image analysis model</span><strong className="service-unavailable">Not connected</strong></div>
          <div className="workspace-service-row"><span>Organisation accounts</span><strong className="service-ready">Backend + SQLite</strong></div>
          <div className="workspace-service-row"><span>Shared organisation actions</span><strong className="service-ready">Organisation-scoped API</strong></div>
          <button onClick={() => onNavigate('methodology')} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>View methodology</button>
        </section>
      </div>
    </div>
  );
}

export default function WorkspacePages({ page, onNavigate }) {
  switch (page) {
    case 'organizations': return <OrganizationsPage onNavigate={onNavigate} />;
    case 'buildings': return <BuildingsPage onNavigate={onNavigate} />;
    case 'analytics': return <AnalyticsPage onNavigate={onNavigate} />;
    case 'action-tracker': return <ActionTrackerPage onNavigate={onNavigate} />;
    case 'settings': return <SettingsPage onNavigate={onNavigate} />;
    case 'methodology': return <div className="page-content"><MethodologyPage /></div>;
    default: return null;
  }
}
