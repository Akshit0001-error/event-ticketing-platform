/**
 * components/ui/ThemeToggle.jsx
 * Compact day/night toggle button. Renders a sun or moon icon.
 */
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle({ style = {} }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r2)',
        color: 'var(--text-2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        fontSize: 15,
        transition: 'color var(--t-fast), border-color var(--t-fast), background var(--t-fast)',
        flexShrink: 0,
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.borderColor = 'var(--border-2)';
        e.currentTarget.style.background = 'var(--surface-2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-2)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'none';
      }}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}
