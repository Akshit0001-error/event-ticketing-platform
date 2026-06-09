/**
 * components/layout/PublicLayout.jsx
 * Premium sticky navbar with scroll-aware glass blur.
 * Preserves all existing auth, routing, and theme toggle functionality.
 */
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// ─── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="var(--accent)" />
      <path d="M7 14h6M14 8v12M17 11l4 3-4 3" stroke="var(--accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeBtn() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="pn-theme-btn"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.36 3.64l-1.06 1.06M4.7 11.3l-1.06 1.06M12.36 12.36l-1.06-1.06M4.7 4.7L3.64 3.64" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 100 11 5.5 5.5 0 007-4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// ─── Public navbar ────────────────────────────────────────────────────────────
export function PublicLayout() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashLink = user?.role === 'ORGANIZER' ? '/dashboard'
                 : user?.role === 'ATTENDEE'  ? '/tickets'
                 : user?.role === 'STAFF'     ? '/validate'
                 : null;

  const dashLabel = user?.role === 'ORGANIZER' ? 'Dashboard'
                  : user?.role === 'ATTENDEE'  ? 'My Tickets'
                  : 'Validate';

  return (
    <>
      <nav className={`pn-nav${scrolled ? ' pn-nav--scrolled' : ''}`}>
        <div className="pn-nav-inner">
          {/* Logo */}
          <div className="pn-logo" onClick={() => navigate('/')}>
            <LogoMark />
            <span className="pn-logo-text">Ticket Platform</span>
          </div>

          {/* Desktop links */}
          <div className="pn-links">
            <NavLink to="/browse" className={({ isActive }) => `pn-link${isActive ? ' pn-link--active' : ''}`}>
              Browse Events
            </NavLink>
            <NavLink to="/login" className={({ isActive }) => `pn-link${isActive ? ' pn-link--active' : ''}`}>
              Organize Event
            </NavLink>
          </div>

          {/* Desktop actions */}
          <div className="pn-actions">
            <ThemeBtn />
            {user ? (
              <>
                {dashLink && (
                  <button className="pn-btn-dash" onClick={() => navigate(dashLink)}>
                    {dashLabel}
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="pn-btn-ghost" onClick={() => navigate('/login')}>Log in</button>
                <button className="pn-btn-primary" onClick={() => navigate('/register')}>Sign up free</button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="pn-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
            <span className={`pn-ham-bar${mobileOpen ? ' pn-ham-bar--open-1' : ''}`} />
            <span className={`pn-ham-bar${mobileOpen ? ' pn-ham-bar--open-2' : ''}`} />
            <span className={`pn-ham-bar${mobileOpen ? ' pn-ham-bar--open-3' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`pn-mobile-menu${mobileOpen ? ' pn-mobile-menu--open' : ''}`}>
          <NavLink to="/browse" className="pn-mobile-link" onClick={() => setMobileOpen(false)}>Browse Events</NavLink>
          <NavLink to="/login"  className="pn-mobile-link" onClick={() => setMobileOpen(false)}>Organize Event</NavLink>
          <div className="pn-mobile-divider" />
          {user ? (
            dashLink && (
              <button className="pn-mobile-cta" onClick={() => { navigate(dashLink); setMobileOpen(false); }}>{dashLabel}</button>
            )
          ) : (
            <>
              <button className="pn-mobile-link-btn" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Log in</button>
              <button className="pn-mobile-cta" onClick={() => { navigate('/register'); setMobileOpen(false); }}>Sign up free</button>
            </>
          )}
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}
