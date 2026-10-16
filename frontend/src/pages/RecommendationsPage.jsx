import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { apiRequest, useAuth } from '../context/AuthContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';
import { generateRecommendations } from '../data/recommendationsEngine';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import InfoNotice from '../components/common/InfoNotice';
import {
  AlertCircle,
  ArrowRight,
  Database,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Info
} from 'lucide-react';

function LocalRecommendationsPage({ onNavigate }) {
  const {
    totalFootprint,
    hasCompleteFootprint
  } = useCarbon();

  const [activeFilter, setActiveFilter] = useState('all');

  const recommendations = useMemo(() => {
    return generateRecommendations(totalFootprint);
  }, [totalFootprint]);

  const filteredRecommendations = useMemo(() => {
    if (activeFilter === 'all') return recommendations;
    if (activeFilter === 'high') return recommendations.filter(r => r.priority === 'High Priority');
    return recommendations.filter(r => r.category === activeFilter);
  }, [recommendations, activeFilter]);

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Recommendations from Your Activity Data
            </h1>
            <span className="badge badge-green">
              Activity-based
            </span>
          </div>
          <p className="page-header-subtitle">
            Review the largest categories in your entered footprint. These prompts do not predict savings or project outcomes.
          </p>
        </div>

        <button
          onClick={() => onNavigate('simulator')}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Sliders size={15} />
          <span>Go to Scenario Simulator</span>
        </button>
      </div>

      <InfoNotice
        title="How these prompts are generated"
        message="Prompts are based only on the categories and shares calculated from your entered activity. No savings, payback, or campus-specific outcomes are assumed."
        type="verified"
      />

      {!hasCompleteFootprint ? (
        <section className="glass-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <Info size={30} color="var(--primary)" style={{ marginBottom: '10px' }} />
          <h3 style={{ marginBottom: '8px' }}>Complete your activity data first</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Recommendations will be based on your entered electricity, transport, and waste activity.
          </p>
          <button onClick={() => onNavigate('calculator')} className="btn btn-primary btn-sm">
            Enter activity data <Sliders size={14} />
          </button>
        </section>
      ) : (
      <>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { id: 'all', label: `All Recommendations (${recommendations.length})` },
          { id: 'high', label: 'High Priority Only' },
          { id: 'electricity', label: 'Electricity / HVAC' },
          { id: 'transport', label: 'Commuter Mobility' },
          { id: 'waste', label: 'Circular Waste' }
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid-cols-3" style={{ gap: '20px' }}>
        {filteredRecommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div
          className="glass-card"
          style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}
        >
          <Info size={32} color="var(--primary)" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>No recommendations in this filter</h4>
          <p style={{ fontSize: '0.85rem' }}>Try selecting "All Recommendations" to review all actionable items.</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

function OrganizationRecommendationsPage({ onNavigate }) {
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
  const [reportStatus, setReportStatus] = useState('loading');
  const [reportError, setReportError] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadedOrganizationId, setLoadedOrganizationId] = useState('');

  const loadReports = useCallback(async signal => {
    if (!selectedOrganizationId) {
      setReports([]);
      setLoadedOrganizationId('');
      setReportStatus('empty');
      setReportError('');
      return;
    }
    setReportStatus('loading');
    setReportError('');
    try {
      const result = await apiRequest(`/api/organizations/${selectedOrganizationId}/reports`, { signal });
      setReports(result.reports);
      setSelectedReportId(currentId => (
        result.reports.some(report => report.id === currentId) ? currentId : result.reports[0]?.id || ''
      ));
      setLoadedOrganizationId(selectedOrganizationId);
      setReportStatus(result.reports.length ? 'ready' : 'empty');
    } catch (error) {
      if (error.name !== 'AbortError') {
        setLoadedOrganizationId(selectedOrganizationId);
        setReportError(error.message);
        setReportStatus('error');
      }
    }
  }, [selectedOrganizationId]);

  useEffect(() => {
    if (organizationStatus !== 'ready') {
      setReports([]);
      setLoadedOrganizationId('');
      setReportStatus(organizationStatus === 'error' ? 'error' : 'loading');
      setReportError('');
      return undefined;
    }
    if (!selectedOrganizationId) {
      setReports([]);
      setLoadedOrganizationId('');
      setReportStatus('empty');
      setReportError('');
      return undefined;
    }
    const controller = new AbortController();
    loadReports(controller.signal);
    return () => controller.abort();
  }, [organizationStatus, selectedOrganizationId, refreshKey, loadReports]);

  const visibleStatus = loadedOrganizationId === selectedOrganizationId
    ? reportStatus
    : selectedOrganizationId ? 'loading' : 'empty';
  const selectedReport = reports.find(report => report.id === selectedReportId) || reports[0] || null;
  const recommendations = useMemo(() => {
    if (!selectedReport) return [];
    const { electricityKg, transportKg, wasteKg } = selectedReport.payload;
    const totalKg = electricityKg + transportKg + wasteKg;
    const share = kg => totalKg > 0 ? kg / totalKg * 100 : 0;
    return generateRecommendations({
      breakdown: {
        electricity: { kg: electricityKg, share: share(electricityKg) },
        transport: { kg: transportKg, share: share(transportKg) },
        waste: { kg: wasteKg, share: share(wasteKg) }
      }
    });
  }, [selectedReport]);

  if (organizationStatus === 'loading') {
    return <div className="page-content"><div className="glass-card organization-loading" role="status">Loading authorised organisations…</div></div>;
  }
  if (organizationStatus === 'error') {
    return (
      <div className="page-content">
        <RecommendationsHeading onNavigate={onNavigate} showSimulator={false} />
        <div className="workspace-error" role="alert"><AlertCircle size={15} />{organizationError}</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshOrganizations}>Try again</button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <RecommendationsHeading onNavigate={onNavigate} showSimulator={false} />
      <InfoNotice
        title="Evidence-based review prompts"
        message="Prompts are derived from positive category values in saved reports. They suggest what to investigate, not guaranteed actions, reductions, payback, or verified causes. “High Priority” means largest category in this report only."
        type="verified"
      />

      <section className="glass-card dashboard-organization-bar">
        <label className="workspace-form-field">
          <span>Organisation</span>
          {organizations.length ? (
            <select className="form-input" aria-label="Recommendations organisation" value={selectedOrganizationId} onChange={event => selectOrganization(event.target.value)}>
              {organizations.map(organization => <option key={organization.id} value={organization.id}>{organization.name} · {organization.role}</option>)}
            </select>
          ) : <span className="dashboard-no-organization">No organisation membership</span>}
        </label>
        <span className="dashboard-data-source"><ShieldCheck size={15} /> Private, membership-checked data</span>
        {selectedOrganizationId && (
          <button className="btn btn-secondary btn-sm" disabled={visibleStatus === 'loading'} onClick={() => setRefreshKey(key => key + 1)}>
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </section>

      {visibleStatus === 'loading' && <section className="glass-card organization-loading" role="status">Loading saved reports for {selectedOrganization?.name || 'your organisation'}…</section>}
      {visibleStatus === 'error' && (
        <section className="glass-card">
          <div className="workspace-error" role="alert"><AlertCircle size={15} />{reportError || 'Could not load saved reports.'}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => setRefreshKey(key => key + 1)}>Try again</button>
        </section>
      )}
      {visibleStatus === 'empty' && (
        <section className="glass-card recommendations-data-empty">
          <Database size={25} color="var(--primary)" />
          <div>
            <h2>{selectedOrganizationId ? 'No saved report to base recommendations on' : 'Create or join an organisation'}</h2>
            <p>{selectedOrganizationId
              ? 'Save a report containing real activity data. Recommendations will use only positive emissions categories in that report.'
              : 'Recommendations for signed-in workspaces use saved reports from an organisation you can access.'}</p>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('organizations')}>
              {selectedOrganizationId ? 'Open organisation reports' : 'Open Organisations'} <ArrowRight size={14} />
            </button>
          </div>
        </section>
      )}
      {visibleStatus === 'ready' && selectedReport && (
        <>
          <section className="glass-card recommendations-report-bar">
            <label className="workspace-form-field">
              <span>Saved report</span>
              <select className="form-input" aria-label="Recommendations report" value={selectedReport.id} onChange={event => setSelectedReportId(event.target.value)}>
                {reports.map(report => <option key={report.id} value={report.id}>{report.title} · {report.reportingPeriod} · {new Date(report.createdAt).toLocaleDateString()}</option>)}
              </select>
            </label>
            <span className="recommendations-report-source"><Database size={14} /> {selectedReport.payload.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e · saved snapshot</span>
          </section>
          {recommendations.length ? (
            <>
              <div className="recommendations-source-caption">
                <strong>Based on “{selectedReport.title}”</strong>
                <span>{selectedReport.reportingPeriod} · saved {new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>
              <OrganizationRecommendationCards recommendations={recommendations} onNavigate={onNavigate} />
            </>
          ) : (
            <section className="glass-card recommendations-data-empty">
              <Info size={25} color="var(--primary)" />
              <div>
                <h2>No positive emissions categories in this saved report</h2>
                <p>No category-based review prompt is suggested for zero values. Verify source activity and reporting coverage as needed.</p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function RecommendationsHeading({ onNavigate, showSimulator = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <h1 className="page-header-title">Recommendations from Your Activity Data</h1>
          <span className="badge badge-green">Evidence-based prompts</span>
        </div>
        <p className="page-header-subtitle">Investigate the largest categories in your saved report; no reductions or outcomes are assumed.</p>
      </div>
      {showSimulator && (
        <button onClick={() => onNavigate('simulator')} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Sliders size={15} /><span>Go to Scenario Simulator</span>
        </button>
      )}
    </div>
  );
}

function OrganizationRecommendationCards({ recommendations, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const filtered = activeFilter === 'all'
    ? recommendations
    : activeFilter === 'high'
      ? recommendations.filter(recommendation => recommendation.priority === 'High Priority')
      : recommendations.filter(recommendation => recommendation.category === activeFilter);

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { id: 'all', label: `All Recommendations (${recommendations.length})` },
          { id: 'high', label: 'Largest Category' },
          { id: 'electricity', label: 'Electricity' },
          { id: 'transport', label: 'Transport' },
          { id: 'waste', label: 'Waste' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >{tab.label}</button>
        ))}
      </div>
      <div className="grid-cols-3" style={{ gap: '20px' }}>
        {filtered.map(recommendation => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onNavigate={onNavigate}
            actionLabel="Open organisation workspace"
            destination="organizations"
            evidenceLabel="From this saved report"
          />
        ))}
      </div>
      {!filtered.length && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Info size={32} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>No recommendations in this filter</h4>
          <p style={{ fontSize: '0.85rem' }}>Choose another category to review available prompts.</p>
        </div>
      )}
    </>
  );
}

export default function RecommendationsPage({ onNavigate }) {
  const { status } = useAuth();
  if (status === 'loading') return <div className="page-content"><div className="glass-card organization-loading" role="status">Checking workspace access…</div></div>;
  if (status === 'unavailable') {
    return (
      <div className="page-content">
        <RecommendationsHeading onNavigate={onNavigate} showSimulator={false} />
        <div className="workspace-error" role="alert"><AlertCircle size={15} />The account service is unavailable, so organisation recommendations cannot be loaded.</div>
      </div>
    );
  }
  return status === 'authenticated'
    ? <OrganizationRecommendationsPage onNavigate={onNavigate} />
    : <LocalRecommendationsPage onNavigate={onNavigate} />;
}
