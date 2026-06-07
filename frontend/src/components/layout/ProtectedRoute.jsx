/**
 * components/layout/ProtectedRoute.jsx
 * Wraps a route so only authenticated users with the right role can access it.
 *
 * FIXES:
 *  1. Passes location state so post-login redirect works (redirects back to
 *     the page the user was trying to reach, not always '/').
 *  2. Wrong-role redirect goes to role's home page, not '/' which may redirect
 *     them again unnecessarily.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOME = {
  ORGANIZER: '/dashboard',
  ATTENDEE:  '/browse',
  STAFF:     '/validate',
};

export function ProtectedRoute({ role, children }) {
  const { user }   = useAuth();
  const location   = useLocation();

  // FIX: pass current location so login page can redirect back after auth
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // FIX: redirect wrong-role users to their own home, not '/'
  if (role && user.role !== role) {
    const home = ROLE_HOME[user.role] || '/';
    return <Navigate to={home} replace />;
  }

  return children;
}
