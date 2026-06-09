/**
 * components/layout/Sidebar.jsx
 * Collapsible animated sidebar with user card at top and safe logout confirmation.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { initials } from '../../utils/format';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useState } from 'react';

const NAV = {
  ATTENDEE: [
    { to: '/browse',  label: 'Browse Events', icon: '◈' },
    { to: '/tickets', label: 'My Tickets',    icon: '⊡' },
  ],
  ORGANIZER: [
    { to: '/dashboard',            label: 'Overview',     icon: '▦' },
    { to: '/dashboard/events',     label: 'My Events',    icon: '◈' },
    { to: '/dashboard/events/new', label: 'Create Event', icon: '+' },
  ],
  STAFF: [
    { to: '/validate', label: 'Validate Ticket', icon: '✓' },
  ],
};

const PUBLIC_NAV = [
  { to: '/browse', label: 'Browse Events', icon: '◈' },
];

export function Sidebar({ mobileOpen, onClose, collapsed, onCollapsedChange }) {
  const { user, logout }               = useAuth();
  const { toast }                      = useToast();
  const navigate                       = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const links = user ? (NAV[user.role] || []) : PUBLIC_NAV;

  const handleLogoutClick = (e) => {
    e.stopPropagation();
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    toast('Signed out.', 'info');
    navigate('/login');
    onClose();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>

        {/* Logo row + collapse toggle */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">T</div>
          <span className="sidebar-logo-text">Ticket Platform</span>
          <button
            className="sidebar-collapse-btn"
            onClick={() => onCollapsedChange(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className={`sidebar-collapse-icon ${collapsed ? 'flipped' : ''}`}>‹</span>
          </button>
        </div>

        {/* ── User card at top ── */}
        {user && (
          <div className="sidebar-user-card">
            <div className="sidebar-avatar sidebar-avatar-lg">{initials(user.name)}</div>
            <div className="sidebar-user-card-info">
              <div className="sidebar-user-name truncate">{user.name}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!collapsed && (
            <div className="sidebar-section-label" style={{ marginBottom: 8, marginTop: 4 }}>
              {user ? user.role : 'GUEST'}
            </div>
          )}
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={onClose}
              end={to === '/dashboard'}
              title={collapsed ? label : undefined}
            >
              <span className="sidebar-link-icon">{icon}</span>
              <span className="sidebar-link-label">{label}</span>
            </NavLink>
          ))}

          {!user && (
            <>
              {!collapsed && (
                <div className="sidebar-section-label" style={{ marginTop: 16, marginBottom: 8 }}>Account</div>
              )}
              <NavLink to="/login" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={onClose} title={collapsed ? 'Sign In' : undefined}>
                <span className="sidebar-link-icon">→</span>
                <span className="sidebar-link-label">Sign In</span>
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={onClose} title={collapsed ? 'Register' : undefined}>
                <span className="sidebar-link-icon">+</span>
                <span className="sidebar-link-label">Register</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer: appearance + sign out */}
        {user && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-row">
              {!collapsed && <span className="sidebar-footer-label">Appearance</span>}
              <ThemeToggle />
            </div>
            <button className="sidebar-signout-btn" onClick={handleLogoutClick} title="Sign out">
              <span className="sidebar-signout-icon">⎋</span>
              <span className="sidebar-link-label">Sign out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Logout confirmation modal ── */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="logout-confirm-avatar">{initials(user?.name)}</div>
            <h3 className="logout-confirm-title">Sign out?</h3>
            <p className="logout-confirm-sub">You'll be redirected to the login page.</p>
            <div className="logout-confirm-actions">
              <button className="logout-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="logout-confirm-ok" onClick={confirmLogout}>Sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
