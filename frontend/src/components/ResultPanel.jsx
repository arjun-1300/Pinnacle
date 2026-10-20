// ResultPanel.jsx — Analysis & Risk Display + Doctor Decision Controls
import { useState } from 'react'
import { api } from '../api'

const RISK_ICONS  = { Normal: '💚', Warning: '⚠️', Critical: '🚨' }
const RISK_LABELS = { Normal: 'Normal', Warning: 'Warning', Critical: 'Critical Alert' }

function RiskDisplay({ result }) {
  if (!result) {
    return (
      <div className="risk-display empty">
        <div className="risk-icon">🫀</div>
        <div>
          <div className="risk-label" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Awaiting Analysis</div>
          <div className="risk-sub">Submit patient vitals to run the agent pipeline</div>
        </div>
      </div>
    )
  }

  const cls   = result.predicted_risk?.toLowerCase()
  const pct   = Math.round((result.confidence ?? 0) * 100)

  return (
    <div className={`risk-display ${cls}`}>
      <div className="risk-icon">{RISK_ICONS[result.predicted_risk] ?? '❓'}</div>
      <div>
        <div className="risk-label">{RISK_LABELS[result.predicted_risk] ?? result.predicted_risk}</div>
        <div className="risk-sub">ID: {result.patient_id}</div>
      </div>
      <div className="risk-conf">
        {pct}%
        <small>Confidence</small>
      </div>
    </div>
  )
}

function VitalsStrip({ vitals }) {
  if (!vitals) return null
  const items = [
    { val: vitals.heart_rate,  lbl: 'HR', unit: 'bpm' },
    { val: vitals.spo2,        lbl: 'SpO₂', unit: '%' },
    { val: vitals.temperature, lbl: 'Temp', unit: '°C' },
    { val: vitals.systolic_bp, lbl: 'SBP', unit: 'mmHg' },
  ]
  return (
    <div className="vitals-strip">
      {items.map(({ val, lbl, unit }) => (
        <div key={lbl} className="vital-chip">
          <div className="val">{typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 1) : val}</div>
          <div className="lbl">{lbl}</div>
        </div>
      ))}
    </div>
  )
}

function ActionsList({ actions }) {
  if (!actions?.length) return null
  return (
    <ul className="action-list">
      {actions.map((a, i) => (
        <li key={i} className="action-item">
          <span className="bullet">▶</span>
          {a}
        </li>
      ))}
    </ul>
  )
}

function SafetyBlock({ result }) {
  if (!result) return null

  const blocked = result.drug_blocked
  const cls     = blocked ? 'blocked' : 'safe'
  const drug    = result.candidate_drug

  return (
    <div className={`safety-alert ${cls}`}>
      <div className="safety-alert-header">
        {blocked ? '🛑 Safety Agent — Drug Blocked' : '✅ Safety Agent — Cleared'}
      </div>

      {/* Interaction warnings */}
      {result.interaction_warnings?.map((w, i) => (
        <div key={i} className="safety-warning-item">{w}</div>
      ))}

      {/* Drug status */}
      {drug && (
        <div style={{ marginTop: 10 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Suggested drug: </span>
          <span className={`drug-badge ${blocked ? 'blocked' : 'approved'}`}>
            {blocked ? '🚫' : '✔'} {drug}
          </span>
        </div>
      )}

      {/* Physician note */}
      {result.physician_notes?.length > 0 && (
        <div style={{
          marginTop: 10,
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(0,0,0,0.05)',
          fontSize: '0.78rem',
          lineHeight: 1.5,
          color: 'var(--text-primary)',
        }}>
          {result.physician_notes[0]}
        </div>
      )}
    </div>
  )
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value ?? 0) * 100)
  return (
    <div className="conf-bar-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>Model confidence</span><span>{pct}%</span>
      </div>
      <div className="conf-bar">
        <div className="conf-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function ResultPanel({ result, onDecide, onAuditRefresh }) {
  const [deciding, setDeciding] = useState(null)
  const [verdict,  setVerdict]  = useState(null)
  const [error,    setError]    = useState(null)

  // Reset verdict when new result arrives
  if (result && result.audit_id !== verdict?.audit_id) {
    if (verdict) setVerdict(null)
  }

  async function handleDecide(choice) {
    setDeciding(choice)
    setError(null)
    try {
      const resp = await api.decide(choice)
      setVerdict({ audit_id: resp.audit_id, choice })
      onAuditRefresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeciding(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Risk + Vitals ─────────────────────────── */}
      <div className="card slide-up">
        <div className="card-title"><span className="dot" />Risk Assessment</div>
        <RiskDisplay result={result} />

        {result && (
          <>
            <div className="divider" />
            <VitalsStrip vitals={result.vitals} />
            <div style={{ marginTop: 12 }}>
              <ConfidenceBar value={result.confidence} />
            </div>
          </>
        )}
      </div>

      {/* ── Recommended Actions ───────────────────── */}
      {result?.suggested_actions?.length > 0 && (
        <div className="card slide-up">
          <div className="card-title"><span className="dot" />Recommended Actions</div>
          <ActionsList actions={result.suggested_actions} />
        </div>
      )}

      {/* ── Safety Agent ──────────────────────────── */}
      {result && (
        <div className="card slide-up">
          <div className="card-title"><span className="dot" />Safety Agent</div>
          <SafetyBlock result={result} />
        </div>
      )}

      {/* ── Doctor Decision ───────────────────────── */}
      {result && (
        <div className="card slide-up">
          <div className="card-title"><span className="dot" />Physician Decision</div>

          {verdict ? (
            <div className={`verdict-badge ${verdict.choice}`} style={{ display: 'inline-flex' }}>
              {verdict.choice === 'approved' ? '✔ Approved' : '⚡ Overridden'}
              <span style={{ marginLeft: 6, fontWeight: 400, fontSize: '0.75rem' }}>
                — logged to audit
              </span>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
                Review the pipeline recommendation and submit your clinical verdict to the audit log.
              </p>
              <div className="decision-panel">
                <button
                  id="approve-btn"
                  type="button"
                  className="btn btn-approve"
                  style={{ flex: 1 }}
                  onClick={() => handleDecide('approved')}
                  disabled={!!deciding}
                >
                  {deciding === 'approved'
                    ? <span className="spinner" />
                    : '✔ Approve'
                  }
                </button>
                <button
                  id="override-btn"
                  type="button"
                  className="btn btn-override"
                  style={{ flex: 1 }}
                  onClick={() => handleDecide('overridden')}
                  disabled={!!deciding}
                >
                  {deciding === 'overridden'
                    ? <span className="spinner" />
                    : '⚡ Override'
                  }
                </button>
              </div>
            </>
          )}

          {error && (
            <p style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--risk-critical)' }}>
              ⚠ {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
