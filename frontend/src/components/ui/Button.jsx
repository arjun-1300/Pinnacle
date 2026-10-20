// components/ui/Button.jsx — Multi-variant button with loading state
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

const VARIANT_MAP = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  success:   'btn-success',
  danger:    'btn-danger',
  warning:   'btn-warning',
  outline:   'btn-outline',
}

const SIZE_MAP = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  icon: 'btn-icon',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  full = false,
  children,
  className,
  id,
  onClick,
  type = 'button',
  ...rest
}) {
  return (
    <button
      id={id}
      type={type}
      className={cn(
        'btn',
        VARIANT_MAP[variant] ?? 'btn-primary',
        SIZE_MAP[size],
        full && 'btn-full',
        className,
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          {typeof children === 'string' ? 'Loading…' : children}
        </>
      ) : children}
    </button>
  )
}
