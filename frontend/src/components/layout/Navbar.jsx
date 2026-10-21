// components/layout/Navbar.jsx — Clean, Unified Clinical Navigation
import { HeartPulse } from 'lucide-react'

export function Navbar() {
  return (
    <header className="baseten-header-root">
      {/* ── Main Clean Clinical Navbar ── */}
      <nav className="baseten-navbar" role="navigation">
        <div className="navbar-container">
          {/* Brand Logo: Clean Medical Brand */}
          <div className="navbar-left">
            <a href="/" className="baseten-logo-link">
              <div className="navbar-brand-icon">
                <HeartPulse size={18} strokeWidth={2.4} />
              </div>
              <div className="navbar-brand-text">
                <span className="logo-text">CareAgent</span>
                <span className="logo-subtext">Clinical Decision Support</span>
              </div>
            </a>

            {/* In-page Anchor Links */}
            <div className="baseten-nav-links">
              <a href="#clinical-console" className="nav-link">
                Patient Input
              </a>
              <a href="#assessment-workflow-section" className="nav-link">
                Risk Assessment
              </a>
              <a href="#multi-agent-pipeline" className="nav-link">
                4-Agent Pipeline
              </a>
              <a href="#safety-firewall" className="nav-link">
                Safety Verification
              </a>
              <a href="#audit-trail" className="nav-link">
                Audit Trail
              </a>
              <a href="#project-overview-guide" className="nav-link">
                About &amp; Guide
              </a>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="navbar-right">
            <div className="navbar-status-pill">
              <span className="pulse-dot" />
              <span>System Operational</span>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
