// useTheme.js — CSS-native dark mode via <meta name="color-scheme">
// Follows the dark-mode-toggle guidance: tri-state (light dark / light / dark)
// stored in localStorage, reflected in <meta> so light-dark() CSS picks it up.

import { useState, useEffect, useCallback } from 'react'

const META_KEY = 'color-scheme'

function getMetaEl() {
  return document.querySelector('meta[name="color-scheme"]')
}

function getSystemScheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolvedScheme() {
  try {
    const stored = localStorage.getItem(META_KEY)
    return stored ?? getSystemScheme()
  } catch {
    return getSystemScheme()
  }
}

export function useTheme() {
  const [scheme, setScheme] = useState(resolvedScheme)

  // Keep state in sync with storage events from other tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === META_KEY) {
        const next = e.newValue ?? getSystemScheme()
        setScheme(next)
        const meta = getMetaEl()
        if (meta) meta.content = e.newValue ?? 'light dark'
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback(() => {
    const current = resolvedScheme()
    const target = current === 'dark' ? 'light' : 'dark'
    const sysPref = getSystemScheme()

    try {
      if (target === sysPref) {
        localStorage.removeItem(META_KEY)
        getMetaEl().content = 'light dark'
        setScheme(sysPref)
      } else {
        localStorage.setItem(META_KEY, target)
        getMetaEl().content = target
        setScheme(target)
      }
    } catch {
      getMetaEl().content = target
      setScheme(target)
    }
  }, [])

  return { scheme, toggle }
}
