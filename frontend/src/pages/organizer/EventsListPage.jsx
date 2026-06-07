/**
 * pages/organizer/EventsListPage.jsx
 * Full paginated list of the organiser's events with inline delete.
 */
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApi } from '../../hooks/useApi';
import { TopBar } from '../../components/layout/TopBar';
import { PageHeader } from '../../components/shared/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner, LoadingState } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { fmtDate, fmtPrice, shortId, minPrice } from '../../utils/format';
import * as api from '../../api';

export default function EventsListPage() {
  const { openMenu }    = useOutletContext();
  const { token }       = useAuth();
  const { toast }       = useToast();
  const navigate        = useNavigate();

  const [page,      setPage]      = useState(0);
  const [deleteId,  setDeleteId]  = useState(null); // event id pending delete
  const [deleting,  setDeleting]  = useState(false);

  const { data, loading, refetch } = useApi(
    () => api.getMyEvents(token, page),
    [token, page]
  );

  const events        = data?.content      || [];
  const totalPages    = data?.totalPages   || 0;
  // FIX: use totalElements from paginated response, not events.length (which is just the current page slice)
  const totalElements = data?.totalElements ?? events.length;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteEvent(deleteId, token);
      toast('Event deleted.', 'success');
      setDeleteId(null);
      refetch();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TopBar
        title="My Events"
        onMenuClick={openMenu}
        actions={<Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>+ New event</Button>}
      />

      <div className="app-content">
        <div className="page-wrap">
          <PageHeader
            title="My Events"
            description={`${totalElements} event${totalElements !== 1 ? 's' : ''}`}
          >
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>+ New event</Button>
          </PageHeader>

          {loading ? <LoadingState /> : events.length === 0 ? (
            <Empty
              title="No events"
              description="You haven't created any events yet."
              action={<Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>Create first event</Button>}
            />
          ) : (
            <>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Venue</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Types</th>
                        <th>From</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(e => (
                        <tr key={e.id}>
                          <td><span className="mono small dim">{shortId(e.id)}</span></td>
                          <td>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</div>
                          </td>
                          <td className="muted small truncate" style={{ maxWidth: 140 }}>{e.venue || '—'}</td>
                          <td className="mono small">{fmtDate(e.start)}</td>
                          <td><Badge status={e.status} /></td>
                          <td className="mono small">{(e.ticketTypes || []).length}</td>
                          <td className="mono small">{e.ticketTypes?.length ? fmtPrice(minPrice(e.ticketTypes)) : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/events/${e.id}/edit`)}>
                                Edit
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => setDeleteId(e.id)}>
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <Modal
          title="Delete event"
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <Button onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" disabled={deleting} onClick={handleDelete}>
                {deleting ? <><Spinner /> Deleting…</> : 'Delete event'}
              </Button>
            </>
          }
        >
          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            This will permanently delete the event and all its ticket types.
            Sold tickets will also be removed. This action cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
}
