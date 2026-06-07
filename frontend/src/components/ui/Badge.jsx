/**
 * components/ui/Badge.jsx
 */
export function Badge({ status }) {
  const map = {
    PUBLISHED: 'published',
    DRAFT:     'draft',
    CANCELLED: 'cancelled',
    PURCHASED: 'purchased',
    USED:      'used',
  };
  const cls = map[status] || 'draft';
  return <span className={`badge badge-${cls}`}>{status}</span>;
}
