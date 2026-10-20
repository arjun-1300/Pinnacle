// components/dashboard/ProjectOverviewBanner.jsx — About CareAgent & Quick Usage Guide
import { useState } from 'react'
import { Info, ShieldCheck, Activity, HelpCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react'

export function ProjectOverviewBanner() {
  const [expanded, setExpanded] = useState(true)

  return (
    <div
      id="project-overview-guide"
      className="card"
      style={{
        marginTop: 20,
        marginBottom: 8,
        border: '1px solid #e5e7eb',
        background: '#ffffff',
        borderRadius: 4,
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Top Header Row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: expanded ? 14 : 0,
        borderBottom: expanded ? '1px dashed #e5e7eb' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            background: 'var(--baseten-green-light)',
            color: 'var(--baseten-green-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 229, 117, 0.4)',
          }}>
            <Info size={18} />
          </div>
          <div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#111827' }}>
              About This Project &amp; User Guide
            </div>
            <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
              Overview of the CareAgent Intelligent Multi-Agent Healthcare Platform
            </div>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="btn-baseten-outline"
          style={{ padding: '5px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {expanded ? (
            <>
              <span>Collapse Guide</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Show Guide</span>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {/* ── Expanded Content (3 Clean Columns) ── */}
      {expanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          marginTop: 18,
        }}>
          {/* Pillar 1: What is this Project? */}
          <div style={{
            background: '#fafaf9',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} style={{ color: 'var(--baseten-green-dark)' }} />
              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>
                1. What is CareAgent?
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.55 }}>
              <strong>CareAgent</strong> is an intelligent clinical decision support system designed for healthcare environments.
              It uses a collaborative <strong>4-Agent AI architecture</strong> that works together in real-time to analyze patient vitals, verify drug safety, generate clinical protocols, and prevent medical errors.
            </p>
            <div style={{
              marginTop: 'auto',
              padding: '6px 10px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 3,
              fontSize: '0.70rem',
              color: '#374151',
              fontFamily: 'var(--font-mono)',
            }}>
              4 Specialized Agents: Monitoring, Medication, Decision &amp; Safety
            </div>
          </div>

          {/* Pillar 2: Uses of this Project */}
          <div style={{
            background: '#fafaf9',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={16} style={{ color: '#008744' }} />
              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>
                2. Key Uses &amp; Benefits
              </strong>
            </div>
            <ul style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: '0.78rem',
              color: '#4b5563',
              lineHeight: 1.55,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              <li><strong>Continuous Vital Monitoring:</strong> Instantly categorizes patient acuity into Normal, Warning, or Critical.</li>
              <li><strong>Automated Medication Screening:</strong> Detects severe drug-drug interactions and allergy conflicts.</li>
              <li><strong>Actionable Care Plans:</strong> Suggests prioritized interventions and evidence-based therapeutic options.</li>
              <li><strong>Pre-Execution Safety Firewall:</strong> Blocks contraindicated prescriptions before physician sign-off.</li>
            </ul>
          </div>

          {/* Pillar 3: How to Use It */}
          <div style={{
            background: '#fafaf9',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HelpCircle size={16} style={{ color: '#1d4ed8' }} />
              <strong style={{ fontSize: '0.88rem', color: '#111827' }}>
                3. How to Use This System
              </strong>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: '0.77rem',
              color: '#4b5563',
              lineHeight: 1.45,
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#111827',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 2,
                  height: 'fit-content',
                }}>1</span>
                <span><strong>Enter Vitals:</strong> Type heart rate, SpO2, temp, and blood pressure, or click <em>Random Case</em> / <em>Critical Case</em>.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#111827',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 2,
                  height: 'fit-content',
                }}>2</span>
                <span><strong>Select Meds &amp; Allergies:</strong> Click medication and allergy tags to match the patient profile.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#111827',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 2,
                  height: 'fit-content',
                }}>3</span>
                <span><strong>Run Evaluation:</strong> Click <em>Run Multi-Agent Evaluation</em> to execute all 4 agents.</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#111827',
                  color: '#ffffff',
                  padding: '1px 6px',
                  borderRadius: 2,
                  height: 'fit-content',
                }}>4</span>
                <span><strong>Review &amp; Doctor Sign-Off:</strong> Check the risk level, safety verdict, and record physician approval.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
