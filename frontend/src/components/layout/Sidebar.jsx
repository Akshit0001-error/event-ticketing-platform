/**
 * components/layout/Sidebar.jsx
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { initials } from '../../utils/format';
import { ThemeToggle } from '../ui/ThemeToggle';

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

export function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const { toast }        = useToast();
  const navigate         = useNavigate();

  const links = user ? (NAV[user.role] || []) : PUBLIC_NAV;

  const handleLogout = () => {
    logout();
    toast('Signed out.', 'info');
    navigate('/login');
    onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">T</div>
          <span>Ticket Platform</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-section-label" style={{ marginBottom: 8, marginTop: 4 }}>
            {user ? user.role : 'GUEST'}
          </div>
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={onClose}
              end={to === '/dashboard'}
            >
              <span className="sidebar-link-icon">{icon}</span>
              {label}
            </NavLink>
          ))}

          {!user && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: 16, marginBottom: 8 }}>Account</div>
              <NavLink to="/login" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={onClose}>
                <span className="sidebar-link-icon">→</span>Sign In
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`} onClick={onClose}>
                <span className="sidebar-link-icon">+</span>Register
              </NavLink>
            </>
          )}
        </nav>

        {/* User footer */}
        {user && (
          <div className="sidebar-footer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
                Appearance
              </span>
              <ThemeToggle />
            </div>
            <div className="sidebar-user" onClick={handleLogout} title="Click to sign out">
              <div className="sidebar-avatar">{initials(user.name)}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name truncate">{user.name}</div>
                <div className="sidebar-user-role">{user.role}</div>
              </div>
              <span style={{ color: 'var(--text-3)', fontSize: 10, flexShrink: 0 }}>out</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
