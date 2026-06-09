/**
 * pages/organizer/DashboardPage.jsx
 *
 * Rich analytics dashboard — drop-in replacement for the minimal version.
 *
 * DEPENDENCIES TO INSTALL:
 *   npm install recharts
 *
 * BACKEND CHANGES NEEDED:
 *   Add GET /events/analytics endpoint (see comment at bottom of file).
 *   Until then, the page derives all stats from getMyEvents() — works today.
 */

import { useState, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

import { useAuth }      from '../../context/AuthContext';
import { useApi }       from '../../hooks/useApi';
import { TopBar }       from '../../components/layout/TopBar';
import { PageHeader }   from '../../components/shared/PageHeader';
import { Badge }        from '../../components/ui/Badge';
import { Button }       from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';
import { fmtDate, shortId } from '../../utils/format';
import * as api from '../../api';

// ─── Design tokens (re-used from variables.css) ───────────────────────────────
const COLOR = {
  accent:  '#e8a046',
  success: '#4caf7d',
  info:    '#5c9de8',
  error:   '#e05555',
  muted:   'rgba(240,237,232,0.08)',
  grid:    'rgba(240,237,232,0.06)',
  text2:   '#7a7880',
};

const PIE_COLORS = [COLOR.accent, COLOR.info, COLOR.success, COLOR.error];

// ─── Tooltip components ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-3)', border: '1px solid var(--border-2)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: 'var(--text-2)', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text)', fontWeight: 500 }}>
          {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </div>
      ))}
    </div>
  );
}

// ─── Small stat card ──────────────────────────────────────────────────────────
function StatCard({ label, value, delta, color, icon }) {
  const up = delta >= 0;
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: color || 'var(--text)', fontFamily: 'var(--font-mono)' }}>
            {value}
          </div>
        </div>
        {icon && (
          <div style={{ fontSize: 22, opacity: 0.5 }}>{icon}</div>
        )}
      </div>
      {delta != null && (
        <div style={{ marginTop: 8, fontSize: 12, color: up ? COLOR.success : COLOR.error, fontFamily: 'var(--font-mono)' }}>
          {up ? '↑' : '↓'} {Math.abs(delta)}% vs last month
        </div>
      )}
    </div>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ title, children, style }) {
  return (
    <div className="card" style={{ padding: '20px 22px', ...style }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { openMenu }    = useOutletContext();
  const { token, user } = useAuth();
  const navigate        = useNavigate();

  // Fetch events (works with existing backend — no new endpoint needed)
  const { data, loading } = useApi(() => api.getMyEvents(token, 0), [token]);
  const events = useMemo(() => data?.content || [], [data]);

  // ── Derived analytics ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const published   = events.filter(e => e.status === 'PUBLISHED').length;
    const drafts      = events.filter(e => e.status === 'DRAFT').length;
    const cancelled   = events.filter(e => e.status === 'CANCELLED').length;
    const totalCap    = events.reduce((s, e) =>
      s + (e.ticketTypes || []).reduce((a, t) => a + (t.totalAvailable || 0), 0), 0);
    const soldTickets = events.reduce((s, e) =>
      s + (e.ticketTypes || []).reduce((a, t) => a + ((t.totalAvailable || 0) - (t.available || 0)), 0), 0);
    const revenue     = events.reduce((s, e) =>
      s + (e.ticketTypes || []).reduce((a, t) =>
        a + (((t.totalAvailable || 0) - (t.available || 0)) * (t.price || 0)), 0), 0);

    return { published, drafts, cancelled, totalCap, soldTickets, revenue };
  }, [events]);

  // ── Chart data: tickets sold per event (top 6) ───────────────────────────
  const ticketsByEvent = useMemo(() =>
    events
      .map(e => ({
        name: e.name?.length > 18 ? e.name.slice(0, 16) + '…' : e.name,
        sold: (e.ticketTypes || []).reduce((a, t) =>
          a + ((t.totalAvailable || 0) - (t.available || 0)), 0),
        capacity: (e.ticketTypes || []).reduce((a, t) => a + (t.totalAvailable || 0), 0),
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6),
  [events]);

  // ── Chart data: status breakdown for pie ────────────────────────────────
  const statusPie = useMemo(() => [
    { name: 'Published', value: stats.published },
    { name: 'Draft',     value: stats.drafts },
    { name: 'Cancelled', value: stats.cancelled },
  ].filter(d => d.value > 0), [stats]);

  // ── Chart data: capacity utilisation across events ───────────────────────
  const utilisationData = useMemo(() =>
    events
      .filter(e => (e.ticketTypes || []).reduce((a, t) => a + (t.totalAvailable || 0), 0) > 0)
      .map(e => {
        const cap  = (e.ticketTypes || []).reduce((a, t) => a + (t.totalAvailable || 0), 0);
        const sold = (e.ticketTypes || []).reduce((a, t) => a + ((t.totalAvailable || 0) - (t.available || 0)), 0);
        return {
          name: e.name?.length > 16 ? e.name.slice(0, 14) + '…' : e.name,
          pct: cap > 0 ? Math.round((sold / cap) * 100) : 0,
        };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8),
  [events]);

  if (loading) return <LoadingState />;

  const fillRate = stats.totalCap > 0
    ? Math.round((stats.soldTickets / stats.totalCap) * 100)
    : 0;

  return (
    <>
      <TopBar
        title="Dashboard"
        onMenuClick={openMenu}
        actions={
          <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>
            + New event
          </Button>
        }
      />

      <div className="app-content">
        <div className="page-wrap">
          <PageHeader
            title={`Welcome back, ${user?.name?.split(' ')[0]}.`}
            description="Your events at a glance."
          >
            <Button size="sm" onClick={() => navigate('/dashboard/events')}>All events</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/events/new')}>+ New event</Button>
          </PageHeader>

          {/* ── KPI row ──────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard label="Total events"    value={events.length}                       icon="📅" />
            <StatCard label="Published"       value={stats.published}  color={COLOR.success} icon="✅" />
            <StatCard label="Tickets sold"    value={stats.soldTickets.toLocaleString()}  icon="🎟️" />
            <StatCard label="Fill rate"       value={`${fillRate}%`}
              color={fillRate >= 75 ? COLOR.success : fillRate >= 40 ? COLOR.accent : COLOR.error}
              icon="📊"
            />
          </div>

          {/* Revenue KPI (full width accent card) */}
          <div className="card" style={{
            padding: '18px 24px', marginBottom: 20,
            background: 'linear-gradient(135deg, rgba(232,160,70,0.12) 0%, var(--surface) 60%)',
            border: '1px solid rgba(232,160,70,0.25)',
          }}>
            <div style={{ fontSize: 12, color: COLOR.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Estimated revenue (sold tickets × price)
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
              ₹{stats.revenue.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
              {stats.soldTickets.toLocaleString()} tickets sold across {events.length} events &nbsp;·&nbsp; {stats.totalCap.toLocaleString()} total capacity
            </div>
          </div>

          {/* ── Charts row ───────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 20 }}>

            {/* Tickets sold per event — bar chart */}
            <ChartCard title="Tickets sold per event">
              {ticketsByEvent.length === 0 ? (
                <div style={{ color: 'var(--text-2)', fontSize: 13, padding: '20px 0' }}>No ticket data yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={ticketsByEvent} barCategoryGap="30%">
                    <CartesianGrid vertical={false} stroke={COLOR.grid} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: COLOR.text2 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: COLOR.text2 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="capacity" fill={COLOR.muted} radius={[3,3,0,0]} name="Capacity" />
                    <Bar dataKey="sold"     fill={COLOR.accent} radius={[3,3,0,0]} name="Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <LegendDot color={COLOR.accent} label="Sold" />
                <LegendDot color={COLOR.muted}  label="Capacity" />
              </div>
            </ChartCard>

            {/* Status breakdown — pie chart */}
            <ChartCard title="Event status">
              {statusPie.length === 0 ? (
                <div style={{ color: 'var(--text-2)', fontSize: 13, padding: '20px 0' }}>No events yet.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={statusPie}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusPie.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {statusPie.map((d, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <LegendDot color={PIE_COLORS[i % PIE_COLORS.length]} label={d.name} />
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* Capacity utilisation bar */}
          <ChartCard title="Capacity fill rate by event" style={{ marginBottom: 20 }}>
            {utilisationData.length === 0 ? (
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>No capacity data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={utilisationData} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid horizontal={false} stroke={COLOR.grid} />
                  <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: COLOR.text2 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: COLOR.text2 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v}%`, 'Fill rate']} />
                  <Bar dataKey="pct" radius={[0,3,3,0]} name="Fill rate">
                    {utilisationData.map((d, i) => (
                      <Cell key={i} fill={d.pct >= 75 ? COLOR.success : d.pct >= 40 ? COLOR.accent : COLOR.error} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* ── Recent events table ──────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14 }}>Recent events</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/events')}>View all →</Button>
          </div>

          {events.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)' }}>
              No events yet. <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('/dashboard/events/new')}>Create one →</span>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Event</th>
                      <th>Venue</th>
                      <th>Date</th>
                      <th>Sold / Cap</th>
                      <th>Fill</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 8).map(e => {
                      const cap  = (e.ticketTypes || []).reduce((a, t) => a + (t.totalAvailable || 0), 0);
                      const sold = (e.ticketTypes || []).reduce((a, t) => a + ((t.totalAvailable || 0) - (t.available || 0)), 0);
                      const pct  = cap > 0 ? Math.round((sold / cap) * 100) : 0;
                      return (
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
                          <td className="mono small">{sold.toLocaleString()} / {cap.toLocaleString()}</td>
                          <td>
                            <MiniBar pct={pct} />
                          </td>
                          <td><Badge status={e.status} /></td>
                          <td>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/events/${e.id}/edit`)}>
                              Edit
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
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

// ─── Mini inline bar for fill rate ───────────────────────────────────────────
function MiniBar({ pct }) {
  const color = pct >= 75 ? COLOR.success : pct >= 40 ? COLOR.accent : COLOR.error;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 60, height: 5, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color }}>{pct}%</span>
    </div>
  );
}

// ─── Legend dot ───────────────────────────────────────────────────────────────
function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * OPTIONAL BACKEND ENDPOINT — adds real-time analytics when ready
 *
 * GET /api/v1/events/analytics  (ORGANIZER role required)
 * Response shape:
 * {
 *   totalRevenue: number,         // sum of (sold * price) per ticket type
 *   totalSold: number,
 *   totalCapacity: number,
 *   revenueByMonth: [             // last 6 months
 *     { month: "Jan", revenue: 0 }, ...
 *   ],
 *   topEvents: [
 *     { id, name, sold, capacity, revenue }, ...
 *   ]
 * }
 *
 * To hook it up, add to api/index.js:
 *   export const getAnalytics = (token) => request('/events/analytics', {}, token);
 *
 * Then in this file replace the `useApi(() => api.getMyEvents(...))` call with:
 *   const { data: analytics } = useApi(() => api.getAnalytics(token), [token]);
 * and read analytics.revenueByMonth for a real AreaChart over time.
 * ─────────────────────────────────────────────────────────────────────────────
 */
