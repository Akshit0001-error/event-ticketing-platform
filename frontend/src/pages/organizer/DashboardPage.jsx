/**
 * pages/organizer/DashboardPage.jsx
 * Organiser overview: stats + recent events table + quick actions.
 */
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { TopBar } from '../../components/layout/TopBar';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatRow } from '../../components/shared/StatRow';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { fmtDate, shortId } from '../../utils/format';
import * as api from '../../api';

export default function DashboardPage() {
  const { openMenu }    = useOutletContext();
  const { token, user } = useAuth();
  const navigate        = useNavigate();

  const { data, loading } = useApi(() => api.getMyEvents(token, 0), [token]);
  const events = data?.content || [];

  const published = events.filter(e => e.status === 'PUBLISHED').length;
  const drafts    = events.filter(e => e.status === 'DRAFT').length;
  const capacity  = events.reduce((s, e) => s + (e.ticketTypes || []).reduce((a, t) => a + (t.totalAvailable || 0), 0), 0);

  return (
    <>
      <TopBar
        title="Dashboard"
        onMenuClick={openMenu}
        actions={<Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>+ New event</Button>}
      />

      <div className="app-content">
        <div className="page-wrap">
          <PageHeader
            title={`Good day, ${user?.name?.split(' ')[0]}.`}
            description="Here's an overview of your events."
          >
            <Button size="sm" onClick={() => navigate('/dashboard/events')}>All events</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>+ New event</Button>
          </PageHeader>

          {/* Stats */}
          <StatRow stats={[
            { label: 'Total events',  value: events.length },
            { label: 'Published',     value: published },
            { label: 'Drafts',        value: drafts },
            { label: 'Total capacity',value: capacity.toLocaleString() },
          ]} cols={4} />

          {/* Recent events table */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14 }}>Recent events</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/events')}>View all →</Button>
          </div>

          {loading ? <LoadingState /> : events.length === 0 ? (
            <Empty
              title="No events yet"
              description="Create your first event to start selling tickets."
              action={<Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>Create event</Button>}
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Event name</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Ticket types</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 8).map(e => (
                      <tr key={e.id}>
                        <td><span className="mono small dim">{shortId(e.id)}</span></td>
                        <td>
                          <span
                            style={{ fontWeight: 500, cursor: 'pointer' }}
                            onClick={() => navigate(`/dashboard/events/${e.id}/edit`)}
                          >{e.name}</span>
                        </td>
                        <td className="muted small">{e.venue || '—'}</td>
                        <td className="small mono">{fmtDate(e.start)}</td>
                        <td className="mono small">{(e.ticketTypes || []).length}</td>
                        <td className="mono small">{(e.ticketTypes || []).reduce((s, t) => s + (t.totalAvailable || 0), 0)}</td>
                        <td><Badge status={e.status} /></td>
                        <td>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/events/${e.id}/edit`)}>
                            Edit
                          </Button>
                        </td>
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
