import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export async function apiRequest(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    ...(signal ? { signal } : {})
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`The server returned an invalid response (${response.status}).`);
  }
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed with status ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading');
  const [authError, setAuthError] = useState('');

  const refreshSession = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await apiRequest('/api/auth/me');
      setUser(result.user);
      setStatus(result.user ? 'authenticated' : 'unauthenticated');
      setAuthError('');
      return result.user;
    } catch (error) {
      setUser(null);
      setStatus('unavailable');
      setAuthError(error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const authenticate = useCallback(async (action, credentials) => {
    setAuthError('');
    try {
      const result = await apiRequest(`/api/auth/${action}`, { method: 'POST', body: credentials });
      setUser(result.user);
      setStatus('authenticated');
      return result.user;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthError('');
    await apiRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(() => ({
    user,
    status,
    authError,
    clearAuthError: () => setAuthError(''),
    signIn: credentials => authenticate('login', credentials),
    register: credentials => authenticate('register', credentials),
    signOut,
    refreshSession
  }), [user, status, authError, authenticate, signOut, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
