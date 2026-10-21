// components/dashboard/AuditTimeline.jsx — Baseten Deployment Logs & Audit Table
import { useEffect, useRef } from 'react'
import { RotateCw, ShieldCheck, ShieldAlert, Clock, Database, Terminal, ArrowUpRight } from 'lucide-react'
import { RiskBadge, VerdictBadge } from '../ui/Badge'
import { Spinner } from '../ui/Spinner'

function formatTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch {
    return '—'
  }
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

export function AuditTimeline({ entries = [], loading = false, onRefresh }) {
  const timerRef = useRef(null)

  // Only display finalized physician decisions (Approved or Overridden, never Pending)
  const finalizedEntries = entries.filter(
    e => e.physician_verdict === 'approved' || e.physician_verdict === 'overridden'
  )

  useEffect(() => {
    if (onRefresh) {
      onRefresh()
      timerRef.current = setInterval(onRefresh, 10000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [onRefresh])

  return (
    <div id="audit-trail" className="card" style={{ marginTop: 20 }}>
      {/* Clinical Header */}
      <div className="card-header">
        <div className="card-title-row">
          <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
            Decision History &amp; Audit Trail
          </div>
          {finalizedEntries.length > 0 && (
            <span style={{
              fontSize: '0.70rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 20,
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}>
              {finalizedEntries.length} {finalizedEntries.length === 1 ? 'Decision' : 'Decisions'} Recorded
            </span>
          )}
        </div>

        <button
          id="refresh-audit-btn"
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="btn-baseten-outline"
          style={{ padding: '6px 12px', fontSize: '0.74rem', height: 32 }}
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RotateCw size={12} />
              <span>Refresh History</span>
            </>
          )}
        </button>
      </div>

      {finalizedEntries.length === 0 ? (
        <div style={{
          padding: '36px 20px',
          textAlign: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
        }}>
          <Database size={28} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
            No finalized physician decisions logged yet.<br />
            Evaluate a patient and submit approval or a clinical override to record an audit entry.
          </p>
        </div>
      ) : (
        <div style={{
          overflowX: 'auto',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          background: '#ffffff',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78rem',
            textAlign: 'left',
          }}>
            <thead>
              <tr style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.70rem',
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}>
                <th style={{ padding: '10px 14px' }}>#</th>
                <th style={{ padding: '10px 14px' }}>Timestamp</th>
                <th style={{ padding: '10px 14px' }}>Patient ID</th>
                <th style={{ padding: '10px 14px' }}>Risk Tier</th>
                <th style={{ padding: '10px 14px' }}>Confidence</th>
                <th style={{ padding: '10px 14px' }}>Safety Status</th>
                <th style={{ padding: '10px 14px' }}>Physician Verdict</th>
              </tr>
            </thead>
            <tbody>
              {finalizedEntries.map((entry, index) => {
                const blocked = entry.drug_blocked

                return (
                  <tr
                    key={entry.audit_id || index}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafaf9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', color: '#6b7280' }}>
                      {finalizedEntries.length - index}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                        <Clock size={11} style={{ color: '#9ca3af' }} />
                        <span>{formatTime(entry.timestamp)}</span>
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#6b7280', marginLeft: 16 }}>
                        {formatDate(entry.timestamp)}
                      </div>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: 2,
                        color: '#111827',
                      }}>
                        #{entry.patient_id || 'UNKNOWN'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <RiskBadge risk={entry.predicted_risk} />
                    </td>

                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {entry.confidence != null ? `${Math.round(entry.confidence * 100)}%` : '—'}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      {blocked ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          color: '#b91c1c',
                          background: '#fee2e2',
                          padding: '2px 6px',
                          borderRadius: 2,
                        }}>
                          <ShieldAlert size={12} /> BLOCKED
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.70rem',
                          fontWeight: 800,
                          color: '#005a2b',
                          background: '#e6fcf1',
                          padding: '2px 6px',
                          borderRadius: 2,
                        }}>
                          <ShieldCheck size={12} /> CLEARED
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 14px' }}>
                      <VerdictBadge verdict={entry.physician_verdict} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
export default AuditTimeline
