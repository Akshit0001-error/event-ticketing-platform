/**
 * pages/attendee/MyTicketsPage.jsx
 * List of all tickets purchased by the current attendee.
 */
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { TopBar } from '../../components/layout/TopBar';
import { PageHeader } from '../../components/shared/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingState } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { fmtDate, shortId } from '../../utils/format';
import * as api from '../../api';

export default function MyTicketsPage() {
  const { openMenu }    = useOutletContext();
  const { token }       = useAuth();
  const navigate        = useNavigate();
  const [page, setPage] = useState(0);

  const { data, loading } = useApi(
    () => api.getMyTickets(token, page),
    [token, page]
  );

  const tickets    = data?.content     || [];
  const totalPages = data?.totalPages  || 0;

  return (
    <>
      <TopBar title="My Tickets" onMenuClick={openMenu} />

      <div className="app-content">
        <div className="page-wrap">
          <PageHeader
            title="My Tickets"
            description="All tickets purchased to your account."
          >
            <Button onClick={() => navigate('/browse')} size="sm">Browse events</Button>
          </PageHeader>

          {loading ? <LoadingState /> : tickets.length === 0 ? (
            <Empty
              title="No tickets yet"
              description="Purchase tickets to an event to see them here."
              action={<Button variant="primary" size="sm" onClick={() => navigate('/browse')}>Browse events</Button>}
            />
          ) : (
            <>
              {/* Compact table view */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Event</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(t => {
                        const ev = t.ticketType?.event || {};
                        const tt = t.ticketType       || {};
                        return (
                          <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${t.id}`)}>
                            <td>
                              <span className="mono small" style={{ color: 'var(--text-3)' }}>
                                {shortId(t.id)}
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 500, fontSize: 13 }}>{ev.name || '—'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{ev.venue || ''}</div>
                            </td>
                            <td style={{ fontSize: 13 }}>{tt.name || '—'}</td>
                            <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{fmtDate(ev.start)}</td>
                            <td><Badge status={t.status} /></td>
                            <td>
                              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${t.id}`); }}>
                                View QR
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
