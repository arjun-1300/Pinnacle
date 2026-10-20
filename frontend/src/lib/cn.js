// lib/cn.js — Lightweight classnames combiner (clsx-style)
// Usage: cn('base', condition && 'extra', { active: isActive })
export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .map(arg => {
      if (typeof arg === 'string') return arg
      if (typeof arg === 'object') {
        return Object.entries(arg)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k)
          .join(' ')
      }
      return ''
    })
    .join(' ')
    .trim()
}
