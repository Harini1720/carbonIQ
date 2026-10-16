import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest, useAuth } from './AuthContext';

const OrganizationSelectionContext = createContext(null);
const STORAGE_KEY = 'carbonvision_selected_organization';

function readSelectedOrganizationId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function OrganizationSelectionProvider({ children }) {
  const { user, status: authStatus } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationIdState] = useState(readSelectedOrganizationId);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const refreshOrganizations = useCallback(async signal => {
    if (authStatus !== 'authenticated') return [];
    setStatus('loading');
    setError('');
    try {
      const result = await apiRequest('/api/organizations', { signal });
      setOrganizations(result.organizations);
      setSelectedOrganizationIdState(currentId => {
        const nextId = result.organizations.some(organization => organization.id === currentId)
          ? currentId
          : result.organizations[0]?.id || '';
        try {
          if (nextId) localStorage.setItem(STORAGE_KEY, nextId);
          else localStorage.removeItem(STORAGE_KEY);
        } catch {}
        return nextId;
      });
      setStatus('ready');
      return result.organizations;
    } catch (requestError) {
      if (requestError.name === 'AbortError') return [];
      setError(requestError.message);
      setStatus('error');
      return [];
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      setOrganizations([]);
      setStatus(authStatus === 'loading' ? 'loading' : authStatus);
      setError('');
      return undefined;
    }
    const controller = new AbortController();
    refreshOrganizations(controller.signal);
    return () => controller.abort();
  }, [authStatus, user?.id, refreshOrganizations]);

  const selectOrganization = useCallback(id => {
    setSelectedOrganizationIdState(id);
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const selectedOrganization = organizations.find(organization => organization.id === selectedOrganizationId) || null;
  const value = useMemo(() => ({
    organizations,
    selectedOrganization,
    selectedOrganizationId: selectedOrganization?.id || '',
    selectOrganization,
    status,
    error,
    refreshOrganizations: () => refreshOrganizations()
  }), [organizations, selectedOrganization, selectOrganization, status, error, refreshOrganizations]);

  return <OrganizationSelectionContext.Provider value={value}>{children}</OrganizationSelectionContext.Provider>;
}

export function useOrganizationSelection() {
  const context = useContext(OrganizationSelectionContext);
  if (!context) throw new Error('useOrganizationSelection must be used within an OrganizationSelectionProvider');
  return context;
}
