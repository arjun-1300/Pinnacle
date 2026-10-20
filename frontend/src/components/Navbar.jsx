// Navbar.jsx — Glassmorphism header with brand + theme toggle + status dot
import { useTheme } from '../hooks/useTheme'

export default function Navbar({ serverOnline }) {
  const { scheme, toggle } = useTheme()
  const isDark = scheme === 'dark'

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">⚕</div>
        <span>Pinnacle</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)', letterSpacing: 0 }}>
          Healthcare Monitor
        </span>
      </div>

      <div className="navbar-actions">
        {/* Server status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span className={`status-dot ${serverOnline ? 'online' : ''}`}
            style={!serverOnline ? { background: 'var(--risk-critical)' } : {}} />
          {serverOnline ? 'API Online' : 'API Offline'}
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          className="theme-toggle"
          onClick={toggle}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span className="icon">{isDark ? '☀️' : '🌙'}</span>
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  )
}
