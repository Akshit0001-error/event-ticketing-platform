/**
 * App.jsx — root router
 *
 * Route structure:
 *   /                         → Home (public)
 *   /browse                   → Browse events (public)
 *   /events/:id               → Event detail (public)
 *   /login                    → Login
 *   /register                 → Register
 *
 *   /tickets                  → My tickets        [ATTENDEE]
 *   /tickets/:id              → Ticket detail     [ATTENDEE]
 *   /checkout                 → Checkout          [ATTENDEE]
 *
 *   /dashboard                → Organiser overview [ORGANIZER]
 *   /dashboard/events         → Events list        [ORGANIZER]
 *   /dashboard/events/new     → Create event       [ORGANIZER]
 *   /dashboard/events/:id/edit→ Edit event         [ORGANIZER]
 *
 *   /validate                 → Ticket validation  [STAFF]
 *
 *   *                         → 404
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* Context providers */
import { AuthProvider }  from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

/* Layout components */
import { AppShell }       from './components/layout/AppShell';
import { PublicLayout }   from './components/layout/PublicLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

/* Public pages */
import HomePage        from './pages/public/HomePage';
import BrowsePage      from './pages/public/BrowsePage';
import EventDetailPage from './pages/public/EventDetailPage';

/* Auth pages */
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* Attendee pages */
import CheckoutPage      from './pages/attendee/CheckoutPage';
import MyTicketsPage     from './pages/attendee/MyTicketsPage';
import TicketDetailPage  from './pages/attendee/TicketDetailPage';

/* Organiser pages */
import DashboardPage    from './pages/organizer/DashboardPage';
import EventsListPage   from './pages/organizer/EventsListPage';
import EventFormPage    from './pages/organizer/EventFormPage';

/* Staff pages */
import ValidationPage from './pages/staff/ValidationPage';

/* Misc */
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>

            {/* ── Public layout (top navbar) ── */}
            <Route element={<PublicLayout />}>
              <Route index         element={<HomePage />} />
              <Route path="browse" element={<BrowsePage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
            </Route>

            {/* ── Auth pages (no layout) ── */}
            <Route path="login"    element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* ── Attendee pages (sidebar layout, role: ATTENDEE) ── */}
            <Route element={<ProtectedRoute role="ATTENDEE"><AppShell /></ProtectedRoute>}>
              <Route path="tickets"      element={<MyTicketsPage />} />
              <Route path="tickets/:id"  element={<TicketDetailPage />} />
            </Route>

            {/* ── Checkout (attendee, no sidebar — keeps focus) ── */}
            <Route
              path="checkout"
              element={<ProtectedRoute role="ATTENDEE"><CheckoutPage /></ProtectedRoute>}
            />

            {/* ── Organiser pages (sidebar layout, role: ORGANIZER) ── */}
            <Route element={<ProtectedRoute role="ORGANIZER"><AppShell /></ProtectedRoute>}>
              <Route path="dashboard"                       element={<DashboardPage />} />
              <Route path="dashboard/events"                element={<EventsListPage />} />
              <Route path="dashboard/events/new"            element={<EventFormPage />} />
              <Route path="dashboard/events/:id/edit"       element={<EventFormPage />} />
            </Route>

            {/* ── Staff pages (sidebar layout, role: STAFF) ── */}
            <Route element={<ProtectedRoute role="STAFF"><AppShell /></ProtectedRoute>}>
              <Route path="validate" element={<ValidationPage />} />
            </Route>

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
