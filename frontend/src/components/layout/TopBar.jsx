/**
 * components/layout/TopBar.jsx
 * Thin top bar inside the main content area.
 * Shows the current page title and a hamburger button on mobile.
 */
export function TopBar({ title, actions, onMenuClick }) {
  return (
    <header className="topbar">
      {/* Mobile menu toggle */}
      <button className="topbar-mobile-menu" onClick={onMenuClick} aria-label="Open menu">
        ☰
      </button>
      <h2 className="topbar-title">{title}</h2>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
    </header>
  );
}
