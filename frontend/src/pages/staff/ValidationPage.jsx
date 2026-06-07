/**
 * pages/staff/ValidationPage.jsx
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import * as api from '../../api';

// ─── CSS injected once ────────────────────────────────────────────────────────
const STYLES = `
@keyframes vn-backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes vn-card-in {
  0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
  70%  { transform: translate(-50%, -50%) scale(1.06); }
  100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes vn-icon-pop {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
  60%  { transform: scale(1.3) rotate(6deg);  opacity: 1; }
  100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
}
@keyframes vn-shimmer {
  0%   { background-position: -400% center; }
  100% { background-position:  400% center; }
}
@keyframes vn-ring {
  0%   { transform: translate(-50%,-50%) scale(0.8); opacity: 0.8; }
  100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
}
@keyframes vn-shake {
  0%,100% { transform: translate(-50%,-50%) scale(1) rotate(0deg); }
  15%      { transform: translate(-50%,-50%) scale(1) rotate(-2deg) translateX(-8px); }
  30%      { transform: translate(-50%,-50%) scale(1) rotate(2deg)  translateX(8px); }
  45%      { transform: translate(-50%,-50%) scale(1) rotate(-1deg) translateX(-5px); }
  60%      { transform: translate(-50%,-50%) scale(1) rotate(1deg)  translateX(5px); }
  75%      { transform: translate(-50%,-50%) scale(1) rotate(0deg)  translateX(-2px); }
}
@keyframes vn-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}
@keyframes vn-progress {
  from { width: 100%; }
  to   { width: 0%; }
}

.vn-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: vn-backdrop-in 0.15s ease forwards;
}
.vn-overlay.valid   { background: rgba(5, 46, 22, 0.82); }
.vn-overlay.invalid { background: rgba(69, 10, 10, 0.82); }
.vn-overlay.notfound{ background: rgba(67, 31, 2, 0.82); }

.vn-card {
  position: absolute;
  top: 50%; left: 50%;
  width: min(480px, 90vw);
  border-radius: 24px;
  padding: 48px 40px 40px;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  animation: vn-card-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
  overflow: hidden;
}
.vn-card.valid    { background: linear-gradient(145deg, #14532d, #166534); }
.vn-card.invalid  { background: linear-gradient(145deg, #7f1d1d, #991b1b); }
.vn-card.notfound { background: linear-gradient(145deg, #78350f, #92400e); }
.vn-card.shake    { animation: vn-card-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards,
                               vn-shake 0.5s ease 0.35s forwards; }

.vn-ring {
  position: absolute;
  top: 50%; left: 50%;
  width: 180px; height: 180px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.35);
  animation: vn-ring 1s ease-out forwards;
  pointer-events: none;
}
.vn-ring2 { animation-delay: 0.25s; }
.vn-ring3 { animation-delay: 0.5s; }

.vn-icon {
  font-size: 96px;
  line-height: 1;
  display: block;
  margin: 0 auto 20px;
  animation: vn-icon-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) 0.15s both;
  filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4));
}
.vn-title {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
  margin-bottom: 10px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.vn-detail {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 28px;
}
.vn-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg,
    transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%);
  background-size: 400% 100%;
  animation: vn-shimmer 1.8s ease infinite;
  pointer-events: none;
}
.vn-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.15);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.vn-progress-fill {
  height: 100%;
  background: rgba(255,255,255,0.55);
  border-radius: 2px;
  animation: vn-progress linear forwards;
}
`;

// Inject styles once
if (!document.getElementById('vn-styles')) {
  const el = document.createElement('style');
  el.id = 'vn-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ─── Web Audio sounds ─────────────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    if (type === 'valid') {
      // Bright rising triumphant chord: C5 → E5 → G5
      [[523.25, 0, 0.18], [659.25, 0.12, 0.22], [783.99, 0.22, 0.35]].forEach(([freq, start, dur]) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      });
      // Extra sparkle overtone
      const osc2 = ctx.createOscillator();
      const g2   = ctx.createGain();
      osc2.connect(g2); g2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.value = 1046.5;
      g2.gain.setValueAtTime(0, ctx.currentTime + 0.28);
      g2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.33);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      osc2.start(ctx.currentTime + 0.28);
      osc2.stop(ctx.currentTime + 0.75);

    } else {
      // Low dull thud + descending buzz for invalid/error
      // Deep thud
      const thud  = ctx.createOscillator();
      const tGain = ctx.createGain();
      thud.connect(tGain); tGain.connect(ctx.destination);
      thud.type = 'sawtooth';
      thud.frequency.setValueAtTime(180, ctx.currentTime);
      thud.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
      tGain.gain.setValueAtTime(0.35, ctx.currentTime);
      tGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      thud.start(ctx.currentTime);
      thud.stop(ctx.currentTime + 0.35);

      // Short buzz
      const buzz  = ctx.createOscillator();
      const bGain = ctx.createGain();
      const dist  = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
      }
      dist.curve = curve;
      buzz.connect(dist); dist.connect(bGain); bGain.connect(ctx.destination);
      buzz.type = 'square';
      buzz.frequency.setValueAtTime(220, ctx.currentTime + 0.05);
      buzz.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);
      bGain.gain.setValueAtTime(0.18, ctx.currentTime + 0.05);
      bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      buzz.start(ctx.currentTime + 0.05);
      buzz.stop(ctx.currentTime + 0.45);
    }
  } catch {
    // AudioContext not available — silently skip
  }
}

// ─── Full-screen notification overlay ────────────────────────────────────────
const DISPLAY_MS = 3000;

function ValidationNotification({ result, onDone }) {
  useEffect(() => {
    playSound(result.variant === 'valid' ? 'valid' : 'invalid');
    const t = setTimeout(onDone, DISPLAY_MS);
    return () => clearTimeout(t);
  }, [result, onDone]);

  const cfg = {
    valid:    { icon: '✅', title: 'Entry Granted',     detail: result.detail },
    invalid:  { icon: '🚫', title: 'Entry Denied',      detail: result.detail },
    notfound: { icon: '❓', title: 'Ticket Not Found',  detail: result.detail },
  }[result.variant];

  const isInvalid = result.variant !== 'valid';

  return (
    <div className={`vn-overlay ${result.variant}`} onClick={onDone}>
      {/* Ripple rings — only on valid */}
      {!isInvalid && <>
        <div className="vn-ring"  />
        <div className="vn-ring vn-ring2" />
        <div className="vn-ring vn-ring3" />
      </>}

      <div className={`vn-card ${result.variant} ${isInvalid ? 'shake' : ''}`}
           onClick={e => e.stopPropagation()}>
        <div className="vn-shimmer" />

        <span className="vn-icon">{cfg.icon}</span>
        <div className="vn-title">{cfg.title}</div>
        <div className="vn-detail">{cfg.detail}</div>

        <div className="vn-progress-bar">
          <div
            className="vn-progress-fill"
            style={{ animationDuration: `${DISPLAY_MS}ms` }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          tap anywhere to dismiss
        </div>
      </div>
    </div>
  );
}

// ─── Result resolver ──────────────────────────────────────────────────────────
function resolveResult(response, error, errorStatus) {
  if (error) {
    if (errorStatus === 404) return { variant: 'notfound', detail: 'No ticket exists with that ID.' };
    if (errorStatus === 400) return { variant: 'invalid',  detail: error };
    return { variant: 'invalid', detail: error };
  }
  if (response?.status === 'VALID') return { variant: 'valid', detail: 'Ticket is valid — welcome in!' };
  return { variant: 'invalid', detail: 'This ticket has already been scanned.' };
}

// ─── QR Cooldown ─────────────────────────────────────────────────────────────
const QR_COOLDOWN_MS = 3001;

// ─── QR Scanner component ────────────────────────────────────────────────────
function QrScanner({ onScan, onError }) {
  const scannerRef    = useRef(null);
  const lastScannedAt = useRef(0);
  const lastScannedId = useRef('');

  useEffect(() => {
    let html5QrCode;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            const now = Date.now();
            if (decodedText === lastScannedId.current && now - lastScannedAt.current < QR_COOLDOWN_MS) return;
            lastScannedId.current = decodedText;
            lastScannedAt.current = now;
            onScan(decodedText);
          },
          undefined
        );
      } catch (err) {
        onError(err?.message || 'Camera not available');
      }
    };
    startScanner();
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      <div id="qr-reader" style={{ width: '100%', borderRadius: 'var(--r2,8px)', overflow: 'hidden', border: '2px solid var(--border,#e5e7eb)' }} />
      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text-2)', textAlign: 'center' }}>
        Point the camera at a ticket QR code — 3-second cooldown per scan
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ValidationPage() {
  const { openMenu }            = useOutletContext();
  const { token, user, logout } = useAuth();
  const { toast }               = useToast();
  const navigate                = useNavigate();

  const [mode,       setMode]       = useState('manual');
  const [ticketId,   setTicketId]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [notification, setNotif]    = useState(null);   // result shown in overlay
  const [history,    setHistory]    = useState([]);
  const [qrError,    setQrError]    = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!token || !user) navigate('/login', { replace: true });
  }, [token, user, navigate]);

  const dismissNotif = useCallback(() => {
    setNotif(null);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  // ── Core validation ─────────────────────────────────────────────────────────
  const submitValidation = useCallback(async (id, method) => {
    const tid = id.trim();
    if (!tid || loading) return;
    setLoading(true);
    setNotif(null);
    try {
      const r        = await api.validateTicket({ id: tid, method }, token);
      const resolved = resolveResult(r, null, null);
      setNotif(resolved);
      setHistory(h => [{ ticketId: tid, valid: r?.status === 'VALID', time: new Date() }, ...h.slice(0, 9)]);
    } catch (e) {
      const resolved = resolveResult(null, e.message, e.status);
      setNotif(resolved);
      setHistory(h => [{ ticketId: tid, valid: false, time: new Date() }, ...h.slice(0, 9)]);
    } finally {
      setLoading(false);
      setTicketId('');
    }
  }, [loading, token]);

  const handleManualValidate = () => submitValidation(ticketId, 'MANUAL');
  const handleKey = (e) => { if (e.key === 'Enter') handleManualValidate(); };
  const handleQrScan  = useCallback((d) => { if (!loading) submitValidation(d, 'QR_SCAN'); }, [loading, submitValidation]);
  const handleQrError = (msg) => setQrError(msg);

  const switchMode = (m) => {
    setMode(m); setTicketId(''); setQrError(null); setNotif(null);
    if (m === 'manual') setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleLogout = () => { logout(); toast('Signed out.', 'info'); navigate('/login'); };

  return (
    <>
      {/* Full-screen notification overlay */}
      {notification && (
        <ValidationNotification result={notification} onDone={dismissNotif} />
      )}

      <TopBar
        title="Ticket Validation"
        onMenuClick={openMenu}
        actions={<Button variant="ghost" onClick={handleLogout} style={{ fontSize: 13 }}>Sign out</Button>}
      />

      <div className="app-content">
        <div style={{ maxWidth: 600 }}>

          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, marginBottom: 4 }}>Validate ticket</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              {mode === 'manual' ? 'Enter a ticket UUID and press Enter or click Validate.' : 'Point the camera at a ticket QR code to scan automatically.'}
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['manual', 'qr'].map((m) => (
              <button key={m} onClick={() => switchMode(m)} style={{
                padding: '6px 16px', borderRadius: 'var(--r2,6px)',
                border: '1px solid var(--border,#e5e7eb)',
                background: mode === m ? 'var(--accent,#2563eb)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-1)',
                cursor: 'pointer', fontSize: 13, fontWeight: mode === m ? 600 : 400,
              }}>
                {m === 'manual' ? '⌨ Manual' : '📷 QR Scan'}
              </button>
            ))}
          </div>

          {/* Manual input */}
          {mode === 'manual' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input
                ref={inputRef}
                className="input input-mono"
                placeholder="Enter ticket UUID…"
                value={ticketId}
                onChange={e => setTicketId(e.target.value)}
                onKeyDown={handleKey}
                style={{ flex: 1, fontSize: 13 }}
                autoFocus disabled={loading}
              />
              <Button variant="primary" disabled={loading || !ticketId.trim()} onClick={handleManualValidate} style={{ flexShrink: 0, minWidth: 100 }}>
                {loading ? <><Spinner /> Checking…</> : 'Validate'}
              </Button>
            </div>
          )}

          {/* QR mode */}
          {mode === 'qr' && (
            <>
              {qrError
                ? <div className="alert alert-error" style={{ marginBottom: 20 }}>Camera error: {qrError}. Please allow camera access or switch to Manual mode.</div>
                : <QrScanner onScan={handleQrScan} onError={handleQrError} />
              }
              {loading && <div style={{ textAlign: 'center', marginBottom: 12 }}><Spinner /> Validating…</div>}
            </>
          )}

          <div className="alert alert-info" style={{ marginBottom: 24 }}>
            Each QR code allows one valid entry. A second scan shows "Entry Denied". Cancelled tickets are always rejected.
          </div>

          {/* Session history */}
          {history.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Session history
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead><tr><th>Ticket ID</th><th>Result</th><th>Time</th></tr></thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i}>
                        <td><span className="mono small" style={{ color: 'var(--text-2)' }}>{h.ticketId.length > 16 ? h.ticketId.slice(0,16)+'…' : h.ticketId}</span></td>
                        <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: h.valid ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>{h.valid ? 'VALID' : 'INVALID'}</span></td>
                        <td className="mono small muted">{h.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
