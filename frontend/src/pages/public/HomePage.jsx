/**
 * pages/public/HomePage.jsx
 * Landing page — features upcoming events.
 *
 * FIX: getPublishedEvents no longer takes a token (public endpoint).
 *      Added dependency array [] to useEffect to silence exhaustive-deps warning.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/shared/EventCard';
import { ImageSlider } from '../../components/shared/ImageSlider';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';
import * as api from '../../api';

// ─── Slider images ─────────────────────────────────────────────────────────
// Replace these URLs with your own images (host them anywhere publicly accessible).
// Each slide: { url, caption, sub }  — caption and sub are optional overlay text.
const SLIDES = [
  {
    url:     'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/Gemini_Generated_Image_8gcf6z8gcf6z8gcf_mpa0pq',
    caption: 'Fun Events',
    sub:     'Meet the minds shaping tomorrow',
  },
  {
    url:     'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/Gemini_Generated_Image_qya52eqya52eqya5_lgknih',
    caption: 'Live Music & Concerts',
    sub:     'Feel the energy, book your spot',
  },
  {
    url:     'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/Gemini_Generated_Image_420bkk420bkk420b_odk9yv',
    caption: 'Tech & Innovation Summits',
    sub:     'Learn. Network. Grow.',
  },
  {
    url:     'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/Gemini_Generated_Image_8hpvkg8hpvkg8hpv_bs9ws9',
    caption: 'Festivals & Cultural Events',
    sub:     'Celebrate what matters',
  },
];

// ─── Event categories ───────────────────────────────────────────────────────
// ─── Event categories ───────────────────────────────────────────────────────
// Replace each `img` URL with your own Cloudinary/hosted image.
const CATEGORIES = [
  {
    label: 'Music',
    desc:  'Concerts, festivals & live shows',
    img:   'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/event-slider-wordpress_aosfto',
  },
  {
    label: 'Technology',
    desc:  'Hackathons, summits & meetups',
    img:   'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/images_xvkxmx',
  },
  {
    label: 'Arts & Culture',
    desc:  'Theatre, exhibitions & film',
    img:   'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/pexels-photo-33953257_h7r4sl',
  },
  {
    label: 'Sports',
    desc:  'Marathons, tournaments & fitness',
    img:   'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/images_1_vlvman',
  },
  {
    label: 'Food & Drink',
    desc:  'Tastings, workshops & pop-ups',
    img:   'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/National-Street-Food-Festival_mvr17c',
  },
  {
    label: 'Education',
    desc:  'Workshops, talks & bootcamps',
    img:   'https://res.cloudinary.com/djjnaehtk/image/upload/f_auto,q_auto/images_2_sjrhon',
  },
];

// ─── Platform features ──────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant QR tickets',
    desc: 'QR codes delivered to email the moment payment is confirmed. No waiting, no printing.',
  },
  {
    icon: '🔒',
    title: 'Secure payments',
    desc: 'Powered by Razorpay — India\'s most trusted payment gateway. UPI, cards, net banking.',
  },
  {
    icon: '📊',
    title: 'Organiser dashboard',
    desc: 'Real-time ticket sales, capacity tracking, and event management in one place.',
  },
  {
    icon: '✅',
    title: 'Gate validation',
    desc: 'Staff scan QR codes at the entrance. Each code works exactly once.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPublishedEvents(0, 6)
      .then(d => setEvents(d?.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // FIX: dependency array was missing

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }} className="fade-in">

      {/* ── Hero ── */}
      <div style={{ padding: '64px 0 48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
              Event Ticketing Platform
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 14 }}>
              Events.<br />
              <span style={{ color: 'var(--accent)' }}>Tickets.</span><br />
              Simple.
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15, maxWidth: 420, lineHeight: 1.7, marginBottom: 28 }}>
              A no-fuss ticketing platform for organisers and attendees.
              Create events, sell tickets, validate entries — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/browse')}>Browse events</Button>
              <Button size="lg" onClick={() => navigate('/register')}>Create account</Button>
            </div>
          </div>

          <div
            className="hide-mobile"
            style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', borderRadius: 'var(--r3)', overflow: 'hidden', flexShrink: 0 }}
          >
            {[['2,400+', 'Events'], ['100K+', 'Tickets sold'], ['580+', 'Organisers']].map(([v, l]) => (
              <div key={l} style={{ background: 'var(--surface)', padding: '18px 28px', minWidth: 160 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: 'var(--text)', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Image Slider ── */}
      <div style={{ padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
        <ImageSlider slides={SLIDES} height={380} interval={4500} />
      </div>

      {/* ── Event Categories ── */}
      <div style={{ padding: '40px 0 36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
              Explore by category
            </div>
            <h2 style={{ fontSize: 18, letterSpacing: '-0.3px' }}>What are you looking for?</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/browse')}>Browse all →</Button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.label}
              onClick={() => navigate('/browse')}
              style={{
                position:     'relative',
                height:       140,
                borderRadius: 'var(--r3)',
                overflow:     'hidden',
                cursor:       'pointer',
                border:       '1px solid var(--border)',
                transition:   'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform    = 'translateY(-2px)';
                e.currentTarget.style.boxShadow    = 'var(--shadow-md)';
                e.currentTarget.style.borderColor  = 'var(--border-2)';
                e.currentTarget.querySelector('.cat-bg').style.filter = 'blur(1px) brightness(0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform    = '';
                e.currentTarget.style.boxShadow    = '';
                e.currentTarget.style.borderColor  = 'var(--border)';
                e.currentTarget.querySelector('.cat-bg').style.filter = 'blur(3px) brightness(0.45)';
              }}
            >
              {/* Blurred background image */}
              <img
                className="cat-bg"
                src={cat.img}
                alt=""
                loading="lazy"
                style={{
                  position:   'absolute',
                  inset:      '-8px',       /* slight overflow so blur edges don't show */
                  width:      'calc(100% + 16px)',
                  height:     'calc(100% + 16px)',
                  objectFit:  'cover',
                  filter:     'blur(3px) brightness(0.45)',
                  transition: 'filter 0.25s ease',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
              {/* Dark gradient at the bottom for extra text legibility */}
              <div style={{
                position:   'absolute',
                inset:      0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              {/* Text */}
              <div style={{
                position: 'absolute',
                inset:    0,
                padding:  '14px 14px',
                display:  'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', letterSpacing: '-0.1px', marginBottom: 3, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                  {cat.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div style={{ padding: '36px 0 32px', borderBottom: '1px solid var(--border)' }} className="hide-mobile">
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
          How it works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden' }}>
          {[
            ['01', 'Browse', 'Find events by venue, date, or keyword.'],
            ['02', 'Book', 'Choose a ticket type and pay via Razorpay.'],
            ['03', 'Receive', 'Get a QR code on email instantly.'],
            ['04', 'Attend', 'Staff scans your QR at the gate. Done.'],
          ].map(([num, t, d]) => (
            <div key={t} style={{ background: 'var(--surface)', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--accent)', marginBottom: 8, opacity: 0.7 }}>{num}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>{t}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Platform features ── */}
      <div style={{ padding: '40px 0 36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          Why Ticket Platform
        </div>
        <h2 style={{ fontSize: 18, letterSpacing: '-0.3px', marginBottom: 24 }}>Built for real events</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 1, background: 'var(--border)', borderRadius: 'var(--r3)', overflow: 'hidden' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--surface)', padding: '20px 20px' }}>
              <div style={{
                width: 34, height: 34,
                background: 'var(--accent-dim)',
                border: '1px solid rgba(232,160,70,0.2)',
                borderRadius: 'var(--r2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
                marginBottom: 12,
              }}>{f.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6, letterSpacing: '-0.1px' }}>{f.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured events ── */}
      <div style={{ paddingTop: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, letterSpacing: '-0.2px' }}>Upcoming events</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/browse')}>View all →</Button>
        </div>

        {loading ? <LoadingState /> : events.length === 0 ? (
          <div style={{ color: 'var(--text-2)', fontSize: 13, padding: '40px 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
            No events published yet. Be the first to create one!
          </div>
        ) : (
          <div className="events-grid">
            {events.map(e => <EventCard key={e.id} event={e} onClick={() => navigate(`/events/${e.id}`)} />)}
          </div>
        )}
      </div>

      {/* ── Organiser CTA ── */}
      <div style={{
        marginTop: 16,
        padding: '32px 36px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
            For organisers
          </div>
          <h2 style={{ fontSize: 18, letterSpacing: '-0.3px', marginBottom: 6 }}>Ready to create your event?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 13, maxWidth: 480, lineHeight: 1.6 }}>
            Set up your event in minutes. Define ticket types, set prices, publish — and start selling immediately.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Button variant="primary" onClick={() => navigate('/register')}>Get started free</Button>
          <Button onClick={() => navigate('/browse')}>See examples</Button>
        </div>
      </div>

    </div>
  );
}
