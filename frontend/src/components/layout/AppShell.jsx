/**
 * components/layout/AppShell.jsx
 * The main authenticated layout: fixed sidebar + scrollable content area.
 * Tracks collapsed state and applies data-sidebar-collapsed to shift content.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);

  return (
    <div className="app-shell" data-sidebar-collapsed={collapsed ? 'true' : 'false'}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main className="app-main">
        <Outlet context={{ openMenu: () => setMobileOpen(true) }} />
      </main>
    </div>
  );
}
