/**
 * shared/StatRow.jsx
 * Row of stat cards. Accepts an array of { label, value, delta? } objects.
 */
export function StatRow({ stats, cols = 4 }) {
  return (
    <div
      className="stat-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {stats.map((s, i) => (
        <div className="stat-cell" key={i}>
          <div className="stat-cell-value">{s.value}</div>
          <div className="stat-cell-label">{s.label}</div>
          {s.delta != null && (
            <div style={{
              fontSize: 12, marginTop: 4,
              color: s.delta >= 0 ? 'var(--success)' : 'var(--error)',
              fontFamily: 'var(--font-mono)',
            }}>
              {s.delta >= 0 ? '+' : ''}{s.delta}%
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
