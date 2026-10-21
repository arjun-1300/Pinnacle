// components/ui/Badge.jsx — Variant pill badges
import { cn } from '../../lib/cn'

const VARIANTS = {
  normal:    'badge-normal',
  warning:   'badge-warning',
  critical:  'badge-critical',
  blocked:   'badge-blocked',
  approved:  'badge-approved',
  overridden:'badge-overridden',
  pending:   'badge-pending',
  safe:      'badge-safe',
  accent:    'badge-accent',
}

export function Badge({ variant = 'pending', children, size = 'sm', className }) {
  return (
    <span className={cn('badge', VARIANTS[variant] ?? 'badge-pending', size === 'lg' && 'badge-lg', className)}>
      {children}
    </span>
  )
}

// Map API predicted_risk strings to badge variants
export function RiskBadge({ risk, ...props }) {
  const variant = risk?.toLowerCase() ?? 'pending'
  return <Badge variant={variant} {...props}>{risk ?? '—'}</Badge>
}

// Map physician_verdict to badge variants
export function VerdictBadge({ verdict, ...props }) {
  if (!verdict) return <Badge variant="pending" {...props}>Pending</Badge>
  const v = verdict.toLowerCase()
  const label = v === 'approved' ? 'Approved' : v === 'overridden' ? 'Overridden' : verdict
  return <Badge variant={v} {...props}>{label}</Badge>
}
