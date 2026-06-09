/**
 * pages/attendee/TicketDetailPage.jsx
 * Full ticket detail with QR code display and cancellation flow.
 *
 * FIXES:
 *  1. useEffect had [loadTicket] as dep but loadTicket was recreated every
 *     render (useCallback with [id, token] is fine). Revoke object URL on
 *     qrUrl change, not just unmount, to prevent memory leaks.
 *  2. toast and navigate were in useCallback dep array — they are stable
 *     refs from context but shouldn't cause issues; kept for correctness.
 *  3. Null-guard on ticket before rendering detail rows.
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner, LoadingState } from '../../components/ui/Spinner';
import { fmtDateTime, shortId } from '../../utils/format';
import * as api from '../../api';

export default function TicketDetailPage() {
  const { id }          = useParams();
  const { openMenu }    = useOutletContext();
  const { token }       = useAuth();
  const { toast }       = useToast();
  const navigate        = useNavigate();

  const [ticket,     setTicket]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [qrUrl,      setQrUrl]      = useState(null);
  // FIX: start qrLoading as false — loadTicket sets it to true only when QR is actually needed
  const [qrLoading,  setQrLoading]  = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // FIX: track qrUrl in a ref so the cleanup effect can always access latest value
  const qrUrlRef = useRef(null);
  useEffect(() => {
    qrUrlRef.current = qrUrl;
  }, [qrUrl]);

  const loadTicket = useCallback(async () => {
    try {
      const t = await api.getTicket(id, token);
      setTicket(t);
      if (t.status !== 'CANCELLED') {
        setQrLoading(true);
        // FIX: revoke previous object URL before creating a new one
        if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
        api.getTicketQr(id, token)
          .then(r => r.ok ? r.blob() : null)
          .then(b => {
            if (b) {
              const url = URL.createObjectURL(b);
              setQrUrl(url);
            }
          })
          .catch(() => {})
          .finally(() => setQrLoading(false));
      } else {
        setQrLoading(false);
      }
    } catch {
      toast('Ticket not found.', 'error');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  }, [id, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadTicket();
    // FIX: cleanup — revoke object URL on unmount
    return () => {
      if (qrUrlRef.current) URL.revokeObjectURL(qrUrlRef.current);
    };
  }, [loadTicket]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.cancelTicket(id, token);
      toast('Ticket cancelled. Contact the organiser for refund queries.', 'success');
      setShowCancel(false);
      await loadTicket();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <><TopBar title="Ticket" onMenuClick={openMenu} /><LoadingState /></>;

  // FIX: null-guard — shouldn't happen but prevents blank crash
  if (!ticket) return null;

  const ev = ticket.ticketType?.event || {};
  const tt = ticket.ticketType        || {};
  const isPurchased = ticket.status === 'PURCHASED';

  return (
    <>
      <TopBar
        title={`Ticket — ${shortId(ticket.id)}`}
        onMenuClick={openMenu}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>← All tickets</Button>
        }
      />

      <div className="app-content">
        <div className="page-wrap">
          <div className="ticket-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>

            {/* ── Left: Ticket details ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h1 style={{ fontSize: 20, marginBottom: 0 }}>{ev.name || 'Event'}</h1>
                <Badge status={ticket.status} />
              </div>

              <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
                <div className="card-header">
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>TICKET DETAILS</span>
                  <span className="mono small" style={{ color: 'var(--text-3)' }}>{shortId(ticket.id)}</span>
                </div>
                <div style={{ padding: 0 }}>
                  {[
                    ['Ticket ID',   <span className="mono small">{ticket.id}</span>],
                    ['Event',       ev.name],
                    ['Venue',       ev.venue],
                    ['Date',        fmtDateTime(ev.start)],
                    ['Ends',        fmtDateTime(ev.end)],
                    ['Ticket Type', tt.name],
                    ['Status',      <Badge status={ticket.status} />],
                  ].map(([l, v], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-2)', flexShrink: 0 }}>{l}</span>
                      <span style={{ fontSize: 13, textAlign: 'right' }}>{v || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {isPurchased && (
                <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}>
                  Cancel ticket
                </Button>
              )}

              {ticket.status === 'CANCELLED' && (
                <div className="alert alert-error">
                  This ticket has been cancelled and the QR code has been revoked.
                  For refund enquiries, contact the event organiser.
                </div>
              )}
            </div>

            {/* ── Right: QR code ── */}
            <div>
              <div className="qr-wrapper">
                {ticket.status === 'CANCELLED' ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'var(--error)', marginBottom: 8 }}>REVOKED</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Invalid for entry</div>
                  </div>
                ) : qrLoading ? (
                  <div style={{ padding: '48px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Spinner />
                  </div>
                ) : qrUrl ? (
                  <>
                    <img src={qrUrl} alt="Entry QR code" />
                    <div className="qr-label">
                      Scan at the gate for entry.<br />
                      One QR = one entry.
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', padding: '24px 0', textAlign: 'center' }}>
                    QR code unavailable.<br />Contact support.
                  </div>
                )}
              </div>

              {qrUrl && (
                <a
                  href={qrUrl}
                  download={`ticket-${shortId(ticket.id)}.png`}
                  style={{ display: 'block', marginTop: 8 }}
                >
                  <Button variant="ghost" size="sm" style={{ width: '100%' }}>
                    Download QR
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCancel && (
        <Modal
          title="Cancel ticket"
          onClose={() => setShowCancel(false)}
          footer={
            <>
              <Button onClick={() => setShowCancel(false)}>Keep ticket</Button>
              <Button variant="danger" disabled={cancelling} onClick={handleCancel}>
                {cancelling ? <><Spinner /> Cancelling…</> : 'Confirm cancellation'}
              </Button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>
            Cancelling this ticket will immediately revoke the QR code.
            The ticket will be marked as <strong>Cancelled</strong> and cannot be used for entry.
          </p>
          <div className="alert alert-info">
            No automatic refund is issued. Contact the event organiser for refund queries.
          </div>
        </Modal>
      )}
    </>
  );
}
