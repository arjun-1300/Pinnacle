// components/dashboard/ClinicalCommandHeader.jsx — Clean Minimal Clinical Dashboard Header
import { Activity, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react'

export function ClinicalCommandHeader({ onQuickSimulate, onScrollToInput }) {
  return (
    <div className="card" style={{ marginTop: 20, marginBottom: 8, padding: '32px 32px 28px 32px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        gap: 32,
        alignItems: 'center',
      }}>
        {/* Left Column: Heading and CTAs */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 20,
            background: '#f0fdfa',
            border: '1px solid #ccfbf1',
            color: '#0f766e',
            fontSize: '0.74rem',
            fontWeight: 600,
            marginBottom: 14,
          }}>
            <Sparkles size={13} />
            Autonomous Clinical Intelligence
          </div>

          <h1 style={{
            fontSize: '1.95rem',
            fontWeight: 800,
            lineHeight: 1.22,
            letterSpacing: '-0.025em',
            color: '#0f172a',
            marginBottom: 12,
          }}>
            Intelligent Healthcare Monitoring &amp; Decision Support using Multi-Agent
          </h1>

          <p style={{
            fontSize: '0.96rem',
            color: '#475569',
            lineHeight: 1.6,
            maxWidth: 560,
            marginBottom: 24,
          }}>
            Continuous vital sign analysis, automated medication interaction checks, and safety verification designed to augment clinical judgment.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={onQuickSimulate}
              className="btn-baseten-primary"
            >
              <Zap size={14} /> Simulate Patient Case
            </button>
            <button
              type="button"
              onClick={onScrollToInput}
              className="btn-baseten-outline"
            >
              Enter Patient Vitals →
            </button>
          </div>
        </div>

        {/* Right Architecture Blueprint Card */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '20px 22px',
        }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: '#475569',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>4-Agent Pipeline</span>
            <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.70rem' }}>
              <span className="pulse-dot" style={{ width: 6, height: 6 }} /> 4 Active Agents
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { num: '01', name: 'Monitoring Agent', desc: 'Heart rate, SpO₂, Temp & SBP risk tiering', tag: 'Vitals' },
              { num: '02', name: 'Medication Agent', desc: 'Drug-drug interactions & allergy conflict screening', tag: 'Meds' },
              { num: '03', name: 'Decision Agent', desc: 'Evidence-based care plans & drug selection', tag: 'Actions' },
              { num: '04', name: 'Safety Checking Agent', desc: 'Pre-execution verification before doctor sign-off', tag: 'Safety' },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: '#f0fdfa',
                    color: '#0f766e',
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #ccfbf1',
                  }}>
                    {step.num}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.80rem', fontWeight: 600, color: '#0f172a' }}>
                      {step.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 600,
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                }}>
                  {step.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClinicalCommandHeader
