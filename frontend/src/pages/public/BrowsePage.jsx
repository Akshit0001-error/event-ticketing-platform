/**
 * pages/public/BrowsePage.jsx
 * Searchable event catalogue.
 *
 * FIXES:
 *  1. getPublishedEvents / searchPublishedEvents don't need token (public).
 *  2. useEffect dep array was missing `query` — could cause stale data on
 *     back-navigation. Now page changes trigger load; query changes use
 *     the debounce path (no double-fire).
 *  3. Debounce ref cleanup on unmount to prevent setState on unmounted component.
 *  4. List endpoint returns summary DTOs without ticketTypes — enrich each
 *     event with a detail fetch so EventCard can show ticket count and price.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventCard } from '../../components/shared/EventCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingState } from '../../components/ui/Spinner';
import { Empty } from '../../components/ui/Empty';
import { Button } from '../../components/ui/Button';
import * as api from '../../api';

export default function BrowsePage() {
  const navigate = useNavigate();
  const [events,     setEvents]     = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [page,       setPage]       = useState(0);
  const [query,      setQuery]      = useState('');
  const [loading,    setLoading]    = useState(true);
  const debounceRef = useRef(null);

  const load = async (q, pg) => {
    setLoading(true);
    try {
      // FIX: no token needed — public endpoints
      const d = q
        ? await api.searchPublishedEvents(q, pg)
        : await api.getPublishedEvents(pg, 12);

      const summaries = d?.content || [];
      setTotalPages(d?.totalPages || 0);

      // FIX: list endpoint returns summary DTOs without ticketTypes.
      // Enrich in parallel with individual detail fetches so EventCard
      // can display ticket count and price. Use allSettled so a single
      // failed fetch doesn't wipe the whole grid.
      const enriched = await Promise.allSettled(
        summaries.map(ev =>
          // Only fetch detail if ticketTypes is missing from the list response
          ev.ticketTypes != null
            ? Promise.resolve(ev)
            : api.getPublishedEvent(ev.id).catch(() => ev)
        )
      );

      setEvents(
        enriched.map((r, i) =>
          r.status === 'fulfilled' ? r.value : summaries[i]
        )
      );
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // FIX: page changes re-trigger load with current query
  useEffect(() => {
    load(query, page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX: cleanup debounce on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleSearch = (v) => {
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(0); load(v, 0); }, 350);
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }} className="fade-in">
      <div style={{ padding: '36px 0 0' }}>
        <PageHeader title="Browse Events" description="Explore upcoming events and grab your tickets." />

        <div className="filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="input search-input"
              placeholder="Search events, venues…"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              style={{ minWidth: 220 }}
            />
          </div>
          {query && (
            <Button variant="ghost" size="sm" onClick={() => { setQuery(''); setPage(0); load('', 0); }}>
              Clear
            </Button>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            {loading ? '…' : `${events.length} result${events.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {loading ? <LoadingState /> : events.length === 0 ? (
        <Empty
          title="No events found"
          description={query ? `No events match "${query}". Try a different search.` : 'No events are published yet.'}
          action={query ? <Button size="sm" onClick={() => { setQuery(''); setPage(0); load('', 0); }}>Clear search</Button> : null}
        />
      ) : (
        <>
          <div className="events-grid">
            {events.map(e => (
              <EventCard key={e.id} event={e} onClick={() => navigate(`/events/${e.id}`)} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
