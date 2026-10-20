// AuditLog.jsx — Live audit feed with auto-refresh
import { useEffect, useRef, useCallback } from 'react'
import { api } from '../api'

const RISK_BADGE = {
  Normal:   'badge badge-normal',
  Warning:  'badge badge-warning',
  Critical: 'badge badge-critical',
}

const VERDICT_BADGE = {
  approved:   'badge badge-approved',
  overridden: 'badge badge-overridden',
  null:       'badge badge-pending',
  undefined:  'badge badge-pending',
}

function formatTime(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  } catch { return '—' }
}

function AuditRow({ entry }) {
  const blocked = entry.drug_blocked
  const vcls    = VERDICT_BADGE[entry.physician_verdict]

  return (
    <div className="audit-row">
      {/* Patient ID + Time */}
      <div>
        <div className="audit-patient">{entry.patient_id}</div>
        <div className="audit-time">{formatTime(entry.timestamp)}</div>
      </div>

      {/* Risk */}
      <span className={RISK_BADGE[entry.predicted_risk] ?? 'badge badge-pending'}>
        {entry.predicted_risk ?? '—'}
      </span>

      {/* Confidence */}
      <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
        {entry.confidence != null ? `${Math.round(entry.confidence * 100)}%` : '—'}
      </span>

      {/* Safety */}
      <span style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: blocked ? 'var(--risk-critical)' : 'var(--risk-normal)',
      }}>
        {blocked ? '🛑 Blocked' : '✅ Clear'}
      </span>

      {/* Drug */}
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
        {entry.candidate_drug
          ? <span style={{ textDecoration: blocked ? 'line-through' : 'none' }}>{entry.candidate_drug}</span>
          : '—'
        }
      </span>

      {/* Verdict */}
      <span className={vcls}>
        {entry.physician_verdict ?? 'Pending'}
      </span>
    </div>
  )
}

export default function AuditLog({ entries, loading, onRefresh }) {
  const intervalRef = useRef(null)

  // Auto-refresh every 10 seconds
  useEffect(() => {
    onRefresh()
    intervalRef.current = setInterval(onRefresh, 10_000)
    return () => clearInterval(intervalRef.current)
  }, [onRefresh])

  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="card-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="dot" />Audit Log
          {entries.length > 0 && (
            <span style={{
              fontSize: '0.65rem',
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-full)',
              padding: '1px 8px',
              fontWeight: 700,
            }}>
              {entries.length}
            </span>
          )}
        </div>
        <button
          id="refresh-audit-btn"
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onRefresh}
          disabled={loading}
          style={{ padding: '4px 12px', fontSize: '0.72rem' }}
        >
          {loading ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2, borderColor: 'rgba(100,100,100,0.2)', borderTopColor: 'var(--accent)' }} /> : '↻ Refresh'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📋</span>
          <p>No audit entries yet. Run an analysis to see results here.</p>
        </div>
      ) : (
        <div>
          {/* Table header */}
          <div className="audit-header">
            <span>Patient</span>
            <span>Risk</span>
            <span>Conf.</span>
            <span>Safety</span>
            <span>Drug</span>
            <span>Verdict</span>
          </div>

          <div className="audit-feed">
            {entries.map(e => (
              <AuditRow key={e.audit_id} entry={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
