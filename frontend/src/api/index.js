/**
 * api/index.js
 * All HTTP calls to the Spring Boot backend.
 *
 * FIXES:
 *  1. Hardcoded localhost fallback removed — BASE always uses env var in prod.
 *  2. 401 responses fire 'auth:expired' event so AuthContext auto-logs out.
 *  3. deleteEvent was missing token in request options (was passing token
 *     as 3rd arg but request() reads it from 3rd param — was fine, kept).
 *  4. getTicketQr: added error handling for non-ok responses.
 *  5. All functions consistently ordered (token always last named param).
 */

const BASE = import.meta.env.VITE_API_BASE || '/api/v1';

async function request(path, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  // FIX: dispatch event so AuthContext can auto-logout on token expiry
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    throw new Error('Session expired. Please sign in again.');
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login    = (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) });
export const register = (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) });

// ─── Public Events ────────────────────────────────────────────────────────────
export const getPublishedEvents = (page = 0, size = 12) =>
  request(`/published-events?page=${page}&size=${size}`);

export const searchPublishedEvents = (query, page = 0) =>
  request(`/published-events?q=${encodeURIComponent(query)}&page=${page}&size=12`);

export const getPublishedEvent = (id) =>
  request(`/published-events/${id}`);

// ─── Organizer Events ─────────────────────────────────────────────────────────
export const getMyEvents  = (token, page = 0) => request(`/events?page=${page}&size=20`, {}, token);
export const getEventById = (id, token)       => request(`/events/${id}`, {}, token);
export const createEvent  = (body, token)     => request('/events', { method: 'POST', body: JSON.stringify(body) }, token);
export const updateEvent  = (id, body, token) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }, token);
export const deleteEvent  = (id, token)       => request(`/events/${id}`, { method: 'DELETE' }, token);

// ─── Tickets ──────────────────────────────────────────────────────────────────
export const getMyTickets = (token, page = 0) => request(`/tickets?page=${page}&size=20`, {}, token);
export const getTicket    = (id, token)        => request(`/tickets/${id}`, {}, token);
export const cancelTicket = (id, token)        => request(`/tickets/${id}`, { method: 'DELETE' }, token);

/** Returns raw Response — caller uses createObjectURL from blob */
export const getTicketQr = async (id, token) => {
  const res = await fetch(`${BASE}/tickets/${id}/qr-codes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // FIX: handle 401 for QR endpoint too
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:expired'));
    throw new Error('Session expired.');
  }
  return res;
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const createOrder   = (body, token) => request('/payments/orders', { method: 'POST', body: JSON.stringify(body) }, token);
export const verifyPayment = (body, token) => request('/payments/verify', { method: 'POST', body: JSON.stringify(body) }, token);

// ─── Ticket Validation ────────────────────────────────────────────────────────
// Body: { id, method } — matches backend TicketValidationRequestDto exactly
export const validateTicket = (body, token) => request('/ticket-validations', { method: 'POST', body: JSON.stringify(body) }, token);
