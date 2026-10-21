// components/dashboard/VitalsForm.jsx — Baseten-style Patient Vitals Input Console
import { useState, useCallback } from 'react'
import { Zap, Heart, Thermometer, Activity, Pill, AlertTriangle, ArrowRight, Sliders, Check, UserCheck } from 'lucide-react'
import { Field } from '../ui/Field'
import { Spinner } from '../ui/Spinner'
import { api } from '../../api'

const MEDS_OPTIONS = ['warfarin', 'lisinopril', 'metformin']
const ALLERGY_OPTIONS = ['aspirin', 'ibuprofen']

const PRESETS = {
  normal: {
    label: 'NORMAL BASELINE',
    description: 'HR 75 · SpO₂ 98 · 36.8°C · 120 mmHg',
    vitals: { heart_rate: '75', spo2: '98', temperature: '36.8', systolic_bp: '120' },
    meds: [], allergies: [],
  },
  critical: {
    label: 'CRITICAL CASE',
    description: 'HR 125 · SpO₂ 89 · 39.3°C · 160 mmHg + Warfarin',
    vitals: { heart_rate: '125', spo2: '89', temperature: '39.3', systolic_bp: '160' },
    meds: ['warfarin'], allergies: ['aspirin'],
  },
}

function Chip({ label, active, type = 'med', onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: '0.78rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: active ? '#f0fdfa' : '#ffffff',
        color: active ? '#0f766e' : '#475569',
        border: active ? '1px solid #0d9488' : '1px solid #e2e8f0',
        boxShadow: active ? '0 1px 2px rgba(13, 148, 136, 0.12)' : 'none',
      }}
    >
      {active && <Check size={13} style={{ color: '#0f766e', strokeWidth: 2.5 }} />}
      {label}
    </button>
  )
}

export function VitalsForm({
  onAnalyze,
  loading,
  pendingReview = false,
  pendingPatientId = null,
  onScrollToReview,
}) {
  const [vitals, setVitals] = useState({
    heart_rate: '115', spo2: '92', temperature: '38.2', systolic_bp: '142',
  })
  const [meds, setMeds] = useState(['lisinopril'])
  const [allergies, setAllergies] = useState(['aspirin'])
  const [simLoading, setSimLoading] = useState(false)
  const [simLabel, setSimLabel] = useState(null)

  function setVital(key) {
    return (val) => setVitals(v => ({ ...v, [key]: val }))
  }

  function toggleItem(list, setList, item) {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  function applyPreset(key) {
    const p = PRESETS[key]
    setVitals(p.vitals)
    setMeds(p.meds)
    setAllergies(p.allergies)
    setSimLabel(null)
  }

  async function loadSimulated() {
    setSimLoading(true)
    setSimLabel(null)
    try {
      const data = await api.simulate()
      setVitals({
        heart_rate: String(data.heart_rate),
        spo2: String(data.spo2),
        temperature: String(data.temperature),
        systolic_bp: String(data.systolic_bp),
      })
      setMeds(data.current_meds ?? [])
      setAllergies(data.allergies ?? [])
      setSimLabel(data.true_label)
    } catch (err) {
      console.error('Simulate failed:', err)
    } finally {
      setSimLoading(false)
    }
  }

  const handleAnalyze = useCallback(() => {
    onAnalyze({
      heart_rate: parseFloat(vitals.heart_rate),
      spo2: parseFloat(vitals.spo2),
      temperature: parseFloat(vitals.temperature),
      systolic_bp: parseFloat(vitals.systolic_bp),
      current_meds: meds,
      allergies,
    })
  }, [vitals, meds, allergies, onAnalyze])

  const isValid = Object.values(vitals).every(v => v !== '' && !isNaN(parseFloat(v)))

  return (
    <div id="clinical-console" className="card animate-slide-up">
      {/* Clean Clinical Header */}
      <div className="card-header">
        <div className="card-title-row">
          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827' }}>
            Patient Vitals &amp; Medical History
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#6b7280' }}>
          Clinical Input
        </span>
      </div>

      {/* Preset Case Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 18,
      }}>
        <button
          id="simulate-btn"
          type="button"
          onClick={loadSimulated}
          disabled={simLoading || pendingReview}
          className="btn-baseten-outline"
          style={{ padding: '8px 10px', fontSize: '0.76rem', justifyContent: 'center' }}
        >
          {simLoading ? <><Spinner size="sm" /> Loading...</> : <><Zap size={13} /> Random Case</>}
        </button>

        <button
          id="preset-normal-btn"
          type="button"
          onClick={() => applyPreset('normal')}
          disabled={pendingReview}
          className="btn-baseten-outline"
          style={{ padding: '8px 10px', fontSize: '0.76rem', justifyContent: 'center' }}
        >
          <Heart size={13} style={{ marginRight: 4, color: '#059669' }} /> Normal Baseline
        </button>

        <button
          id="preset-critical-btn"
          type="button"
          onClick={() => applyPreset('critical')}
          disabled={pendingReview}
          className="btn-baseten-outline"
          style={{ padding: '8px 10px', fontSize: '0.76rem', justifyContent: 'center' }}
        >
          <AlertTriangle size={13} style={{ marginRight: 4, color: '#dc2626' }} /> Critical Case
        </button>
      </div>

      {/* Simulated class hint */}
      {simLabel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '8px 12px',
          borderRadius: 6,
          fontSize: '0.76rem',
          color: '#334155',
          marginBottom: 16,
        }}>
          <Zap size={14} style={{ color: '#0f766e' }} />
          <span>Simulated Ground Truth: <strong style={{ color: '#0f172a' }}>{simLabel}</strong></span>
        </div>
      )}

      {/* Vitals inputs (Clean Professional Medical Fields) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
        marginBottom: 20,
      }}>
        <Field
          id="hr-input"
          label="Heart Rate"
          unit="bpm"
          referenceRange="60–100 bpm"
          value={vitals.heart_rate}
          onChange={setVital('heart_rate')}
          min={20}
          max={250}
          step="1"
        />
        <Field
          id="spo2-input"
          label="Blood Oxygen (SpO₂)"
          unit="%"
          referenceRange="95–100%"
          value={vitals.spo2}
          onChange={setVital('spo2')}
          min={50}
          max={100}
          step="0.1"
        />
        <Field
          id="temp-input"
          label="Body Temperature"
          unit="°C"
          referenceRange="36.5–37.5°C"
          value={vitals.temperature}
          onChange={setVital('temperature')}
          min={34}
          max={43}
          step="0.01"
        />
        <Field
          id="sbp-input"
          label="Systolic BP"
          unit="mmHg"
          referenceRange="90–120 mmHg"
          value={vitals.systolic_bp}
          onChange={setVital('systolic_bp')}
          min={60}
          max={250}
          step="1"
        />
      </div>

      {/* Medications & Allergies Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 16,
        marginBottom: 22,
      }}>
        {/* Active Medications */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.70rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#4b5563',
            marginBottom: 8,
          }}>
            <Pill size={12} /> Active Medications
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {MEDS_OPTIONS.map(m => (
              <Chip
                key={m}
                label={m}
                type="med"
                active={meds.includes(m)}
                onToggle={() => toggleItem(meds, setMeds, m)}
              />
            ))}
          </div>
        </div>

        {/* Documented Allergies */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.70rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#4b5563',
            marginBottom: 8,
          }}>
            <AlertTriangle size={12} /> Documented Allergies
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ALLERGY_OPTIONS.map(a => (
              <Chip
                key={a}
                label={a}
                type="allergy"
                active={allergies.includes(a)}
                onToggle={() => toggleItem(allergies, setAllergies, a)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submit Inference Button */}
      <button
        id="analyze-btn"
        type="button"
        className="btn-baseten-primary"
        style={{
          width: '100%',
          padding: '11px 18px',
          fontSize: '0.88rem',
          opacity: pendingReview ? 0.6 : 1,
          cursor: pendingReview ? 'not-allowed' : 'pointer',
        }}
        disabled={!isValid || loading || pendingReview}
        onClick={handleAnalyze}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Evaluating Clinical Multi-Agent Pipeline...</span>
          </>
        ) : pendingReview ? (
          <>
            <UserCheck size={16} />
            <span>Doctor Sign-off Required Before Next Case</span>
          </>
        ) : (
          <>
            <Activity size={16} />
            <span>Run Multi-Agent Evaluation →</span>
          </>
        )}
      </button>

      {/* Notice Banner when Doctor Sign-off is Pending */}
      {pendingReview && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 6,
          fontSize: '0.78rem',
          color: '#92400e',
          marginTop: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0 }} />
            <span>
              <strong>Doctor Sign-off Required:</strong> Please complete <em>Approve Recommendation</em> or <em>Clinical Override</em> for Patient {pendingPatientId || ''} before evaluating another case.
            </span>
          </div>
          {onScrollToReview && (
            <button
              type="button"
              onClick={onScrollToReview}
              style={{
                background: '#ffffff',
                border: '1px solid #fde68a',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#b45309',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginLeft: 10,
              }}
            >
              Sign-off Now ↓
            </button>
          )}
        </div>
      )}
    </div>
  )
}
