// components/dashboard/AgentRiskCard.jsx — Baseten-style Multi-Agent Triage Display
import { TrendingUp, Activity, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '../../lib/cn'

const RISK_CONFIG = {
  Normal: {
    icon: '💚',
    heroClass: 'hero-normal',
    label: 'STABLE / LOW RISK',
    dotClass: 'dot-green',
    color: '#008744',
  },
  Warning: {
    icon: '⚠️',
    heroClass: 'hero-warning',
    label: 'MODERATE CLINICAL RISK',
    dotClass: 'dot-amber',
    color: '#b45309',
  },
  Critical: {
    icon: '🚨',
    heroClass: 'hero-critical',
    label: 'CRITICAL DECOMPENSATION',
    dotClass: 'dot-red',
    color: '#b91c1c',
  },
}

function EmptyState() {
  return (
    <div className="risk-hero hero-normal" style={{ background: '#fafaf9', borderColor: '#d1d5db' }}>
      <div className="risk-icon-wrap">
        <span style={{ fontSize: '1.6rem' }}>🫀</span>
      </div>
      <div className="risk-info">
        <div className="risk-level-label" style={{ fontSize: '1.1rem', color: '#4b5563' }}>
          STANDBY FOR INGESTION
        </div>
        <div className="risk-patient-id" style={{ fontFamily: 'var(--font-mono)' }}>
          Submit patient vitals to trigger 4-agent inference pipeline
        </div>
      </div>
    </div>
  )
}

function VitalsStrip({ vitals }) {
  if (!vitals) return null
  const chips = [
    { val: vitals.heart_rate, lbl: 'HR', unit: 'bpm' },
    { val: vitals.spo2, lbl: 'SpO₂', unit: '%' },
    { val: vitals.temperature, lbl: 'Temp', unit: '°C' },
    { val: vitals.systolic_bp, lbl: 'SBP', unit: 'mmHg' },
  ]
  return (
    <div className="vitals-strip">
      {chips.map(({ val, lbl, unit }) => (
        <div key={lbl} className="vital-chip">
          <div className="val">
            {typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 1) : val}
          </div>
          <div className="lbl">{lbl} ({unit})</div>
        </div>
      ))}
    </div>
  )
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value ?? 0) * 100)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        fontFamily: 'var(--font-mono)',
        color: '#4b5563',
        marginBottom: 6,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <TrendingUp size={12} /> MODEL CONFIDENCE
        </span>
        <strong style={{ color: '#000' }}>{pct}%</strong>
      </div>
      <div style={{
        width: '100%',
        height: 6,
        background: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'var(--baseten-green)',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}

function ActionsList({ actions, risk }) {
  if (!actions?.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
      {actions.map((action, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '8px 12px',
            background: '#fafaf9',
            border: '1px solid #e5e7eb',
            borderRadius: 2,
            fontSize: '0.78rem',
            lineHeight: 1.45,
            color: '#1f2937',
          }}
        >
          <ChevronRight size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--baseten-green-dark)' }} />
          <div>
            <strong style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: '#4b5563',
              marginRight: 6,
              textTransform: 'uppercase',
            }}>
              [ACTION {i + 1}]
            </strong>
            {action}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AgentRiskCard({ result }) {
  if (!result) {
    return (
      <div id="assessment-section" className="card animate-slide-up">
        <div className="card-header">
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
            Clinical Triage &amp; Risk Stratification
          </div>
          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#6b7280' }}>
            Multi-Agent Evaluator
          </span>
        </div>
        <EmptyState />
      </div>
    )
  }

  const cfg = RISK_CONFIG[result.predicted_risk] ?? RISK_CONFIG.Normal
  const pct = Math.round((result.confidence ?? 0) * 100)

  return (
    <div id="assessment-section" className="card animate-slide-up">
      {/* Clinical Header */}
      <div className="card-header">
        <div className="card-title-row">
          <span className={cn('card-eyebrow-dot', cfg.dotClass)} />
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
            Clinical Triage &amp; Risk Stratification
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {result.llm_powered ? (
            <span className="baseten-pill-green">
              <Sparkles size={11} style={{ marginRight: 3 }} />
              GEMINI 3 FLASH ACTIVE
            </span>
          ) : (
            <span className="badge badge-pending">
              HEURISTIC ENGINE
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
            #{result.audit_id?.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Risk Hero Banner */}
      <div className={cn('risk-hero', cfg.heroClass)}>
        <div className="risk-icon-wrap">
          <span>{cfg.icon}</span>
        </div>
        <div className="risk-info">
          <div className="risk-level-label" style={{ color: cfg.color }}>{cfg.label}</div>
          <div className="risk-patient-id">PATIENT RECORD: {result.patient_id}</div>
        </div>
        <div className="risk-conf-block">
          <div className="risk-conf-pct" style={{ color: cfg.color }}>{pct}%</div>
          <div className="risk-conf-label">Confidence</div>
        </div>
      </div>

      {/* Vitals Strip */}
      <VitalsStrip vitals={result.vitals} />

      {/* Confidence Bar */}
      <ConfidenceBar value={result.confidence} />

      {/* Clinical Rationale Box (Baseten Clean Style) */}
      {result.clinical_rationale && (
        <div style={{
          marginTop: 14,
          padding: '12px 16px',
          borderRadius: 2,
          background: '#fafaf9',
          border: '1px solid #e5e7eb',
          borderLeft: '4px solid var(--baseten-green)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#005a2b',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}>
              {result.llm_powered ? '✨ GEMINI AI CLINICAL SYNTHESIS' : '🤖 HEURISTIC REASONING'}
            </span>
            {result.llm_model && (
              <span style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: '#6b7280' }}>
                {result.llm_model}
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.80rem', lineHeight: 1.55, color: '#1f2937' }}>
            {result.clinical_rationale}
          </p>
        </div>
      )}

      {/* 4-Agent Pipeline Quick Status (Baseten Link Pill) */}
      <div
        onClick={() => document.getElementById('multi-agent-pipeline')?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          marginTop: 14,
          padding: '10px 14px',
          borderRadius: 2,
          background: '#fafaf9',
          border: '1px dashed #d1d5db',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="pulse-dot" />
          <span style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: '#111827',
          }}>
            4 AGENTS EVALUATED (MONITORING • PHARMACOLOGY • DECISION • SAFETY)
          </span>
        </div>
        <span style={{
          fontSize: '0.70rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          color: '#000000',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          textDecoration: 'underline',
        }}>
          VIEW DETAILS <ArrowRight size={12} />
        </span>
      </div>

      {/* Recommended Actions */}
      {result.suggested_actions?.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#374151',
            marginBottom: 8,
          }}>
            PRIORITIZED CLINICAL ACTIONS ({result.suggested_actions.length})
          </div>
          <ActionsList actions={result.suggested_actions} risk={result.predicted_risk} />
        </div>
      )}
    </div>
  )
}
