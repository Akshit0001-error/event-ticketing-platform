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

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="pn-footer">
      <div className="pn-footer-inner">
        {/* Left — brand */}
        <div className="pn-footer-brand" onClick={() => navigate('/')} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate('/')}>
          <LogoMark />
          <span className="pn-footer-brand-name">Ticket Platform</span>
        </div>

        {/* Center — links */}
        <nav className="pn-footer-links" aria-label="Footer navigation">
          <span className="pn-footer-link" role="button" tabIndex={0} onClick={() => navigate('/browse')} onKeyDown={e => e.key === 'Enter' && navigate('/browse')}>Browse Events</span>
          <span className="pn-footer-sep">·</span>
          <span className="pn-footer-link" role="button" tabIndex={0} onClick={() => navigate('/login')} onKeyDown={e => e.key === 'Enter' && navigate('/login')}>Organize</span>
          <span className="pn-footer-sep">·</span>
          <span className="pn-footer-link" role="button" tabIndex={0} onClick={() => navigate('/register')} onKeyDown={e => e.key === 'Enter' && navigate('/register')}>Sign up</span>
        </nav>

        {/* Right — social icons */}
        <div className="pn-footer-social">
          <a
            href="https://github.com/Akshit0001-error"
            target="_blank"
            rel="noopener noreferrer"
            className="pn-footer-icon"
            aria-label="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/in/akshit-saini-960547277/"
            target="_blank"
            rel="noopener noreferrer"
            className="pn-footer-icon"
            aria-label="LinkedIn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>

      <div className="pn-footer-bottom">
        <span>© {new Date().getFullYear()} Ticket Platform. Built with ❤️ + ⚗️</span>
      </div>
    </footer>
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

      <Footer />
    </>
  );
}
