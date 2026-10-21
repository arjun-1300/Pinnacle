// components/dashboard/SafetyBanner.jsx — Minimal Professional Clinical Safety Callout
import { ShieldAlert, ShieldCheck, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SafetyBanner({ result }) {
  if (!result) return null

  const blocked = Boolean(result.drug_blocked)
  const drug = result.candidate_drug
  const finalDrug = result.final_drug

  return (
    <div
      id="safety-firewall"
      className={cn('card animate-slide-up')}
      style={{
        marginTop: 14,
        padding: 0,
        overflow: 'hidden',
        border: `1px solid ${blocked ? '#fecaca' : '#bbf7d0'}`,
        borderLeft: `4px solid ${blocked ? '#dc2626' : '#059669'}`,
        borderRadius: 8,
        background: '#ffffff',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* ── Top Header Row ── */}
      <div style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: blocked ? '#fef2f2' : '#f0fdf4',
        borderBottom: `1px solid ${blocked ? '#fecaca' : '#bbf7d0'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: '#ffffff',
            border: `1px solid ${blocked ? '#fca5a5' : '#86efac'}`,
            color: blocked ? '#dc2626' : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          }}>
            {blocked ? <ShieldAlert size={19} /> : <ShieldCheck size={19} />}
          </div>
          <div>
            <div style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a' }}>
              Safety Checking Agent
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
              {blocked
                ? 'Harmful medication candidate intercepted prior to physician sign-off'
                : 'Pre-execution safety screening cleared — verified safe for physician review'}
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          background: '#ffffff',
          border: `1px solid ${blocked ? '#fca5a5' : '#86efac'}`,
          color: blocked ? '#b91c1c' : '#15803d',
          fontSize: '0.72rem',
          fontWeight: 700,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: blocked ? '#dc2626' : '#16a34a',
          }} />
          {blocked ? 'Medication Blocked' : 'Medication Cleared'}
        </span>
      </div>

      {/* ── Content Body ── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Drug Status Summary Bar */}
        {drug && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '10px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Proposed Rx:
              </span>
              <span style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: blocked ? '#64748b' : '#0f172a',
                textDecoration: blocked ? 'line-through' : 'none',
              }}>
                {drug}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: 4,
                background: blocked ? '#fee2e2' : '#f0fdf4',
                color: blocked ? '#b91c1c' : '#15803d',
                border: `1px solid ${blocked ? '#fecaca' : '#bbf7d0'}`,
              }}>
                {blocked ? 'Contraindicated' : 'Approved'}
              </span>
            </div>

            {finalDrug && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                  Active Safe Care Protocol:
                </span>
                <span style={{
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  color: '#0f766e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <CheckCircle2 size={13} style={{ color: '#0d9488' }} />
                  {finalDrug}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Clinical Safety Rationale */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '12px 14px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.72rem',
            fontWeight: 700,
            color: blocked ? '#b91c1c' : '#0f766e',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 6,
          }}>
            <Shield size={13} />
            Clinical Safety Evaluation
          </div>

          <p style={{
            fontSize: '0.80rem',
            lineHeight: 1.55,
            color: '#334155',
            margin: 0,
          }}>
            {result.safety_reasoning || (
              blocked
                ? `Safety interceptor triggered: ${drug} is contraindicated with the current patient profile.`
                : 'No adverse drug-drug interactions or allergy contraindications detected.'
            )}
          </p>

          {/* Interaction warnings (if any) */}
          {result.interaction_warnings?.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginTop: 10,
              paddingTop: 10,
              borderTop: '1px solid #e2e8f0',
            }}>
              {result.interaction_warnings.map((w, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '0.78rem',
                    color: '#92400e',
                    lineHeight: 1.45,
                  }}
                >
                  <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contraindication avoid list pills */}
        {result.avoid_list?.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
            paddingTop: 2,
          }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
              Documented Contraindications:
            </span>
            {result.avoid_list.map((d) => (
              <span
                key={d}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  padding: '2px 8px',
                  borderRadius: 4,
                  textTransform: 'capitalize',
                }}
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SafetyBanner
