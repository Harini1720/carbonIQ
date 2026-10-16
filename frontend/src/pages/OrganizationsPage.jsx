import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle2, CircleAlert, Database, LockKeyhole,
  MailPlus, Plus, Search, ShieldCheck, Trash2, Users
} from 'lucide-react';
import { apiRequest, useAuth } from '../context/AuthContext';
import { useCarbon } from '../context/CarbonContext';
import { useOrganizationSelection } from '../context/OrganizationSelectionContext';

function WorkspaceHeading({ eyebrow, title, description, action }) {
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

function AuthGate() {
  const { status, authError, clearAuthError, signIn, register, refreshSession } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isRegistration = mode === 'register';

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const credentials = { email: email.trim(), password };
      if (isRegistration) credentials.name = name.trim();
      await (isRegistration ? register(credentials) : signIn(credentials));
      setPassword('');
    } catch {
      // The authentication provider exposes the server's actionable error.
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="glass-card organization-auth-card" role="status">Checking your secure session…</div>;
  }
  if (status === 'unavailable') {
    return (
      <section className="glass-card organization-auth-card">
        <div className="workspace-empty-icon"><CircleAlert size={22} /></div>
        <h2>Organisation service is unavailable</h2>
        <p>The account and organisation API could not be reached. Your private organisation data has not been loaded.</p>
        <div className="workspace-error" role="alert">{authError}</div>
        <button className="btn btn-primary btn-sm" onClick={refreshSession}>Try again</button>
      </section>
    );
  }

  return (
    <div className="organizations-layout">
      <section className="glass-card organization-auth-card">
        <div className="workspace-empty-icon"><LockKeyhole size={22} /></div>
        <h2>{isRegistration ? 'Create your member account' : 'Sign in to your workspace'}</h2>
        <p>Organisation records are private and available only to signed-in members.</p>
        <form className="organization-form" onSubmit={submit}>
          {isRegistration && (
            <label className="workspace-form-field">
              <span>Name</span>
              <input className="form-input" autoComplete="name" value={name} onChange={event => setName(event.target.value)} maxLength={100} required />
            </label>
          )}
          <label className="workspace-form-field">
            <span>Email</span>
            <input className="form-input" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={254} required />
          </label>
          <label className="workspace-form-field">
            <span>Password {isRegistration && <small>(12–128 characters)</small>}</span>
            <input className="form-input" type="password" autoComplete={isRegistration ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} minLength={isRegistration ? 12 : undefined} maxLength={128} required />
          </label>
          {authError && <div className="workspace-error" role="alert"><CircleAlert size={15} />{authError}</div>}
          <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : isRegistration ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button className="organization-text-button" onClick={() => {
          setMode(isRegistration ? 'login' : 'register');
          clearAuthError();
        }}>
          {isRegistration ? 'Already have an account? Sign in' : 'New here? Create a member account'}
        </button>
      </section>
      <aside className="glass-card organizations-next-card">
        <span className="workspace-eyebrow">PRIVATE BY DESIGN</span>
        <h2>Server-checked access</h2>
        <p>Every organisation, building, action, and report request is checked against your membership on the backend.</p>
        <div className="organization-trust-item"><ShieldCheck size={17} /><span>Private organisation membership</span></div>
        <div className="organization-trust-item"><Database size={17} /><span>Persisted server-side records</span></div>
      </aside>
    </div>
  );
}

function OrganizationList({ onOpen }) {
  const { status } = useAuth();
  const { refreshOrganizations } = useOrganizationSelection();
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadOrganizations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/api/organizations');
      setOrganizations(result.organizations);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadOrganizations();
  }, [status, loadOrganizations]);

  const createOrganization = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await apiRequest('/api/organizations', {
        method: 'POST',
        body: { name: name.trim(), type: type.trim() }
      });
      setName('');
      setType('');
      setOrganizations(previous => [...previous, result.organization].sort((a, b) => a.name.localeCompare(b.name)));
      await refreshOrganizations();
      onOpen(result.organization.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const visibleOrganizations = useMemo(() => organizations.filter(organization => (
    `${organization.name} ${organization.type}`.toLowerCase().includes(search.trim().toLowerCase())
  )), [organizations, search]);

  return (
    <>
      <WorkspaceHeading
        eyebrow="WORKSPACE"
        title="Organisations"
        description="Create and manage private organisation workspaces and their building records."
        action={<span className="workspace-capability-badge"><ShieldCheck size={14} /> Secure workspace</span>}
      />
      <section className="glass-card organization-create-card">
        <div>
          <h2 className="workspace-card-title"><Plus size={18} /> Create an organisation</h2>
          <p className="workspace-section-copy">The account that creates it becomes its owner.</p>
        </div>
        <form onSubmit={createOrganization} className="organization-create-form">
          <label className="workspace-form-field">
            <span>Organisation name</span>
            <input className="form-input" value={name} onChange={event => setName(event.target.value)} maxLength={120} required />
          </label>
          <label className="workspace-form-field">
            <span>Type</span>
            <input className="form-input" value={type} onChange={event => setType(event.target.value)} maxLength={80} placeholder="e.g. Education" required />
          </label>
          <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}><Plus size={15} /> Create</button>
        </form>
      </section>
      {error && <div className="workspace-error" role="alert"><CircleAlert size={15} />{error}</div>}
      <section className="glass-card organization-list-card">
        <div className="organization-list-toolbar">
          <div>
            <h2 className="workspace-card-title"><Building2 size={18} /> Your organisations</h2>
            <p className="workspace-section-copy">Only organisations where your account is a member appear here.</p>
          </div>
          <label className="organization-search">
            <Search size={15} />
            <input aria-label="Search organisations" placeholder="Search organisations" value={search} onChange={event => setSearch(event.target.value)} />
          </label>
        </div>
        {loading ? <div className="workspace-inline-empty" role="status">Loading your organisations…</div> : (
          visibleOrganizations.length === 0 ? (
            <div className="workspace-inline-empty">{organizations.length ? 'No organisations match your search.' : 'No organisations yet. Create one above to get started.'}</div>
          ) : (
            <div className="organization-record-list">
              {visibleOrganizations.map(organization => (
                <button key={organization.id} className="organization-record" onClick={() => onOpen(organization.id)}>
                  <span className="organization-record-icon"><Building2 size={18} /></span>
                  <span className="organization-record-copy">
                    <strong>{organization.name}</strong>
                    <small>{organization.type} · {organization.role}</small>
                  </span>
                  <span className="organization-building-count">{organization.buildingCount} {organization.buildingCount === 1 ? 'building' : 'buildings'}</span>
                </button>
              ))}
            </div>
          )
        )}
        <button className="organization-refresh-button" onClick={loadOrganizations}>Refresh list</button>
      </section>
    </>
  );
}

function OrganizationDetail({ organizationId, onBack }) {
  const { user } = useAuth();
  const carbon = useCarbon();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [organizationDraft, setOrganizationDraft] = useState({ name: '', type: '' });
  const [buildingDraft, setBuildingDraft] = useState({ name: '', type: '', address: '' });
  const [editingBuildingId, setEditingBuildingId] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [actionDraft, setActionDraft] = useState({ name: '', owner: '', dueDate: '' });
  const [busy, setBusy] = useState(false);

  const loadDetails = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const base = `/api/organizations/${organizationId}`;
      const [organization, buildings, members, actions, reports] = await Promise.all([
        apiRequest(base, { signal }),
        apiRequest(`${base}/buildings`, { signal }),
        apiRequest(`${base}/members`, { signal }),
        apiRequest(`${base}/actions`, { signal }),
        apiRequest(`${base}/reports`, { signal })
      ]);
      setData({
        organization: organization.organization,
        buildings: buildings.buildings,
        members: members.members,
        actions: actions.actions,
        reports: reports.reports
      });
      setOrganizationDraft({ name: organization.organization.name, type: organization.organization.type });
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    const controller = new AbortController();
    loadDetails(controller.signal);
    return () => controller.abort();
  }, [loadDetails]);

  const refresh = () => loadDetails();
  const mutate = async (path, options, successMessage) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await apiRequest(path, options);
      setNotice(successMessage);
      await refresh();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveOrganization = event => {
    event.preventDefault();
    mutate(`/api/organizations/${organizationId}`, {
      method: 'PATCH',
      body: organizationDraft
    }, 'Organisation details saved.');
  };

  const saveBuilding = async event => {
    event.preventDefault();
    const editing = Boolean(editingBuildingId);
    const path = `/api/organizations/${organizationId}/buildings${editing ? `/${editingBuildingId}` : ''}`;
    const success = await mutate(path, { method: editing ? 'PATCH' : 'POST', body: buildingDraft }, editing ? 'Building updated.' : 'Building added.');
    if (success) {
      setBuildingDraft({ name: '', type: '', address: '' });
      setEditingBuildingId('');
    }
  };

  const addMember = async event => {
    event.preventDefault();
    if (await mutate(`/api/organizations/${organizationId}/members`, {
      method: 'POST',
      body: { email: memberEmail.trim(), role: memberRole }
    }, 'Member added to this organisation.')) setMemberEmail('');
  };

  const addAction = async event => {
    event.preventDefault();
    if (await mutate(`/api/organizations/${organizationId}/actions`, {
      method: 'POST',
      body: { ...actionDraft, status: 'Planned', progress: 0 }
    }, 'Action saved to this organisation.')) setActionDraft({ name: '', owner: '', dueDate: '' });
  };

  const saveReport = () => mutate(`/api/organizations/${organizationId}/reports`, {
    method: 'POST',
    body: {
      title: `${data.organization.name} — ${carbon.reportingPeriod} carbon report`,
      reportingPeriod: carbon.reportingPeriod,
      payload: {
        electricityKg: carbon.electricityEmissions.netEmissions,
        transportKg: carbon.transportEmissions.emissionsKg,
        wasteKg: carbon.wasteEmissions.totalEmissionsKg
      }
    }
  }, 'Carbon report saved to this organisation.');

  const isOwner = data?.organization.role === 'owner';
  const isAdmin = ['owner', 'admin'].includes(data?.organization.role);

  if (loading) return <div className="glass-card organization-loading" role="status">Loading authorised organisation records…</div>;
  if (error && !data) {
    return (
      <section className="glass-card">
        <button className="organization-back-button" onClick={onBack}><ArrowLeft size={15} /> Organisations</button>
        <div className="workspace-error" role="alert"><CircleAlert size={15} />{error}</div>
        <button className="btn btn-secondary btn-sm" onClick={refresh}>Try again</button>
      </section>
    );
  }
  if (!data) return null;

  return (
    <>
      <WorkspaceHeading
        eyebrow="ORGANISATION DETAILS"
        title={data.organization.name}
        description={`${data.organization.type} · ${data.organization.buildingCount} ${data.organization.buildingCount === 1 ? 'building' : 'buildings'} · Your role: ${data.organization.role}`}
        action={<button className="btn btn-secondary btn-sm" onClick={onBack}><ArrowLeft size={15} /> All organisations</button>}
      />
      {error && <div className="workspace-error" role="alert"><CircleAlert size={15} />{error}</div>}
      {notice && <div className="organization-success" role="status"><CheckCircle2 size={15} />{notice}</div>}
      <div className="organization-detail-grid">
        <section className="glass-card">
          <h2 className="workspace-card-title"><Building2 size={18} /> Organisation profile</h2>
          {isAdmin ? (
            <form className="organization-form" onSubmit={saveOrganization}>
              <label className="workspace-form-field"><span>Name</span><input className="form-input" value={organizationDraft.name} onChange={event => setOrganizationDraft({ ...organizationDraft, name: event.target.value })} maxLength={120} required /></label>
              <label className="workspace-form-field"><span>Type</span><input className="form-input" value={organizationDraft.type} onChange={event => setOrganizationDraft({ ...organizationDraft, type: event.target.value })} maxLength={80} required /></label>
              <button className="btn btn-primary btn-sm" disabled={busy}>Save changes</button>
            </form>
          ) : <p>{data.organization.name} · {data.organization.type}</p>}
        </section>

        <section className="glass-card">
          <div className="organization-list-toolbar">
            <h2 className="workspace-card-title"><Users size={18} /> Members <span className="workspace-count">{data.members.length}</span></h2>
            {isOwner && (
              <form className="organization-member-form" onSubmit={addMember}>
                <label className="workspace-form-field"><span>Account email</span><input className="form-input" type="email" value={memberEmail} onChange={event => setMemberEmail(event.target.value)} required maxLength={254} /></label>
                <select aria-label="New member role" className="form-input" value={memberRole} onChange={event => setMemberRole(event.target.value)}><option value="member">Member</option><option value="admin">Admin</option></select>
                <button className="btn btn-primary btn-sm" disabled={busy}><MailPlus size={14} /> Add</button>
              </form>
            )}
          </div>
          <p className="workspace-section-copy">Members must register before the owner can add them.</p>
          <div className="organization-member-list">
            {data.members.map(member => (
              <div className="organization-member-row" key={member.id}>
                <span><strong>{member.name}</strong><small>{member.email}</small></span>
                <span className="organization-role">{member.role}</span>
                {isOwner && member.role !== 'owner' && (
                  <button className="icon-button danger" disabled={busy} onClick={() => mutate(`/api/organizations/${organizationId}/members/${member.id}`, { method: 'DELETE' }, `${member.name} removed.`)} aria-label={`Remove ${member.name}`}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass-card organization-section-card">
        <div className="organization-list-toolbar">
          <div><h2 className="workspace-card-title"><Building2 size={18} /> Buildings</h2><p className="workspace-section-copy">Facility records are scoped to this organisation.</p></div>
        </div>
        <form className="organization-building-form" onSubmit={saveBuilding}>
          <label className="workspace-form-field"><span>Building name</span><input className="form-input" value={buildingDraft.name} onChange={event => setBuildingDraft({ ...buildingDraft, name: event.target.value })} required maxLength={120} /></label>
          <label className="workspace-form-field"><span>Type <small>optional</small></span><input className="form-input" value={buildingDraft.type} onChange={event => setBuildingDraft({ ...buildingDraft, type: event.target.value })} maxLength={80} /></label>
          <label className="workspace-form-field"><span>Address <small>optional</small></span><input className="form-input" value={buildingDraft.address} onChange={event => setBuildingDraft({ ...buildingDraft, address: event.target.value })} maxLength={250} /></label>
          <button className="btn btn-primary btn-sm" disabled={busy}><Plus size={15} /> {editingBuildingId ? 'Save building' : 'Add building'}</button>
          {editingBuildingId && <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingBuildingId(''); setBuildingDraft({ name: '', type: '', address: '' }); }}>Cancel</button>}
        </form>
        {data.buildings.length === 0 ? <div className="workspace-inline-empty">No buildings have been added to this organisation.</div> : (
          <div className="organization-building-list">
            {data.buildings.map(building => (
              <div className="organization-building-row" key={building.id}>
                <span className="organization-record-icon"><Building2 size={17} /></span>
                <span><strong>{building.name}</strong><small>{[building.type, building.address].filter(Boolean).join(' · ') || 'No type or address provided'}</small></span>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditingBuildingId(building.id); setBuildingDraft({ name: building.name, type: building.type, address: building.address }); }}>Edit</button>
                <button className="icon-button danger" disabled={busy} onClick={() => mutate(`/api/organizations/${organizationId}/buildings/${building.id}`, { method: 'DELETE' }, `${building.name} deleted.`)} aria-label={`Delete ${building.name}`}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card organization-section-card">
        <h2 className="workspace-card-title"><CalendarDays size={18} /> Sustainability actions</h2>
        <p className="workspace-section-copy">Actions added here are persisted and shared only with this organisation's members.</p>
        <form className="organization-action-form" onSubmit={addAction}>
          <label className="workspace-form-field"><span>Action</span><input className="form-input" value={actionDraft.name} onChange={event => setActionDraft({ ...actionDraft, name: event.target.value })} required maxLength={140} /></label>
          <label className="workspace-form-field"><span>Owner <small>optional</small></span><input className="form-input" value={actionDraft.owner} onChange={event => setActionDraft({ ...actionDraft, owner: event.target.value })} maxLength={100} /></label>
          <label className="workspace-form-field"><span>Due date <small>optional</small></span><input className="form-input" type="date" value={actionDraft.dueDate} onChange={event => setActionDraft({ ...actionDraft, dueDate: event.target.value })} /></label>
          <button className="btn btn-primary btn-sm" disabled={busy}><Plus size={15} /> Add action</button>
        </form>
        {data.actions.length === 0 ? <div className="workspace-inline-empty">No organisation actions yet.</div> : (
          <div className="organization-action-list">
            {data.actions.map(action => (
              <div className="organization-action-row" key={action.id}>
                <span><strong>{action.name}</strong><small>{action.owner || 'Unassigned'}{action.dueDate ? ` · Due ${action.dueDate}` : ''}</small></span>
                <select aria-label={`Status for ${action.name}`} value={action.status} onChange={event => mutate(`/api/organizations/${organizationId}/actions/${action.id}`, { method: 'PATCH', body: { status: event.target.value } }, 'Action status updated.')}><option>Planned</option><option>In progress</option><option>Completed</option></select>
                <label className="organization-progress"><span>Progress</span><input type="range" min="0" max="100" value={action.progress} onChange={event => mutate(`/api/organizations/${organizationId}/actions/${action.id}`, { method: 'PATCH', body: { progress: Number(event.target.value) } }, 'Action progress updated.')} /><strong>{action.progress}%</strong></label>
                <button className="icon-button danger" disabled={busy} onClick={() => mutate(`/api/organizations/${organizationId}/actions/${action.id}`, { method: 'DELETE' }, 'Action removed.')} aria-label={`Delete ${action.name}`}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card organization-section-card">
        <div className="organization-list-toolbar">
          <div><h2 className="workspace-card-title"><Database size={18} /> Carbon reports</h2><p className="workspace-section-copy">Reports contain only the calculator's user-entered categories and derived totals. Values are not independently verified.</p></div>
          <button className="btn btn-primary btn-sm" disabled={!carbon.hasCompleteFootprint || busy} onClick={saveReport}>Save current calculation</button>
        </div>
        {!carbon.hasCompleteFootprint && <p className="workspace-section-copy">Complete the calculator inputs before saving a report.</p>}
        {data.reports.length === 0 ? <div className="workspace-inline-empty">No carbon reports saved to this organisation.</div> : (
          <div className="organization-report-list">
            {data.reports.map(report => (
              <div className="organization-report-row" key={report.id}>
                <strong>{report.title}</strong>
                <span>{report.reportingPeriod} · {report.payload.totalKg.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg CO₂e</span>
                <small>{new Date(report.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
        <span className="organization-current-user">Signed in as {user.email}</span>
      </section>
    </>
  );
}

export default function OrganizationsPage() {
  const { status } = useAuth();
  const { selectOrganization } = useOrganizationSelection();
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (status !== 'authenticated') setSelectedId('');
  }, [status]);

  const openOrganization = id => {
    selectOrganization(id);
    setSelectedId(id);
  };

  return (
    <div className="page-content workspace-page">
      {status === 'unauthenticated' || status === 'loading' || status === 'unavailable' ? (
        <>
          <WorkspaceHeading eyebrow="WORKSPACE" title="Organisations" description="Sign in to access private organisation data." />
          <AuthGate />
        </>
      ) : selectedId ? (
        <OrganizationDetail organizationId={selectedId} onBack={() => setSelectedId('')} />
      ) : (
        <OrganizationList onOpen={openOrganization} />
      )}
    </div>
  );
}
