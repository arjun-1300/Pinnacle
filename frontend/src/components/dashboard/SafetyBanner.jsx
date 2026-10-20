// components/dashboard/SafetyBanner.jsx — Baseten-style Safety Firewall Callout
import { ShieldX, ShieldCheck, AlertTriangle, Check, Shield } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SafetyBanner({ result }) {
  if (!result) return null

  const blocked = result.drug_blocked
  const drug = result.candidate_drug

  return (
    <div id="safety-firewall" className={cn('safety-banner', blocked ? 'blocked' : 'safe')} style={{ marginTop: 14 }}>
      {/* Header */}
      <div className="safety-banner-head">
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 2,
          background: blocked ? '#fee2e2' : '#e6fcf1',
          color: blocked ? '#b91c1c' : '#008744',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${blocked ? '#fca5a5' : 'rgba(0,229,117,0.4)'}`,
          flexShrink: 0,
        }}>
          {blocked ? <ShieldX size={18} /> : <ShieldCheck size={18} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div className="safety-banner-title">
              {blocked ? 'SAFETY AGENT // DRUG INTERCEPTED' : 'SAFETY AGENT // ZERO CONTRAINDICATIONS'}
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 2,
              background: blocked ? '#ef4444' : 'var(--baseten-green)',
              color: blocked ? '#ffffff' : '#000000',
            }}>
              {blocked ? 'INTERCEPTED' : 'CLEARED'}
            </span>
          </div>
          <div className="safety-banner-sub">
            {blocked
              ? 'Contraindicated drug candidate forcefully removed before physician sign-off'
              : 'Proposed therapeutic interventions verified against allergy and DDI databases'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="safety-banner-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Full block description when drug is blocked */}
        {blocked && drug && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 14px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 2,
            fontSize: '0.78rem',
            lineHeight: 1.5,
            color: '#991b1b',
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2, color: '#dc2626' }} />
            <div>
              <strong style={{ display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '0.70rem' }}>
                [BLOCKED BY ZERO-TOLERANCE GATEKEEPER]
              </strong>
              Contraindicated interaction detected. Proposed medication <code style={{ textDecoration: 'line-through', color: '#dc2626', background: 'transparent', border: 'none', padding: 0 }}>{drug}</code> intercepted and removed.
            </div>
          </div>
        )}

        {/* Interaction warnings */}
        {result.interaction_warnings?.map((w, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 2,
              fontSize: '0.76rem',
              color: '#92400e',
            }}
          >
            <AlertTriangle size={14} style={{ flexShrink: 0, color: '#d97706' }} />
            <span>{w}</span>
          </div>
        ))}

        {/* Drug Status Strip */}
        {drug && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            padding: '6px 0',
          }}>
            <span style={{ color: '#6b7280', textTransform: 'uppercase' }}>PROPOSED DRUG:</span>
            {blocked ? (
              <span style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '2px 8px',
                borderRadius: 2,
                fontWeight: 700,
                border: '1px solid #fca5a5',
              }}>
                🚫 {drug} (BLOCKED)
              </span>
            ) : (
              <span style={{
                background: '#e6fcf1',
                color: '#005a2b',
                padding: '2px 8px',
                borderRadius: 2,
                fontWeight: 700,
                border: '1px solid rgba(0,229,117,0.4)',
              }}>
                ✓ {drug} (APPROVED)
              </span>
            )}

            {result.final_drug && result.final_drug !== drug && (
              <>
                <span style={{ color: '#6b7280' }}>→ FINAL SAFE RX:</span>
                <span style={{
                  background: '#e6fcf1',
                  color: '#005a2b',
                  padding: '2px 8px',
                  borderRadius: 2,
                  fontWeight: 700,
                  border: '1px solid rgba(0,229,117,0.4)',
                }}>
                  ✓ {result.final_drug}
                </span>
              </>
            )}
          </div>
        )}

        {/* LLM Safety Audit Rationale */}
        {result.safety_reasoning && (
          <div style={{
            fontSize: '0.78rem',
            lineHeight: 1.5,
            color: '#1f2937',
            background: '#fafaf9',
            padding: '10px 14px',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            borderLeft: blocked ? '3px solid #ef4444' : '3px solid var(--baseten-green)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: blocked ? '#b91c1c' : '#008744',
              marginBottom: 4,
            }}>
              {result.agent_llm_status?.safety_agent ? '✨ GEMINI SAFETY AUDIT' : '🛡️ GATEKEEPER AUDIT'}
            </div>
            {result.safety_reasoning}
          </div>
        )}

        {/* Contraindication avoid list */}
        {result.avoid_list?.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.70rem',
              color: '#6b7280',
              textTransform: 'uppercase',
            }}>
              CONTRAINDICATION LIST:
            </span>
            {result.avoid_list.map(d => (
              <span
                key={d}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  background: '#fef2f2',
                  color: '#991b1b',
                  padding: '2px 6px',
                  borderRadius: 2,
                  border: '1px solid #fecaca',
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
