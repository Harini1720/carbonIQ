import React, { useState } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { apiRequest, useAuth } from '../context/AuthContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';
import { formatKg } from '../utils/formatters';
import ElectricityCalculator from '../components/calculator/ElectricityCalculator';
import TransportCalculator from '../components/calculator/TransportCalculator';
import WasteCalculator from '../components/calculator/WasteCalculator';
import InfoNotice from '../components/common/InfoNotice';
import {
  Calculator,
  RotateCcw,
  Zap,
  Bus,
  Trash2,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Database
} from 'lucide-react';

export default function CalculatorPage({ onNavigate }) {
  const {
    resetInputs,
    totalFootprint,
    reportingPeriod,
    hasCompleteFootprint,
    dataCompleteness
  } = useCarbon();
  const { status: authStatus, authError, refreshSession } = useAuth();
  const {
    organizations,
    selectedOrganization,
    selectedOrganizationId,
    selectOrganization,
    status: organizationStatus,
    error: organizationError,
    refreshOrganizations
  } = useOrganizationSelection();

  const [activeCategory, setActiveCategory] = useState('all');
  const [reportStatus, setReportStatus] = useState('idle');
  const [reportMessage, setReportMessage] = useState('');
  const [savedOrganizationId, setSavedOrganizationId] = useState('');

  const saveOrganizationReport = async () => {
    if (authStatus !== 'authenticated' || !selectedOrganizationId || !hasCompleteFootprint || reportStatus === 'saving') return;
    const organizationId = selectedOrganizationId;
    const organizationName = selectedOrganization.name;
    setReportStatus('saving');
    setReportMessage('');
    setSavedOrganizationId('');
    try {
      await apiRequest(`/api/organizations/${organizationId}/reports`, {
        method: 'POST',
        body: {
          title: `${organizationName} — ${reportingPeriod} carbon report`,
          reportingPeriod,
          payload: {
            electricityKg: totalFootprint.breakdown.electricity.kg,
            transportKg: totalFootprint.breakdown.transport.kg,
            wasteKg: totalFootprint.breakdown.waste.kg
          }
        }
      });
      setReportStatus('saved');
      setReportMessage(`Calculation saved to ${organizationName}.`);
      setSavedOrganizationId(organizationId);
    } catch (error) {
      setReportStatus('error');
      setReportMessage(error.message);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Multimodal Carbon Emissions Calculator
            </h1>
            <span className="badge badge-green">
              Live Mathematical Engine
            </span>
          </div>
          <p className="page-header-subtitle">
            Configure metered electricity, commuter mobility patterns, and solid waste streams. All calculations update dynamically in real time across the entire platform.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={resetInputs}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <RotateCcw size={14} />
            Clear all inputs
          </button>
          <button
            onClick={() => onNavigate('simulator')}
            className="btn btn-primary btn-sm"
          >
            Simulate Decarbonization
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <InfoNotice
        title="Calculation basis:"
        message="Use recorded electricity (kWh), commuting (passenger-km), and waste (kg) activity. Calculations use documented emission factors and do not verify the source records."
      />

      <section className="glass-card calculator-report-save">
        <div className="calculator-report-save-copy">
          <Database size={19} />
          <div>
            <strong>Save this calculation to an organisation</strong>
            <p>
              {authStatus === 'authenticated'
                ? selectedOrganization
                  ? `Save the calculated category totals as a report in ${selectedOrganization.name}.`
                  : organizationStatus === 'loading'
                    ? 'Loading your authorised organisations…'
                    : organizationStatus === 'error'
                      ? organizationError
                    : 'Select or create an organisation before saving a shared report.'
                : authStatus === 'unavailable'
                  ? `The account service is unavailable. ${authError}`
                  : authStatus === 'loading'
                    ? 'Checking account access…'
                  : 'Sign in to save a report to an organisation. Calculator inputs remain available locally.'}
            </p>
          </div>
        </div>
        {authStatus === 'authenticated' && organizations.length > 1 && (
          <label className="workspace-form-field calculator-organization-select">
            <span>Save to</span>
            <select
              className="form-input"
              aria-label="Organisation to save calculator report to"
              value={selectedOrganizationId}
              onChange={event => selectOrganization(event.target.value)}
            >
              {organizations.map(organization => (
                <option key={organization.id} value={organization.id}>{organization.name}</option>
              ))}
            </select>
          </label>
        )}
        <div className="calculator-report-save-actions">
          {authStatus === 'loading' ? (
            <button className="btn btn-secondary btn-sm" disabled>Checking account…</button>
          ) : authStatus === 'unavailable' ? (
            <button className="btn btn-secondary btn-sm" onClick={refreshSession}>Retry account service</button>
          ) : authStatus !== 'authenticated' ? (
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('organizations')}>
              Sign in to Organisations <ArrowRight size={14} />
            </button>
          ) : organizationStatus === 'error' ? (
            <button className="btn btn-secondary btn-sm" onClick={refreshOrganizations}>Retry organisation access</button>
          ) : !organizations.length && organizationStatus === 'ready' ? (
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('organizations')}>
              Create Organisation <ArrowRight size={14} />
            </button>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              disabled={!selectedOrganizationId || !hasCompleteFootprint || reportStatus === 'saving' || organizationStatus !== 'ready'}
              onClick={saveOrganizationReport}
            >
              <ShieldCheck size={15} /> {reportStatus === 'saving' ? 'Saving…' : 'Save report'}
            </button>
          )}
        </div>
        {reportMessage && (
          <div className={`calculator-report-feedback ${reportStatus === 'error' ? 'is-error' : 'is-success'}`} role={reportStatus === 'error' ? 'alert' : 'status'}>
            {reportStatus === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
            <span>{reportMessage}</span>
            {reportStatus === 'saved' && <button className="organization-inline-link" onClick={() => {
              selectOrganization(savedOrganizationId);
              onNavigate('analytics');
            }}>View in Analytics</button>}
          </div>
        )}
      </section>

      {/* Real-Time Total Footprint Summary Ribbon */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(18, 33, 28, 0.9) 100%)',
          border: '1px solid var(--border-bright)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}
          >
            <Calculator size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 700 }}>
              Calculated {reportingPeriod.toUpperCase()} Footprint
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {hasCompleteFootprint ? (
                <>
                  {formatKg(totalFootprint.totalKg)}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '8px' }}>
                    ({totalFootprint.totalTonnes.toFixed(2)} metric tonnes CO₂e)
                  </span>
                </>
              ) : <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Complete the required activity fields</span>}
            </div>
          </div>
        </div>

        {/* Quick Category breakdown pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Electricity</span>
            <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{dataCompleteness.electricity ? `${totalFootprint.breakdown.electricity.share.toFixed(1)}%` : '—'}</strong>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.3)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Transportation</span>
            <strong style={{ fontSize: '0.85rem', color: '#2dd4bf' }}>{dataCompleteness.transport ? `${totalFootprint.breakdown.transport.share.toFixed(1)}%` : '—'}</strong>
          </div>
          <div style={{ background: 'rgba(16, 28, 24, 0.8)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'block' }}>Waste Streams</span>
            <strong style={{ fontSize: '0.85rem', color: '#fbbf24' }}>{dataCompleteness.waste ? `${totalFootprint.breakdown.waste.share.toFixed(1)}%` : '—'}</strong>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'all', label: 'All Emission Scopes', icon: Layers },
          { id: 'electricity', label: 'Electricity (Scope 2)', icon: Zap },
          { id: 'transport', label: 'Transportation (Scope 3)', icon: Bus },
          { id: 'waste', label: 'Waste Streams (Scope 3)', icon: Trash2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ gap: '6px' }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Calculators Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {(activeCategory === 'all' || activeCategory === 'electricity') && (
          <ElectricityCalculator />
        )}

        {(activeCategory === 'all' || activeCategory === 'transport') && (
          <TransportCalculator />
        )}

        {(activeCategory === 'all' || activeCategory === 'waste') && (
          <WasteCalculator />
        )}
      </div>
    </div>
  );
}
