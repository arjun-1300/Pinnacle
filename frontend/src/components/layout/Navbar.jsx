// components/layout/Navbar.jsx — Clean Clinical Navigation
import { Activity } from 'lucide-react'

export function Navbar() {
  return (
    <header className="baseten-header-root">
      {/* ── Main Clean Navbar ── */}
      <nav className="baseten-navbar" role="navigation">
        <div className="navbar-container">
          {/* Brand Logo: Clean Lowercase Typography with Tech Glyph */}
          <div className="navbar-left">
            <a href="/" className="baseten-logo-link">
              <span className="logo-symbol">
                <span className="logo-bar-1" />
                <span className="logo-bar-2" />
                <span className="logo-bar-3" />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="logo-text">pinnacle</span>
                <span style={{
                  fontSize: '0.62rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginTop: -2,
                }}>
                  Clinical Monitoring Engine
                </span>
              </div>
            </a>

            {/* In-page Anchor Links */}
            <div className="baseten-nav-links">
              <a href="#clinical-console" className="nav-link">
                Patient Input
              </a>
              <a href="#assessment-section" className="nav-link">
                Risk Assessment
              </a>
              <a href="#multi-agent-pipeline" className="nav-link">
                4-Agent Pipeline
              </a>
              <a href="#safety-firewall" className="nav-link">
                Safety Gate
              </a>
              <a href="#audit-trail" className="nav-link">
                Audit Trail
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
