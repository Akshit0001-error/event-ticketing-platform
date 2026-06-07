/**
 * components/ui/Button.jsx
 */
export function Button({
  children,
  variant = 'default',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  style,
  className = '',
  ...rest
}) {
  const cls = [
    'btn',
    variant === 'primary' ? 'btn-primary' : '',
    variant === 'ghost'   ? 'btn-ghost'   : '',
    variant === 'danger'  ? 'btn-danger'  : '',
    size === 'sm'  ? 'btn-sm' : '',
    size === 'lg'  ? 'btn-lg' : '',
    size === 'icon'? 'btn-icon': '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
