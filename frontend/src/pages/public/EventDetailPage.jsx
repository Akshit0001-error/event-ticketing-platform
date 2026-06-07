/**
 * pages/public/EventDetailPage.jsx
 * Full event detail view — info on left, ticket selector on right.
 *
 * FIXES:
 *  1. getPublishedEvent no longer needs token — public endpoint.
 *  2. Missing dependency array in useEffect (id) — caused potential stale closure.
 *  3. Added error state to show a proper "not found" message vs blank page.
 *  4. Added null-guard on event.ticketTypes before .map().
 */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';
import { fmtDateTime, fmtDate, fmtPrice } from '../../utils/format';
import * as api from '../../api';

export default function EventDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { toast }  = useToast();

  const [event,    setEvent]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selected, setSelected] = useState(null);
  const [qty,      setQty]      = useState(1);

  // FIX: added [id] to dependency array; removed token (public endpoint)
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api.getPublishedEvent(id)
      .then(setEvent)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) { toast('Sign in to purchase tickets.', 'warning'); navigate('/login'); return; }
    if (user.role !== 'ATTENDEE') { toast('Only attendees can purchase tickets.', 'warning'); return; }
    navigate('/checkout', { state: { event, ticketType: selected, quantity: qty } });
  };

  if (loading) return <LoadingState text="Loading event…" />;

  if (notFound || !event) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-2)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>¬</div>
        <div style={{ fontWeight: 500, marginBottom: 8 }}>Event not found</div>
        <div style={{ fontSize: 13, marginBottom: 20 }}>This event may have been removed or is no longer published.</div>
        <Button onClick={() => navigate('/browse')}>Browse events</Button>
      </div>
    );
  }

  // FIX: null-guard on ticketTypes
  const types = event.ticketTypes || [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 64px' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '20px 0 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/browse')}>Events</span>
        <span>/</span>
        <span style={{ color: 'var(--text)' }}>{event.name}</span>
      </div>


      {/* ── Banner image ── */}
      {event.bannerImage ? (
        <div style={{ marginBottom: 24, borderRadius: 'var(--r2,8px)', overflow: 'hidden' }}>
          <img
            src={event.bannerImage}
            alt={event.name}
            style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          marginBottom: 24, borderRadius: 'var(--r2,8px)', overflow: 'hidden',
          height: 180, background: 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 48, opacity: 0.12 }}>🎟</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* ── Left column: event info ── */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Badge status={event.status} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8, lineHeight: 1.25 }}>{event.name}</h1>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-2)' }}>
              <span>{event.venue}</span>
              <span className="dot-sep">·</span>
              <span>{fmtDate(event.start)}</span>
              <span className="dot-sep">·</span>
              <span>{new Date(event.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
            {[
              ['Start',       fmtDateTime(event.start)],
              ['End',         fmtDateTime(event.end)],
              ['Venue',       event.venue || '—'],
              ['Sales Close', event.salesEnd ? fmtDate(event.salesEnd) : 'Until sold out'],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--surface)', padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 14, marginBottom: 12 }}>Available tickets</h2>
          {types.length === 0 ? (
            <div style={{ color: 'var(--text-2)', fontSize: 13 }}>No tickets available yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              {types.map(tt => (
                <div
                  key={tt.id}
                  className="tt-option"
                  style={{
                    borderRadius: 0,
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    background: selected?.id === tt.id ? 'var(--surface-2)' : 'var(--surface)',
                  }}
                  onClick={() => setSelected(tt)}
                >
                  <div style={{ flex: 1 }}>
                    <div className="tt-option-name">{tt.name}</div>
                    {tt.description && <div className="tt-option-desc">{tt.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="tt-option-price">{fmtPrice(tt.price)}</div>
                    {selected?.id === tt.id && (
                      <div style={{ width: 16, height: 16, background: 'var(--text)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--bg)', fontWeight: 700 }}>✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right column: booking panel ── */}
        <div style={{ position: 'sticky', top: 16 }}>
          <div className="card">
            <div className="card-header">
              <span style={{ fontSize: 13, fontWeight: 600 }}>Book tickets</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {selected ? (
                <div style={{ padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 'var(--r2)', border: '1px solid var(--border-2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{selected.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600 }}>{fmtPrice(selected.price)}</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Select a ticket type from the list.</div>
              )}

              {selected && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>Quantity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      style={{ width: 30, height: 30, border: '1px solid var(--border-2)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r2)', cursor: 'pointer', fontSize: 16 }}
                    >−</button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, minWidth: 28, textAlign: 'center' }}>{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(10, q + 1))}
                      style={{ width: 30, height: 30, border: '1px solid var(--border-2)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r2)', cursor: 'pointer', fontSize: 16 }}
                    >+</button>
                  </div>
                </div>
              )}

              {selected && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>{fmtPrice(selected.price * qty)}</span>
                </div>
              )}

              <Button variant="primary" size="lg" onClick={handleBook} disabled={!selected} style={{ width: '100%' }}>
                {selected ? 'Continue to payment' : 'Select a ticket first'}
              </Button>

              <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
                QR code sent to your email after payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
