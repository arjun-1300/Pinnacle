// components/dashboard/PhysicianApprovalBar.jsx — Baseten-style Human-in-the-Loop Governance Bar
import { useState, useEffect } from 'react'
import { Stethoscope, CheckCircle, AlertTriangle, UserCheck, ShieldCheck } from 'lucide-react'
import { Spinner } from '../ui/Spinner'
import { toast } from '../ui/Toast'

export function PhysicianApprovalBar({ result, onDecide, onAuditRefresh }) {
  const [deciding, setDeciding] = useState(null)
  const [verdict, setVerdict] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (result) {
      if (result.physician_verdict) {
        setVerdict({ audit_id: result.audit_id, choice: result.physician_verdict })
      } else {
        setVerdict(null)
      }
      setError(null)
    } else {
      setVerdict(null)
      setError(null)
    }
  }, [result?.audit_id, result?.physician_verdict])

  if (!result) return null

  async function handleChoice(choice) {
    setDeciding(choice)
    setError(null)
    try {
      const resp = await onDecide(choice)
      const finalVerdict = { audit_id: resp?.audit_id || result.audit_id, choice }
      setVerdict(finalVerdict)
      toast.success(
        choice === 'approved' ? 'Recommendation Approved' : 'Clinical Override Recorded',
        `Physician decision saved to immutable audit trail for Patient ${result.patient_id}.`
      )
      if (onAuditRefresh) onAuditRefresh()
    } catch (err) {
      const msg = err.message || 'Failed to submit clinical decision'
      setError(msg)
      toast.error('Decision Submission Failed', msg)
    } finally {
      setDeciding(null)
    }
  }

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <div className="card-header" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
          Physician Review &amp; Sign-off
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.72rem',
          color: '#64748b',
          fontWeight: 500,
        }}>
          <UserCheck size={14} style={{ color: '#0f766e' }} />
          <span>Doctor Sign-off Required</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 8,
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stethoscope size={16} style={{ color: '#0f766e' }} />
            <strong style={{
              fontSize: '0.80rem',
              color: '#0f172a',
            }}>
              Clinical Decision Governance
            </strong>
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: '#64748b',
          }}>
            Patient ID: {result.patient_id || result.audit_id}
          </span>
        </div>

        {verdict ? (
          <div style={{
            padding: '12px 16px',
            borderRadius: 6,
            background: verdict.choice === 'approved' ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${verdict.choice === 'approved' ? '#bbf7d0' : '#fde68a'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            {verdict.choice === 'approved' ? (
              <>
                <CheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#166534', display: 'block' }}>
                    Approved by Attending Physician
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>
                    Automated triage committed to electronic health record at {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#92400e', display: 'block' }}>
                    Clinical Override Submitted by Physician
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#4b5563' }}>
                    Custom treatment plan mandated. Audit trail updated.
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: '#475569' }}>
              Review the multi-agent risk tier (<strong>{result.predicted_risk}</strong>) and safety verification above. Confirm approval to proceed with automated triage or submit a clinical override.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                id="approve-btn"
                type="button"
                className="btn-baseten-green"
                onClick={() => handleChoice('approved')}
                disabled={!!deciding}
                style={{ padding: '9px 14px' }}
              >
                {deciding === 'approved' ? <Spinner size="sm" /> : <CheckCircle size={15} />}
                <span>Approve Recommendation</span>
              </button>

              <button
                id="override-btn"
                type="button"
                className="btn-baseten-outline"
                onClick={() => handleChoice('overridden')}
                disabled={!!deciding}
                style={{ padding: '9px 14px', color: '#b45309', borderColor: '#fde68a', background: '#fffbeb' }}
              >
                {deciding === 'overridden' ? <Spinner size="sm" /> : <AlertTriangle size={15} />}
                <span>Clinical Override</span>
              </button>
            </div>
          </>
        )}

        {error && (
          <div style={{
            fontSize: '0.74rem',
            color: '#b91c1c',
            background: '#fef2f2',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #fecaca',
          }}>
            ⚠ {error}
          </div>
        )}
      </div>
    </div>
  )
}
export default PhysicianApprovalBar
