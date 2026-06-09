/**
 * pages/public/HomePage.jsx
 * Premium redesigned homepage — hero slider with organizer + attendee slides.
 * All existing API calls, routing, and business logic preserved.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/shared/EventCard';
import { LoadingState } from '../../components/ui/Spinner';
import * as api from '../../api';

// ─── useInView ────────────────────────────────────────────────────────────────
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.12, ...options }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── useCountUp ───────────────────────────────────────────────────────────────
function useCountUp(target, active, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return val;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#00d4b4', height = 36 }) {
  const w = 120, h = height;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h * 0.85 - h * 0.075;
    return `${x},${y}`;
  }).join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polygon points={fillPts} fill={color} opacity="0.12" />
    </svg>
  );
}

// ─── Slide visuals ────────────────────────────────────────────────────────────

function DashboardVisual({ active }) {
  const rev  = useCountUp(48320, active);
  const tkts = useCountUp(1247,  active);
  const val  = useCountUp(893,   active);
  const revenueData = [12,19,14,28,24,38,32,45,42,55,48,62];
  const ticketData  = [5,12,8,22,18,30,26,38,35,44,40,52];
  return (
    <div className="hp-mockup" style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)', transition: 'all 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s' }}>
      <div className="hp-mockup-bar">
        <span className="hp-dot" style={{ background: '#ff5f57' }} />
        <span className="hp-dot" style={{ background: '#febc2e' }} />
        <span className="hp-dot" style={{ background: '#28c840' }} />
        <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>dashboard — ticket platform</span>
      </div>
      <div className="hp-mockup-stats">
        {[
          { label: 'Total Revenue', value: `₹${rev.toLocaleString('en-IN')}`, delta: '+18%', data: revenueData, color: '#00d4b4' },
          { label: 'Tickets Sold',  value: tkts.toLocaleString(),             delta: '+24%', data: ticketData,  color: '#60a5fa' },
          { label: 'QR Validated',  value: val.toLocaleString(),              delta: '71%',  data: [40,48,52,55,60,58,65,70,68,75,72,80], color: '#34d399' },
        ].map((s, i) => (
          <div key={i} className="hp-mockup-stat">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 9, color: '#34d399', background: 'rgba(52,211,153,0.12)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.delta}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 4 }}>{s.value}</div>
            <Sparkline data={s.data} color={s.color} />
          </div>
        ))}
      </div>
      <div className="hp-mockup-events">
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Upcoming Events</div>
        {[
          { name: 'Tech Summit 2026',    tickets: '342 / 500', status: 'live'  },
          { name: 'Jazz Night Vol.4',    tickets: '198 / 300', status: 'live'  },
          { name: 'Workshop: UI Design', tickets: '45 / 60',   status: 'draft' },
        ].map((ev, i) => (
          <div key={i} className="hp-mockup-event-row">
            <div style={{ width: 28, height: 28, borderRadius: 6, background: `hsl(${i * 60 + 200},40%,20%)`, border: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🎪</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{ev.tickets} tickets</div>
            </div>
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: ev.status === 'live' ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)', color: ev.status === 'live' ? '#34d399' : 'var(--text-3)' }}>{ev.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketVisual({ active }) {
  return (
    <div style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)', transition: 'all 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Big ticket card */}
      <div className="hp-ticket-card hp-ticket-card--featured">
        <div className="hp-ticket-stub">
          <div className="hp-ticket-stub-inner">
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>VIP Pass</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 2 }}>Tech Summit 2026</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Sat, 14 Jun · Hall A · Bengaluru</div>
          </div>
          <div className="hp-ticket-tear" />
          <div className="hp-ticket-qr">
            <QRIcon />
            <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>TP-8F2K-9X1M</div>
          </div>
        </div>
        <div className="hp-ticket-badge">Confirmed ✓</div>
      </div>

      {/* Two smaller tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { name: 'Jazz Night Vol.4', date: '22 Jun', price: '₹499', color: '#5c3d8f', emoji: '🎵' },
          { name: 'Startup Demo Day', date: '28 Jun', price: 'Free',  color: '#1a5c3d', emoji: '🚀' },
        ].map((t, i) => (
          <div key={i} className="hp-ticket-mini">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 8, flexShrink: 0 }}>{t.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 3, lineHeight: 1.3 }}>{t.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>{t.date}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{t.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRValidateVisual({ active }) {
  const [scanPulse, setScanPulse] = useState(false);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setScanPulse(true), 600);
    return () => clearTimeout(t);
  }, [active]);
  return (
    <div style={{ opacity: active ? 1 : 0, transform: active ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)', transition: 'all 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s' }}>
      <div className="hp-mockup">
        <div className="hp-mockup-bar">
          <span className="hp-dot" style={{ background: '#ff5f57' }} />
          <span className="hp-dot" style={{ background: '#febc2e' }} />
          <span className="hp-dot" style={{ background: '#28c840' }} />
          <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>gate validation — staff view</span>
        </div>
        <div style={{ padding: '20px 20px 8px' }}>
          {/* Scanner box */}
          <div className={`hp-scanner-box${scanPulse ? ' hp-scanner-box--active' : ''}`}>
            <div className="hp-scanner-corner hp-scanner-corner--tl" />
            <div className="hp-scanner-corner hp-scanner-corner--tr" />
            <div className="hp-scanner-corner hp-scanner-corner--bl" />
            <div className="hp-scanner-corner hp-scanner-corner--br" />
            <div className={`hp-scanner-line${scanPulse ? ' hp-scanner-line--scan' : ''}`} />
            <QRIcon size={80} />
          </div>

          {/* Scan result */}
          <div className={`hp-scan-result${scanPulse ? ' hp-scan-result--show' : ''}`}>
            <div className="hp-scan-check">✓</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Valid Ticket</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Rahul Sharma · General Admission</div>
            </div>
          </div>

          {/* Recent scans */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recent Scans</div>
            {[
              { name: 'Priya Nair',    time: '2s ago',  ok: true },
              { name: 'Arjun Mehta',  time: '1m ago',  ok: true },
              { name: 'Unknown',      time: '3m ago',  ok: false },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 10, width: 16, height: 16, borderRadius: '50%', background: s.ok ? 'rgba(52,211,153,0.15)' : 'rgba(224,85,85,0.15)', color: s.ok ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.ok ? '✓' : '✕'}</span>
                <span style={{ fontSize: 11, color: 'var(--text)', flex: 1, fontWeight: 500 }}>{s.name}</span>
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QRIcon({ size = 48 }) {
  const s = size, c = s * 0.18, g = s * 0.08;
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <rect x="4"  y="4"  width="16" height="16" rx="2" stroke="var(--text)" strokeWidth="2" fill="none"/>
      <rect x="8"  y="8"  width="8"  height="8"  rx="1" fill="var(--text)"/>
      <rect x="28" y="4"  width="16" height="16" rx="2" stroke="var(--text)" strokeWidth="2" fill="none"/>
      <rect x="32" y="8"  width="8"  height="8"  rx="1" fill="var(--text)"/>
      <rect x="4"  y="28" width="16" height="16" rx="2" stroke="var(--text)" strokeWidth="2" fill="none"/>
      <rect x="8"  y="32" width="8"  height="8"  rx="1" fill="var(--text)"/>
      <rect x="28" y="28" width="5" height="5" rx="1" fill="var(--text)"/>
      <rect x="35" y="28" width="9" height="5" rx="1" fill="var(--text)"/>
      <rect x="28" y="35" width="9" height="5" rx="1" fill="var(--text)"/>
      <rect x="39" y="35" width="5" height="9" rx="1" fill="var(--text)"/>
    </svg>
  );
}

// ─── Hero slides data ─────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    id: 'organizer',
    eyebrow: 'For Event Organizers',
    headline: <>Run Events.<br /><span className="hp-headline-accent">Not Spreadsheets.</span></>,
    sub: 'Create events, sell tickets, validate attendees with QR codes, and manage registrations — all from one modern platform.',
    ctas: [
      { label: 'Create Event', primary: true, to: '/login', arrow: true },
      { label: 'Browse Events', primary: false, to: '/browse' },
    ],
    trust: ['Free to start', 'QR validation included', 'Razorpay payments'],
    Visual: DashboardVisual,
  },
  {
    id: 'attendee',
    eyebrow: 'For Attendees',
    headline: <>Your Ticket,<br /><span className="hp-headline-accent">Instantly Delivered.</span></>,
    sub: 'Book your spot at the best events in seconds. Pay securely, get your QR ticket by email, and walk straight in.',
    ctas: [
      { label: 'Browse Events', primary: true, to: '/browse', arrow: true },
      { label: 'Create Account', primary: false, to: '/register' },
    ],
    trust: ['Secure Razorpay checkout', 'Instant QR on email', 'One tap at the gate'],
    Visual: TicketVisual,
  },
  {
    id: 'validate',
    eyebrow: 'For Event Staff',
    headline: <>Gate Check<br /><span className="hp-headline-accent">Done in Seconds.</span></>,
    sub: 'Scan QR codes with any smartphone. Prevent duplicates, track real-time attendance, and run a smooth entry experience.',
    ctas: [
      { label: 'Get Started Free', primary: true, to: '/register', arrow: true },
      { label: 'Learn More', primary: false, to: '/browse' },
    ],
    trust: ['Works on any phone', 'Prevents duplicate entry', 'Real-time attendance count'],
    Visual: QRValidateVisual,
  },
];

// ─── Checkmark SVG ────────────────────────────────────────────────────────────
function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M10 3L5 9 2 6" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Arrow SVG ────────────────────────────────────────────────────────────────
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── HeroSlider ───────────────────────────────────────────────────────────────
function HeroSlider({ navigate }) {
  const [current,  setCurrent]  = useState(0);
  const [prev,     setPrev]     = useState(null);
  const [dir,      setDir]      = useState(1);   // 1 = forward, -1 = backward
  const [animating, setAnimating] = useState(false);
  const [visible,  setVisible]  = useState(false);
  const autoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback((idx, d = 1) => {
    if (animating || idx === current) return;
    setDir(d);
    setPrev(current);
    setAnimating(true);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 520);
  }, [animating, current]);

  const next = useCallback(() => goTo((current + 1) % HERO_SLIDES.length, 1),  [current, goTo]);
  const prev2 = useCallback(() => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length, -1), [current, goTo]);

  // Auto-advance every 6s
  useEffect(() => {
    autoRef.current = setInterval(next, 6000);
    return () => clearInterval(autoRef.current);
  }, [next]);

  const resetAuto = () => { clearInterval(autoRef.current); autoRef.current = setInterval(next, 6000); };

  const slide = HERO_SLIDES[current];
  const { Visual } = slide;

  return (
    <section className="hp-hero">
      {/* Progress bar */}
      <div className="hp-slider-progress">
        <div
          key={current}
          className="hp-slider-progress-fill"
          style={{ animationDuration: '6s' }}
        />
      </div>

      <div className="hp-hero-inner">
        {/* ── Left: copy ── */}
        <div className="hp-hero-copy">
          <div
            key={`eyebrow-${current}`}
            className="hp-eyebrow hp-slide-in"
            style={{ opacity: visible ? 1 : 0, animationDelay: '0.05s' }}
          >
            <span className="hp-eyebrow-dot" />
            {slide.eyebrow}
          </div>

          <h1 key={`h1-${current}`} className="hp-headline hp-slide-in" style={{ animationDelay: '0.12s' }}>
            {slide.headline}
          </h1>

          <p key={`sub-${current}`} className="hp-subheadline hp-slide-in" style={{ animationDelay: '0.22s' }}>
            {slide.sub}
          </p>

          <div key={`cta-${current}`} className="hp-hero-ctas hp-slide-in" style={{ animationDelay: '0.3s' }}>
            {slide.ctas.map((c, i) => (
              <button
                key={i}
                className={c.primary ? 'hp-btn-primary' : 'hp-btn-secondary'}
                onClick={() => navigate(c.to)}
              >
                {c.label}
                {c.arrow && <Arrow />}
              </button>
            ))}
          </div>

          <div key={`trust-${current}`} className="hp-trust hp-slide-in" style={{ animationDelay: '0.38s' }}>
            {slide.trust.map((t, i) => (
              <span key={i} className="hp-trust-item">
                {i > 0 && <span className="hp-trust-sep" />}
                <Check /> {t}
              </span>
            ))}
          </div>

          {/* Slide nav dots + arrows */}
          <div className="hp-slider-nav">
            <button className="hp-slider-arrow" onClick={() => { prev2(); resetAuto(); }} aria-label="Previous slide">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div className="hp-slider-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`hp-slider-dot${i === current ? ' hp-slider-dot--active' : ''}`}
                  onClick={() => { goTo(i, i > current ? 1 : -1); resetAuto(); }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button className="hp-slider-arrow" onClick={() => { next(); resetAuto(); }} aria-label="Next slide">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>

        {/* ── Right: visual ── */}
        <div className="hp-hero-visual" key={`visual-${current}`}>
          <Visual active={visible} />
        </div>
      </div>
    </section>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay = 0, inView }) {
  return (
    <div
      className="hp-feature-card"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <div className="hp-feature-icon">{icon}</div>
      <h3 className="hp-feature-title">{title}</h3>
      <p className="hp-feature-desc">{desc}</p>
    </div>
  );
}

// ─── Step card ────────────────────────────────────────────────────────────────
function StepCard({ num, title, desc, delay = 0, inView }) {
  return (
    <div
      className="hp-step"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div className="hp-step-num">{num}</div>
      <div>
        <div className="hp-step-title">{title}</div>
        <div className="hp-step-desc">{desc}</div>
      </div>
      {num < 4 && <div className="hp-step-connector" />}
    </div>
  );
}

// ─── BigChart ─────────────────────────────────────────────────────────────────
function BigChart({ active }) {
  const data = [32,45,38,58,52,72,65,88,80,95,105,118];
  const max  = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: active ? `${(v / max) * 100}%` : '4px',
          background: i === data.length - 1 ? 'var(--accent)' : `rgba(232,160,70,${0.25 + (v / max) * 0.45})`,
          borderRadius: '3px 3px 0 0',
          transition: `height 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 40}ms`,
        }} />
      ))}
    </div>
  );
}

// ─── EventsCarousel ───────────────────────────────────────────────────────────
function EventsCarousel({ events, navigate, inView }) {
  const [paused, setPaused] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  // Duplicate enough times so the loop is seamless at any screen width
  const items = events.length > 0 ? [...events, ...events, ...events] : [];

  return (
    <div
      className={`hp-carousel-outer${inView ? ' hp-carousel-outer--visible' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => { setPaused(false); setHoveredId(null); }}
    >
      {/* Fade-edge masks */}
      <div className="hp-carousel-fade hp-carousel-fade--left" />
      <div className="hp-carousel-fade hp-carousel-fade--right" />

      <div className={`hp-carousel-track${paused ? ' hp-carousel-track--paused' : ''}`}>
        {items.map((e, i) => (
          <div
            key={`${e.id}-${i}`}
            className={`hp-carousel-item${hoveredId === `${e.id}-${i}` ? ' hp-carousel-item--hovered' : ''}`}
            onMouseEnter={() => setHoveredId(`${e.id}-${i}`)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => navigate(`/events/${e.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={ev => ev.key === 'Enter' && navigate(`/events/${e.id}`)}
          >
            <EventCard event={e} onClick={() => navigate(`/events/${e.id}`)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  const [featRef,  featInView]  = useInView();
  const [stepsRef, stepsInView] = useInView();
  const [statsRef, statsInView] = useInView();
  const [evRef,    evInView]    = useInView();
  const [ctaRef,   ctaInView]   = useInView();

  useEffect(() => {
    api.getPublishedEvents(0, 6)
      .then(d => setEvents(d?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="hp-root">
      <div className="hp-bg-glow hp-bg-glow-1" />
      <div className="hp-bg-glow hp-bg-glow-2" />

      {/* ════════ HERO SLIDER ════════ */}
      <HeroSlider navigate={navigate} />

      {/* ════════ FEATURES ════════ */}
      <section className="hp-section hp-features-section" ref={featRef}>
        <div className="hp-section-inner">
          <div className="hp-section-label" style={{ opacity: featInView ? 1 : 0, transition: 'opacity 0.4s ease 0.1s' }}>Platform Features</div>
          <h2 className="hp-section-title" style={{ opacity: featInView ? 1 : 0, transform: featInView ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.45s ease 0.15s' }}>
            Everything you need to run a great event
          </h2>
          <div className="hp-features-grid">
            {[
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="2" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M7 11l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>, title: 'QR Validation', desc: 'Prevent duplicate entries with secure, single-use QR codes. Staff scan instantly at the gate.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h16" stroke="currentColor" strokeWidth="1.5"/></svg>, title: 'Instant Ticket Delivery', desc: 'Attendees receive their QR ticket by email the moment payment is confirmed. No delays.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="3" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M6 8h10M6 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, title: 'Organizer Dashboard', desc: 'Manage attendees, track ticket sales, and monitor event capacity in real-time.' },
              { icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 17L8 11l4 4 3-5 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="17" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>, title: 'Live Analytics', desc: 'Track registrations, revenue, and ticket sales in real-time with charts and exportable data.' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 80} inView={featInView} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURED EVENTS — INFINITE CAROUSEL ════════ */}
      <section className="hp-section hp-carousel-section" ref={evRef}>
        {/* Header stays inside max-width container */}
        <div className="hp-section-inner">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="hp-section-label" style={{ opacity: evInView ? 1 : 0, transition: 'opacity 0.4s ease' }}>Live Now</div>
              <h2 className="hp-section-title" style={{ marginBottom: 0, opacity: evInView ? 1 : 0, transform: evInView ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.45s ease 0.1s' }}>
                Upcoming Events
              </h2>
            </div>
            <button className="hp-btn-ghost" onClick={() => navigate('/browse')} style={{ opacity: evInView ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
              View all events →
            </button>
          </div>
        </div>

        {/* Full-width carousel track — bleeds past container */}
        {loading ? (
          <div className="hp-section-inner"><LoadingState /></div>
        ) : events.length === 0 ? (
          <div className="hp-section-inner">
            <div className="hp-empty-events">
              <div className="hp-empty-icon">🎟</div>
              <div className="hp-empty-title">No events published yet</div>
              <div className="hp-empty-sub">Be the first to create an event on the platform.</div>
              <button className="hp-btn-primary" onClick={() => navigate('/login')} style={{ marginTop: 20 }}>Create Event</button>
            </div>
          </div>
        ) : (
          <EventsCarousel events={events} navigate={navigate} inView={evInView} />
        )}
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="hp-section hp-steps-section" ref={stepsRef}>
        <div className="hp-section-inner">
          <div className="hp-section-label" style={{ opacity: stepsInView ? 1 : 0, transition: 'opacity 0.4s ease' }}>Process</div>
          <h2 className="hp-section-title" style={{ opacity: stepsInView ? 1 : 0, transform: stepsInView ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.45s ease 0.1s' }}>
            From setup to sold out in minutes
          </h2>
          <p className="hp-section-sub" style={{ opacity: stepsInView ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
            Designed for event organizers who want to spend time on the event, not the admin.
          </p>
          <div className="hp-steps-grid">
            {[
              { num: 1, title: 'Create Your Event',  desc: 'Set up event details, venue, dates, and ticket types in under 5 minutes.' },
              { num: 2, title: 'Publish & Sell',     desc: 'Go live instantly. Accept payments via Razorpay — UPI, cards, net banking.' },
              { num: 3, title: 'Validate at Gate',   desc: 'Staff scan QR codes with any smartphone. Each code works exactly once.' },
              { num: 4, title: 'Track Performance',  desc: 'Monitor revenue, attendance, and capacity in real-time from your dashboard.' },
            ].map((s, i) => <StepCard key={i} {...s} delay={i * 100} inView={stepsInView} />)}
          </div>
        </div>
      </section>

      {/* ════════ DASHBOARD SHOWCASE ════════ */}
      <section className="hp-section hp-showcase-section" ref={statsRef}>
        <div className="hp-section-inner hp-showcase-inner">
          <div className="hp-showcase-copy">
            <div className="hp-section-label" style={{ opacity: statsInView ? 1 : 0, transition: 'opacity 0.4s ease' }}>Organizer Dashboard</div>
            <h2 className="hp-section-title" style={{ opacity: statsInView ? 1 : 0, transform: statsInView ? 'translateY(0)' : 'translateY(12px)', transition: 'all 0.45s ease 0.1s' }}>
              Command center for every event
            </h2>
            <p className="hp-section-sub" style={{ opacity: statsInView ? 1 : 0, transition: 'opacity 0.4s ease 0.2s' }}>
              Every metric you need, in one focused view. No spreadsheets, no guesswork.
            </p>
            <div className="hp-showcase-metrics">
              {[
                { label: 'Revenue tracked',    val: '₹48K+',  sub: 'across all events' },
                { label: 'Tickets validated',  val: '1,200+', sub: 'QR scans processed' },
                { label: 'Avg. time to setup', val: '< 5 min',sub: 'from idea to live' },
              ].map((m, i) => (
                <div key={i} className="hp-showcase-metric" style={{ opacity: statsInView ? 1 : 0, transform: statsInView ? 'translateY(0)' : 'translateY(16px)', transition: `all 0.45s ease ${0.2 + i * 0.1}s` }}>
                  <div className="hp-showcase-metric-val">{m.val}</div>
                  <div className="hp-showcase-metric-label">{m.label}</div>
                  <div className="hp-showcase-metric-sub">{m.sub}</div>
                </div>
              ))}
            </div>
            <button className="hp-btn-primary" onClick={() => navigate('/register')} style={{ opacity: statsInView ? 1 : 0, transition: 'opacity 0.4s ease 0.5s' }}>
              Start organizing <Arrow />
            </button>
          </div>
          <div className="hp-showcase-visual" style={{ opacity: statsInView ? 1 : 0, transform: statsInView ? 'translateX(0)' : 'translateX(32px)', transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s' }}>
            <div className="hp-big-mockup">
              <div className="hp-mockup-bar">
                <span className="hp-dot" style={{ background: '#ff5f57' }} />
                <span className="hp-dot" style={{ background: '#febc2e' }} />
                <span className="hp-dot" style={{ background: '#28c840' }} />
                <span style={{ marginLeft: 12, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>analytics — ticket platform</span>
              </div>
              <div style={{ padding: 16 }}>
                <div className="hp-big-chart">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>Revenue — Last 12 weeks</span>
                    <span style={{ fontSize: 11, color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>+18% ↑</span>
                  </div>
                  <BigChart active={statsInView} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                  {[
                    { label: 'Top Event',   val: 'Tech Summit 2026', sub: '342 tickets sold' },
                    { label: 'This Week',   val: '₹12,480',          sub: '+31% vs last week' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)', letterSpacing: '-0.3px' }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ SOCIAL PROOF ════════ */}
      <section className="hp-section hp-proof-section">
        <div className="hp-section-inner">
          <div className="hp-section-label">Trusted by organizers</div>
          <h2 className="hp-section-title">Used by real events, real people</h2>
          <div className="hp-testimonials">
            {[
              { quote: "Set up our college fest ticketing in one afternoon. The QR validation at the gate saved us hours of manual checks.", author: "Arjun Mehta", role: "Cultural Fest Organizer", avatar: "AM", tag: "College Festival" },
              { quote: "We moved from Google Forms + spreadsheets to this platform. Night and day difference in managing our workshops.", author: "Priya Nair", role: "Workshop Coordinator", avatar: "PN", tag: "Tech Workshop" },
              { quote: "The dashboard gives me everything I need — who's paid, who's attended, how much we've collected. Simple and fast.", author: "Rahul Verma", role: "Conference Organizer", avatar: "RV", tag: "Industry Conference" },
            ].map((t, i) => (
              <div key={i} className="hp-testimonial">
                <div className="hp-testimonial-tag">{t.tag}</div>
                <p className="hp-testimonial-quote">"{t.quote}"</p>
                <div className="hp-testimonial-author">
                  <div className="hp-testimonial-avatar">{t.avatar}</div>
                  <div>
                    <div className="hp-testimonial-name">{t.author}</div>
                    <div className="hp-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="hp-section hp-cta-section" ref={ctaRef}>
        <div className="hp-section-inner">
          <div className="hp-cta-box" style={{ opacity: ctaInView ? 1 : 0, transform: ctaInView ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.55s cubic-bezier(0.22,1,0.36,1)' }}>
            <div className="hp-cta-glow" />
            <div className="hp-section-label" style={{ textAlign: 'center', marginBottom: 12 }}>For Organizers</div>
            <h2 className="hp-cta-title">Ready to run your next event?</h2>
            <p className="hp-cta-sub">Free to start. No credit card required. Set up your first event in minutes.</p>
            <div className="hp-cta-actions">
              <button className="hp-btn-primary hp-btn-large" onClick={() => navigate('/register')}>
                Get started — it's free <Arrow />
              </button>
              <button className="hp-btn-ghost hp-btn-large" onClick={() => navigate('/browse')}>
                Browse live events
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
