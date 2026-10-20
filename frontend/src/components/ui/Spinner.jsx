// components/ui/Spinner.jsx — Polished loading spinner
import { cn } from '../../lib/cn'

export function Spinner({ size = 'md', dark = false, className }) {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''
  return (
    <span
      className={cn('spinner', dark && 'spinner-dark', sizeClass, className)}
      aria-label="Loading"
      role="status"
    />
  )
}
