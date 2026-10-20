// components/dashboard/ClinicalCommandHeader.jsx — Clean Baseten-Themed Clinical Dashboard Header
import { Activity, ShieldCheck, Zap, ArrowRight, Sparkles, Sliders, Database } from 'lucide-react'

export function ClinicalCommandHeader({ onQuickSimulate, onScrollToInput }) {
  return (
    <div className="baseten-hero-wrapper" style={{ marginTop: 24, marginBottom: 8 }}>
      {/* ── Clinical Header Main ── */}
      <div style={{ padding: '36px 36px 32px 36px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              color: '#000000',
              marginBottom: 14,
            }}>
              Intelligent Healthcare Monitoring &amp; Decision Support using Multi-Agent
            </h1>

            <p style={{
              fontSize: '1.02rem',
              color: '#4b5563',
              lineHeight: 1.55,
              maxWidth: 580,
              marginBottom: 24,
            }}>
              Real-time physiological vital sign stratification, automated pharmacovigilance surveillance, and zero-tolerance safety guardrails enforced before physician review.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={onQuickSimulate}
                className="btn-baseten-primary"
              >
                <Zap size={14} /> SIMULATE PATIENT CASE &gt;
              </button>
              <button
                onClick={onScrollToInput}
                className="btn-baseten-outline"
              >
                CUSTOM VITALS INPUT →
              </button>
            </div>
          </div>

          {/* Right Architecture Blueprint Preview */}
          <div style={{
            background: '#fafaf9',
            border: '1px dashed #d1d5db',
            borderRadius: 2,
            padding: '20px 22px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4b5563',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span>PIPELINE SPECIFICATION</span>
              <span style={{ color: 'var(--baseten-green-dark)' }}>● 4 AGENTS ONLINE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { num: '01', name: 'Physiological Monitoring', desc: 'Heart rate, SpO2, Temp, SBP risk tiering', tag: 'LLM + ML' },
                { num: '02', name: 'Pharmacovigilance', desc: 'Drug-drug interaction & allergy cross-match', tag: 'DDI RULES' },
                { num: '03', name: 'Clinical Decision', desc: 'Resuscitation protocols & drug prescription', tag: 'SYNTHESIS' },
                { num: '04', name: 'Safety Gatekeeper', desc: 'Zero-tolerance pre-execution interceptor', tag: 'GATE' },
              ].map((step) => (
                <div
                  key={step.num}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: '#000000',
                      color: '#ffffff',
                      padding: '2px 5px',
                      borderRadius: 2,
                    }}>
                      {step.num}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>
                        {step.name}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#6b7280' }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    background: '#e6fcf1',
                    color: '#005a2b',
                    padding: '2px 6px',
                    borderRadius: 2,
                    border: '1px solid rgba(0,229,117,0.4)',
                  }}>
                    {step.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
