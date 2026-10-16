import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, ArrowRight, Building2, CalendarDays, ClipboardList,
  Plus, Search, ShieldCheck, Trash2
} from 'lucide-react';
import { apiRequest, useAuth } from '../context/AuthContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';

const ACTION_STATUSES = ['Planned', 'In progress', 'Completed'];

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="workspace-page-heading">
      <div>
        <span className="workspace-eyebrow">{eyebrow}</span>
        <h1 className="page-header-title">{title}</h1>
        <p className="page-header-subtitle">{description}</p>
      </div>
      {action}
    </div>
  );
}

function OrganizationWorkspaceState({ children, onNavigate }) {
  const { organizations, selectedOrganization, selectedOrganizationId, selectOrganization, status, error, refreshOrganizations } = useOrganizationSelection();

  if (status === 'loading') return <div className="glass-card organization-loading" role="status">Loading your authorised organisations…</div>;
  if (status === 'error') {
    return (
      <section className="glass-card">
        <div className="workspace-error" role="alert"><AlertCircle size={15} />{error}</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshOrganizations}>Try again</button>
      </section>
    );
  }
  if (!organizations.length) {
    return (
      <section className="glass-card organization-empty-workspace">
        <span className="workspace-empty-icon"><Building2 size={22} /></span>
        <h2>Create an organisation to share records</h2>
        <p>Buildings and actions on these pages are stored on the server and need an organisation workspace.</p>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate('organizations')}>Go to Organisations <ArrowRight size={14} /></button>
      </section>
    );
  }

  return (
    <>
      <section className="glass-card organization-scope-bar">
        <label className="workspace-form-field">
          <span>Organisation workspace</span>
          <select className="form-input" value={selectedOrganizationId} onChange={event => selectOrganization(event.target.value)}>
            {organizations.map(organization => (
              <option key={organization.id} value={organization.id}>{organization.name} · {organization.role}</option>
            ))}
          </select>
        </label>
        <span><ShieldCheck size={15} /> Saved to {selectedOrganization?.name || 'your organisation'}</span>
        <button className="organization-text-button" onClick={() => onNavigate('organizations')}>Manage organisations</button>
      </section>
      {children(selectedOrganization)}
    </>
  );
}

function AuthorizedWorkspace({ onNavigate, children }) {
  const { status, refreshSession } = useAuth();
  if (status === 'loading') return <div className="glass-card organization-loading" role="status">Checking your account…</div>;
  if (status === 'unavailable') {
    return (
      <section className="glass-card">
        <div className="workspace-error" role="alert">The account service is unavailable. Organisation records were not loaded.</div>
        <button className="btn btn-secondary btn-sm" onClick={refreshSession}>Try again</button>
      </section>
    );
  }
  if (status === 'unauthenticated') {
    return (
      <StorageNotice>
        You are signed out, so this page is using its browser-local records. <button className="organization-inline-link" onClick={() => onNavigate('organizations')}>Sign in to use organisation records.</button>
      </StorageNotice>
    );
  }
  return <OrganizationWorkspaceState onNavigate={onNavigate}>{children}</OrganizationWorkspaceState>;
}

function OrganizationBuildings({ organization, onNavigate }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState({ name: '', type: '', address: '' });
  const [editingId, setEditingId] = useState('');
  const organizationId = organization.id;

  const loadBuildings = useCallback(async signal => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(`/api/organizations/${organizationId}/buildings`, { signal });
      setBuildings(result.buildings);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    const controller = new AbortController();
    loadBuildings(controller.signal);
    return () => controller.abort();
  }, [loadBuildings]);

  const visibleBuildings = useMemo(() => buildings.filter(building => (
    `${building.name} ${building.type} ${building.address}`.toLowerCase().includes(search.trim().toLowerCase())
  )), [buildings, search]);

  const saveBuilding = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const isEditing = Boolean(editingId);
    try {
      const path = `/api/organizations/${organizationId}/buildings${isEditing ? `/${editingId}` : ''}`;
      const result = await apiRequest(path, { method: isEditing ? 'PATCH' : 'POST', body: draft });
      setBuildings(current => isEditing
        ? current.map(building => building.id === editingId ? result.building : building)
        : [...current, result.building].sort((a, b) => a.name.localeCompare(b.name)));
      setDraft({ name: '', type: '', address: '' });
      setEditingId('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const removeBuilding = async building => {
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/api/organizations/${organizationId}/buildings/${building.id}`, { method: 'DELETE' });
      setBuildings(current => current.filter(record => record.id !== building.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="glass-card organization-connected-records">
      <div className="organization-list-toolbar">
        <div>
          <h2 className="workspace-card-title"><Building2 size={18} /> {organization.name} buildings <span className="workspace-count">{buildings.length}</span></h2>
          <p className="workspace-section-copy">Records are stored on the server and shared with this organisation's members.</p>
        </div>
        {buildings.length > 0 && (
          <label className="organization-search">
            <Search size={15} />
            <input aria-label="Search organisation buildings" placeholder="Search buildings" value={search} onChange={event => setSearch(event.target.value)} />
          </label>
        )}
      </div>
      <form onSubmit={saveBuilding} className="organization-building-form">
        <label className="workspace-form-field"><span>Building name</span><input className="form-input" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} maxLength={120} required /></label>
        <label className="workspace-form-field"><span>Type <small>optional</small></span><input className="form-input" value={draft.type} onChange={event => setDraft({ ...draft, type: event.target.value })} maxLength={80} /></label>
        <label className="workspace-form-field"><span>Address <small>optional</small></span><input className="form-input" value={draft.address} onChange={event => setDraft({ ...draft, address: event.target.value })} maxLength={250} /></label>
        <button className="btn btn-primary btn-sm" disabled={busy}><Plus size={15} /> {editingId ? 'Save building' : 'Add building'}</button>
        {editingId && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingId(''); setDraft({ name: '', type: '', address: '' }); }}>Cancel</button>}
      </form>
      {error && <div className="workspace-error" role="alert"><AlertCircle size={15} />{error}</div>}
      {loading ? <div className="workspace-inline-empty" role="status">Loading buildings…</div> : (
        visibleBuildings.length === 0 ? (
          <div className="workspace-inline-empty">{buildings.length ? `No buildings match “${search}”.` : 'No buildings in this organisation yet. Add the first one above.'}</div>
        ) : (
          <div className="organization-building-list">
            {visibleBuildings.map(building => (
              <div className="organization-building-row" key={building.id}>
                <span className="organization-record-icon"><Building2 size={17} /></span>
                <span><strong>{building.name}</strong><small>{[building.type, building.address].filter(Boolean).join(' · ') || 'Type and address not specified'}</small></span>
                <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => { setEditingId(building.id); setDraft({ name: building.name, type: building.type, address: building.address }); }}>Edit</button>
                <button className="icon-button danger" disabled={busy} onClick={() => removeBuilding(building)} aria-label={`Delete ${building.name}`}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )
      )}
      <button className="organization-inline-link" onClick={() => onNavigate('image-impact')}>Open Sustainability Studio to analyse an image</button>
    </section>
  );
}

export function OrganizationBuildingsPage({ onNavigate }) {
  return (
    <div className="page-content workspace-page">
      <PageHeading eyebrow="FACILITY RECORDS" title="Buildings" description="Manage shared facility records belonging to an authorised organisation." />
      <AuthorizedWorkspace onNavigate={onNavigate}>
        {organization => <OrganizationBuildings organization={organization} onNavigate={onNavigate} />}
      </AuthorizedWorkspace>
    </div>
  );
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getActionStatus(action) {
  if (action.status !== 'Completed' && action.dueDate && action.dueDate < localDateString()) return 'Overdue';
  return action.status;
}

function OrganizationActions({ organization }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ name: '', owner: '', dueDate: '' });
  const [progressDrafts, setProgressDrafts] = useState({});
  const organizationId = organization.id;

  const loadActions = useCallback(async signal => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(`/api/organizations/${organizationId}/actions`, { signal });
      setActions(result.actions);
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    const controller = new AbortController();
    loadActions(controller.signal);
    return () => controller.abort();
  }, [loadActions]);

  const addAction = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest(`/api/organizations/${organizationId}/actions`, {
        method: 'POST',
        body: { ...draft, status: 'Planned', progress: 0 }
      });
      setActions(current => [result.action, ...current]);
      setDraft({ name: '', owner: '', dueDate: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateAction = async (action, changes) => {
    setBusy(true);
    setError('');
    try {
      const result = await apiRequest(`/api/organizations/${organizationId}/actions/${action.id}`, { method: 'PATCH', body: changes });
      setActions(current => current.map(record => record.id === action.id ? result.action : record));
      setProgressDrafts(current => {
        const next = { ...current };
        delete next[action.id];
        return next;
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const removeAction = async action => {
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/api/organizations/${organizationId}/actions/${action.id}`, { method: 'DELETE' });
      setActions(current => current.filter(record => record.id !== action.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="glass-card workspace-action-form-card">
        <h2 className="workspace-card-title"><Plus size={18} /> Add an action to {organization.name}</h2>
        <form onSubmit={addAction} className="workspace-action-form">
          <label className="workspace-form-field"><span>Action name</span><input className="form-input" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} required maxLength={140} /></label>
          <label className="workspace-form-field"><span>Owner <small>optional</small></span><input className="form-input" value={draft.owner} onChange={event => setDraft({ ...draft, owner: event.target.value })} maxLength={100} /></label>
          <label className="workspace-form-field"><span>Due date <small>optional</small></span><input className="form-input" type="date" value={draft.dueDate} onChange={event => setDraft({ ...draft, dueDate: event.target.value })} /></label>
          <button className="btn btn-primary btn-sm" disabled={busy}><Plus size={15} /> Add action</button>
        </form>
        {error && <div className="workspace-error" role="alert"><AlertCircle size={15} />{error}</div>}
      </section>
      <section className="glass-card workspace-table-card">
        <div className="workspace-table-heading">
          <h2 className="workspace-card-title"><ClipboardList size={18} /> {organization.name} actions</h2>
          <span className="workspace-count">{actions.length}</span>
        </div>
        {loading ? <div className="workspace-inline-empty" role="status">Loading organisation actions…</div> : actions.length === 0 ? (
          <div className="workspace-inline-empty">No actions yet. Add an action above to start tracking shared progress.</div>
        ) : (
          <div className="workspace-table-scroll">
            <table className="workspace-table">
              <thead><tr><th>Action</th><th>Owner</th><th>Due date</th><th>Status</th><th>Progress</th><th aria-label="Actions" /></tr></thead>
              <tbody>
                {actions.map(action => {
                  const displayStatus = getActionStatus(action);
                  return (
                    <tr key={action.id}>
                      <td data-label="Action"><strong>{action.name}</strong></td>
                      <td data-label="Owner">{action.owner || '—'}</td>
                      <td data-label="Due date"><span className="workspace-date"><CalendarDays size={14} />{action.dueDate || '—'}</span></td>
                      <td data-label="Status">
                        <select className={`workspace-status-select ${displayStatus.toLowerCase().replace(' ', '-')}`} disabled={busy} value={action.status} onChange={event => updateAction(action, { status: event.target.value })} aria-label={`Status for ${action.name}`}>
                          {ACTION_STATUSES.map(status => <option key={status}>{status}</option>)}
                        </select>
                        {displayStatus === 'Overdue' && <span className="workspace-overdue">Overdue</span>}
                      </td>
                      <td data-label="Progress">
                        <div className="workspace-progress-input">
                          <div className="workspace-progress-track"><span style={{ width: `${action.progress}%` }} /></div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={progressDrafts[action.id] ?? action.progress}
                            disabled={busy}
                            onChange={event => setProgressDrafts(current => ({ ...current, [action.id]: event.target.value }))}
                            onBlur={event => {
                              if (progressDrafts[action.id] === undefined) return;
                              const progress = Math.min(100, Math.max(0, Number.parseInt(event.target.value, 10) || 0));
                              updateAction(action, { progress });
                            }}
                            aria-label={`Progress percentage for ${action.name}`}
                          />
                          <span>%</span>
                        </div>
                      </td>
                      <td data-label="Remove"><button className="icon-button danger" disabled={busy} onClick={() => removeAction(action)} aria-label={`Remove ${action.name}`} title="Remove action"><Trash2 size={15} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export function OrganizationActionTrackerPage({ onNavigate }) {
  return (
    <div className="page-content workspace-page">
      <PageHeading
        eyebrow="SUSTAINABILITY DELIVERY"
        title="Action Tracker"
        description="Track planned work, ownership, due dates, and progress."
        action={<span className="workspace-capability-badge">Organisation shared</span>}
      />
      <AuthorizedWorkspace onNavigate={onNavigate}>
        {organization => <OrganizationActions organization={organization} />}
      </AuthorizedWorkspace>
    </div>
  );
}
