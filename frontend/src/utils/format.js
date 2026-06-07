/**
 * utils/format.js
 * Pure helper functions for formatting values in the UI.
 * No side-effects, no imports — easy to test and reuse.
 */

/** Format a datetime string as "12 Jan 2025" */
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Format a datetime string as "12 Jan 2025, 06:30 PM" */
export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/** Format a datetime for <input type="datetime-local"> — "2025-01-12T18:30" */
export const fmtForInput = (d) =>
  d ? new Date(d).toISOString().slice(0, 16) : '';

/** Format price in Indian Rupees */
export const fmtPrice = (p) =>
  `₹${Number(p || 0).toLocaleString('en-IN')}`;

/** Shorten a UUID to first 8 chars, uppercase */
export const shortId = (id) =>
  id ? String(id).replace(/-/g, '').toUpperCase().slice(0, 8) : '—';

/** Get initials from a name (e.g. "Ravi Kumar" → "RK") */
export const initials = (name) =>
  name ? name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??';

/** Humanise a role string (e.g. "ORGANIZER" → "Organizer") */
export const fmtRole = (role) =>
  role ? role.charAt(0) + role.slice(1).toLowerCase() : '';

/** Return minimum price from a list of ticket types */
export const minPrice = (ticketTypes = []) =>
  ticketTypes.length
    ? Math.min(...ticketTypes.map(t => t.price || 0))
    : null;
//export const minPrice = (ticketTypes = []) =>
//  ticketTypes.length ? Math.min(...ticketTypes.map(t => t.price || 0)) : 0;
