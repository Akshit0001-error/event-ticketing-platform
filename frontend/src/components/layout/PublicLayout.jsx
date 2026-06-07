/**
 * components/layout/PublicLayout.jsx
 * Layout for public-facing pages (Home, Browse, Event Detail).
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

export function PublicLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashLink = user?.role === 'ORGANIZER' ? '/dashboard'
                 : user?.role === 'ATTENDEE'  ? '/tickets'
                 : user?.role === 'STAFF'     ? '/validate'
                 : null;

  return (
    <>
      <nav className="pub-nav">
        <div className="pub-nav-logo" onClick={() => navigate('/')}>
          <div className="sidebar-logo-mark">T</div>
          Ticket Platform
        </div>

        <div className="pub-nav-links">
          <NavLink to="/browse" className={({ isActive }) => `pub-nav-link${isActive ? ' active' : ''}`}>
            Browse
          </NavLink>
        </div>

        <div className="pub-nav-actions">
          <ThemeToggle />
          {user ? (
            <>
              {dashLink && (
                <Button size="sm" onClick={() => navigate(dashLink)}>
                  {user.role === 'ORGANIZER' ? 'Dashboard' : user.role === 'ATTENDEE' ? 'My Tickets' : 'Validate'}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Register</Button>
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
