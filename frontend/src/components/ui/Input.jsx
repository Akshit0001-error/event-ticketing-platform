/**
 * components/ui/Input.jsx — Input, Select, Textarea
 */

export function Input({
  label, error, type = 'text', className = '', style, ...rest
}) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}</label>}
      <input
        type={type}
        className={`input ${error ? 'error' : ''} ${className}`}
        style={style}
        {...rest}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...rest }) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}</label>}
      <select className={`input ${error ? 'error' : ''} ${className}`} {...rest}>
        {children}
      </select>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...rest }) {
  return (
    <div className="input-wrap">
      {label && <label className="input-label">{label}</label>}
      <textarea className={`input ${error ? 'error' : ''} ${className}`} {...rest} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
