/**
 * components/ui/Spinner.jsx
 */
export function Spinner({ size = 'sm' }) {
  return <span className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />;
}

export function LoadingState({ text = 'Loading…' }) {
  return (
    <div className="loading-state">
      <Spinner size="lg" />
      <span className="loading-text">{text}</span>
    </div>
  );
}
