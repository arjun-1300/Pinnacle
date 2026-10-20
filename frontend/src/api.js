// api.js — All fetch calls to the FastAPI backend (proxied by Vite)

const BASE = ''   // Vite dev proxy handles /analyze, /decide, /simulate, /audit

async function apiFetch(method, path, body) {
  const opts = {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }
  const res = await fetch(BASE + path, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data?.detail ?? `HTTP ${res.status}`)
  return data
}

export const api = {
  simulate: () => apiFetch('GET', '/simulate'),
  analyze:  (payload) => apiFetch('POST', '/analyze', payload),
  decide:   (choice) => apiFetch('POST', `/decide/${choice}`),
  audit:    () => apiFetch('GET', '/audit'),
  health:   () => apiFetch('GET', '/health'),
}
