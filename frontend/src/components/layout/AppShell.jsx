// components/layout/AppShell.jsx — Root layout wrapper
export function AppShell({ navbar, children }) {
  return (
    <div className="app-shell">
      {navbar}
      <main className="app-main" id="main-content">
        {children}
      </main>
    </div>
  )
}
