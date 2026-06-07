/**
 * components/ui/Pagination.jsx
 */
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const visible = pages.filter(p =>
    p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1
  );

  return (
    <div className="pagination">
      <button
        className="page-btn"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >‹</button>

      {visible.map((p, idx) => {
        const prev = visible[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} style={{ display: 'contents' }}>
            {showEllipsis && <span style={{ padding: '0 4px', color: 'var(--text-3)', fontSize: 12 }}>…</span>}
            <button
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p + 1}
            </button>
          </span>
        );
      })}

      <button
        className="page-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >›</button>
    </div>
  );
}
