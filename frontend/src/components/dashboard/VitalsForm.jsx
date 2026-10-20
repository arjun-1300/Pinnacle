// components/dashboard/VitalsForm.jsx — Baseten-style Patient Vitals Input Console
import { useState, useCallback } from 'react'
import { Zap, Heart, Thermometer, Activity, Pill, AlertTriangle, ArrowRight, Sliders, Check } from 'lucide-react'
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
        padding: '5px 10px',
        borderRadius: 2,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.74rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: active ? '#e6fcf1' : '#ffffff',
        color: active ? '#005a2b' : '#374151',
        border: active ? '1px solid #00e575' : '1px solid #d1d5db',
        boxShadow: active ? '0 1px 3px rgba(0, 229, 117, 0.2)' : 'none',
      }}
    >
      {active && <Check size={12} style={{ color: '#008744', strokeWidth: 3 }} />}
      {label}
    </button>
  )
}

export function VitalsForm({ onAnalyze, loading }) {
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
            Patient Physiological Parameters
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#6b7280' }}>
          Interactive Clinical Console
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
          disabled={simLoading}
          className="btn-baseten-outline"
          style={{ padding: '8px 10px', fontSize: '0.72rem', justifyContent: 'center' }}
        >
          {simLoading ? <><Spinner size="sm" /> LOADING...</> : <><Zap size={12} /> RANDOM CASE</>}
        </button>

        <button
          id="preset-normal-btn"
          type="button"
          onClick={() => applyPreset('normal')}
          className="btn-baseten-outline"
          style={{ padding: '8px 10px', fontSize: '0.72rem', justifyContent: 'center' }}
        >
          <Heart size={12} style={{ marginRight: 3, color: '#008744' }} /> NORMAL BASELINE
        </button>

        <button
          id="preset-critical-btn"
          type="button"
          onClick={() => applyPreset('critical')}
          className="btn-baseten-outline"
          style={{ padding: '8px 10px', fontSize: '0.72rem', justifyContent: 'center' }}
        >
          <AlertTriangle size={12} style={{ marginRight: 3, color: '#ef4444' }} /> CRITICAL CASE
        </button>
      </div>

      {/* Simulated class hint */}
      {simLabel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: '#fafaf9',
          border: '1px dashed #d1d5db',
          padding: '8px 12px',
          borderRadius: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: '#111827',
          marginBottom: 16,
        }}>
          <Zap size={13} style={{ color: 'var(--baseten-green-dark)' }} />
          Simulated Ground Truth: <strong style={{ textTransform: 'uppercase' }}>{simLabel}</strong>
        </div>
      )}

      {/* Vitals inputs (Clean Professional Medical Fields) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 18,
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

      {/* Active Medications */}
      <div style={{ marginBottom: 14 }}>
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
          marginBottom: 6,
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
      <div style={{ marginBottom: 20 }}>
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
          marginBottom: 6,
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

      {/* Submit Inference Button (Baseten Stark Black / Green CTA) */}
      <button
        id="analyze-btn"
        type="button"
        className="btn-baseten-primary"
        style={{ width: '100%', padding: '12px 18px', fontSize: '0.84rem' }}
        disabled={!isValid || loading}
        onClick={handleAnalyze}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>RUNNING 4-AGENT INFERENCE...</span>
          </>
        ) : (
          <>
            <Activity size={16} />
            <span>RUN MULTI-AGENT INFERENCE &gt;</span>
          </>
        )}
      </button>
    </div>
  )
}
