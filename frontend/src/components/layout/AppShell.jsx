/**
 * components/layout/AppShell.jsx
 * The main authenticated layout: fixed sidebar + scrollable content area.
 * All authenticated pages are rendered as children inside here.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main className="app-main">
        {/* Pass the menu opener down via outlet context */}
        <Outlet context={{ openMenu: () => setMobileOpen(true) }} />
      </main>
    </div>
  );
}
