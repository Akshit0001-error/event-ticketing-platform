/**
 * context/AuthContext.jsx
 *
 * FIXES:
 *  1. Added expiry check on token refresh — if token is expired on load,
 *     auto-clear storage so user is redirected to login.
 *  2. Added isExpired state + auto-logout when a protected API call
 *     gets a 401 (handled via window event 'auth:expired').
 *  3. Preserved name from login response body (JWT has no name claim).
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { saveToken, loadToken, clearToken, isTokenExpired, parseJwt } from '../utils/auth';

const NAME_KEY = 'tp_name';

const AuthContext = createContext(null);

function buildUserFromToken(token, name) {
  const claims = parseJwt(token);
  if (!claims) return null;
  return {
    id:    claims.sub,
    name:  name || claims.name || claims.email?.split('@')[0] || 'User',
    email: claims.email || '',
    role:  (claims.role || '').replace('ROLE_', ''),
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const t = loadToken();
    if (!t || isTokenExpired(t)) {
      // FIX: clean up stale data on startup
      clearToken();
      localStorage.removeItem(NAME_KEY);
      return null;
    }
    return t;
  });

  const [user, setUser] = useState(() => {
    const t = loadToken();
    if (!t || isTokenExpired(t)) return null;
    const name = localStorage.getItem(NAME_KEY) || '';
    return buildUserFromToken(t, name);
  });

  const login = useCallback((rawToken, name = '') => {
    saveToken(rawToken);
    if (name) localStorage.setItem(NAME_KEY, name);
    setToken(rawToken);
    setUser(buildUserFromToken(rawToken, name));
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem(NAME_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // FIX: listen for 401 events dispatched by the API layer — auto-logout on expired token
  useEffect(() => {
    const handler = () => {
      logout();
      window.location.href = '/login';
    };
    window.addEventListener('auth:expired', handler);
    return () => window.removeEventListener('auth:expired', handler);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
