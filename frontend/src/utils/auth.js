/**
 * utils/auth.js
 * JWT parsing and localStorage persistence for the auth token.
 * The token stores user claims so we don't need a separate /me endpoint.
 */

const TOKEN_KEY = 'tp_token';

/** Save token to localStorage */
export const saveToken  = (token) => localStorage.setItem(TOKEN_KEY, token);

/** Load token from localStorage */
export const loadToken  = ()      => localStorage.getItem(TOKEN_KEY);

/** Remove token (logout) */
export const clearToken = ()      => localStorage.removeItem(TOKEN_KEY);

/**
 * Decode the JWT payload (no signature verification — server does that).
 * Returns { sub, name, email, role, exp, ... } or null on failure.
 */
export const parseJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

/** Build the user object from a JWT token string */
export const tokenToUser = (token) => {
  const claims = parseJwt(token);
  if (!claims) return null;
  return {
    id:    claims.sub || claims.userId,
    name:  claims.name  || '',
    email: claims.email || '',
    // Spring Security wraps roles as "ROLE_ORGANIZER" — strip the prefix
    role:  (claims.role || claims.authorities || '').replace('ROLE_', ''),
  };
};

/** Check if a token is expired (client-side fast-fail) */
export const isTokenExpired = (token) => {
  const claims = parseJwt(token);
  if (!claims || !claims.exp) return true;
  return Date.now() >= claims.exp * 1000;
};
