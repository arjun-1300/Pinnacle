// InputPanel.jsx — Vitals & Medication Input Panel
import { useState, useCallback } from 'react'
import { api } from '../api'

const MEDS_OPTIONS    = ['warfarin', 'lisinopril', 'metformin']
const ALLERGY_OPTIONS = ['aspirin', 'ibuprofen']

function TagPill({ label, active, onToggle }) {
  return (
    <button
      type="button"
      className={`tag-pill ${active ? 'active' : ''}`}
      onClick={onToggle}
      aria-pressed={active}
    >
      {active && <span className="check">✓</span>}
      {label}
    </button>
  )
}

function VitalInput({ id, label, value, onChange, min, max, step = '0.1', unit }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label} {unit && <span style={{ fontWeight: 400, textTransform: 'none' }}>({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        className="form-input"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(e.target.value)}
        placeholder={`e.g. ${min}`}
      />
    </div>
  )
}

export default function InputPanel({ onAnalyze, loading }) {
  const [vitals, setVitals] = useState({
    heart_rate: '',
    spo2: '',
    temperature: '',
    systolic_bp: '',
  })
  const [meds,     setMeds]     = useState([])
  const [allergies, setAllergies] = useState([])
  const [simLoading, setSimLoading] = useState(false)
  const [simLabel,   setSimLabel]   = useState(null)

  function setVital(key) {
    return (val) => setVitals(v => ({ ...v, [key]: val }))
  }

  function toggleItem(list, setList, item) {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  async function loadSimulated() {
    setSimLoading(true)
    setSimLabel(null)
    try {
      const data = await api.simulate()
      setVitals({
        heart_rate:  String(data.heart_rate),
        spo2:        String(data.spo2),
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
    const payload = {
      heart_rate:   parseFloat(vitals.heart_rate),
      spo2:         parseFloat(vitals.spo2),
      temperature:  parseFloat(vitals.temperature),
      systolic_bp:  parseFloat(vitals.systolic_bp),
      current_meds: meds,
      allergies,
    }
    onAnalyze(payload)
  }, [vitals, meds, allergies, onAnalyze])

  const isValid = Object.values(vitals).every(v => v !== '' && !isNaN(parseFloat(v)))

  return (
    <div className="card slide-up">
      <div className="card-title"><span className="dot" />Patient Input</div>

      {/* Simulate button */}
      <button
        id="simulate-btn"
        type="button"
        className="btn btn-ghost btn-full"
        style={{ marginBottom: 16 }}
        onClick={loadSimulated}
        disabled={simLoading}
      >
        {simLoading
          ? <><span className="spinner" style={{ borderColor: 'rgba(100,100,100,0.3)', borderTopColor: 'var(--accent)' }} /> Loading…</>
          : '⚡ Load Simulated Patient'
        }
      </button>

      {/* Simulated label hint */}
      {simLabel && (
        <div style={{
          padding: '6px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '1px dashed var(--border)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: 14,
          textAlign: 'center',
        }}>
          Simulated class: <strong style={{ color: 'var(--accent)' }}>{simLabel}</strong>
        </div>
      )}

      {/* Vital Sign Inputs */}
      <div className="form-grid" style={{ marginBottom: 16 }}>
        <VitalInput id="hr-input"   label="Heart Rate"   unit="bpm"  value={vitals.heart_rate}  onChange={setVital('heart_rate')}  min={20}  max={250} step="1" />
        <VitalInput id="spo2-input" label="SpO₂"         unit="%"    value={vitals.spo2}         onChange={setVital('spo2')}         min={50}  max={100} step="0.1" />
        <VitalInput id="temp-input" label="Temperature"  unit="°C"   value={vitals.temperature}  onChange={setVital('temperature')}  min={34}  max={43}  step="0.01" />
        <VitalInput id="sbp-input"  label="Systolic BP"  unit="mmHg" value={vitals.systolic_bp}  onChange={setVital('systolic_bp')}  min={60}  max={250} step="1" />
      </div>

      {/* Medications */}
      <div className="tag-group" style={{ marginBottom: 14 }}>
        <span className="form-label">Current Medications</span>
        <div className="tag-pills">
          {MEDS_OPTIONS.map(m => (
            <TagPill key={m} label={m} active={meds.includes(m)}
              onToggle={() => toggleItem(meds, setMeds, m)} />
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="tag-group" style={{ marginBottom: 20 }}>
        <span className="form-label">Known Allergies</span>
        <div className="tag-pills">
          {ALLERGY_OPTIONS.map(a => (
            <TagPill key={a} label={a} active={allergies.includes(a)}
              onToggle={() => toggleItem(allergies, setAllergies, a)} />
          ))}
        </div>
      </div>

      {/* Analyze button */}
      <button
        id="analyze-btn"
        type="button"
        className="btn btn-primary btn-full"
        onClick={handleAnalyze}
        disabled={!isValid || loading}
      >
        {loading
          ? <><span className="spinner" /> Analyzing…</>
          : '🔬 Analyze Patient'
        }
      </button>
    </div>
  )
}
