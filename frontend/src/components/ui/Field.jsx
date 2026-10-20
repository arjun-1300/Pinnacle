// components/ui/Field.jsx — Professional Medical Form Field
import { cn } from '../../lib/cn'

export function Field({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = '0.1',
  unit,
  referenceRange,
  className
}) {
  return (
    <div className={cn('field', className)}>
      <div className="field-header">
        <label className="field-label" htmlFor={id}>{label}</label>
        {referenceRange && (
          <span className="field-reference-range">{referenceRange}</span>
        )}
      </div>
      <div className="field-input-wrap">
        <input
          id={id}
          type="number"
          className="field-input"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(e.target.value)}
          placeholder={min ? `Min: ${min}` : ''}
          autoComplete="off"
        />
        {unit && <span className="field-unit">{unit}</span>}
      </div>
    </div>
  )
}
