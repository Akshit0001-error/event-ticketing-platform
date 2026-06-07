/**
 * components/shared/EventCard.jsx
 * Shows event banner image (or a styled default gradient) at the top,
 * with name, venue, date and price below.
 */
import { Badge } from '../ui/Badge';
import { fmtDate, fmtPrice, minPrice } from '../../utils/format';

// Deterministic gradient per event id so each card looks distinct
const GRADIENTS = [
  'linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)',
  'linear-gradient(135deg, #4a1942 0%, #1a1a5e 100%)',
  'linear-gradient(135deg, #3d0c02 0%, #7b2d00 100%)',
  'linear-gradient(135deg, #0d3349 0%, #1b6ca8 100%)',
  'linear-gradient(135deg, #1a3c1f 0%, #4a7c59 100%)',
  'linear-gradient(135deg, #2c1654 0%, #522d80 100%)',
];

function pickGradient(id) {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function EventCard({ event, onClick }) {
  const from = minPrice(event.ticketTypes);

  return (
    <div
      className="event-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* ── Banner image ── */}
      <div style={{ position: 'relative', height: 140, overflow: 'hidden', flexShrink: 0 }}>
        {event.bannerImage ? (
          <img
            src={event.bannerImage}
            alt={event.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: pickGradient(event.id),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 36, opacity: 0.25 }}>🎟</span>
          </div>
        )}
        {/* Date chip overlaid on image */}
        <span style={{
          position: 'absolute', top: 8, right: 8,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          color: '#fff', fontSize: 10, fontFamily: 'var(--font-mono)',
          padding: '3px 7px', borderRadius: 4, letterSpacing: '0.04em',
        }}>
          {fmtDate(event.start)}
        </span>
        {/* Status badge */}
        <span style={{ position: 'absolute', top: 8, left: 8 }}>
          <Badge status={event.status} />
        </span>
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div className="event-card-name" style={{ marginBottom: 6 }}>{event.name}</div>

        <div className="event-card-venue">
          <span style={{ opacity: 0.5, fontSize: 11 }}>📍</span>
          {event.venue || 'Venue TBD'}
        </div>

        <div className="event-card-footer" style={{ marginTop: 10 }}>
          <span className="xs muted">
            {(event.ticketTypes || []).length} ticket type{(event.ticketTypes || []).length !== 1 ? 's' : ''}
          </span>
          <span className="event-price">
            {from === null
              ? 'No Tickets'
              : from === 0
              ? 'Free'
              : `from ${fmtPrice(from)}`}
          </span>
        </div>
      </div>
    </div>
  );
}
