// api.js — All fetch calls to the FastAPI backend
// In local dev or reverse proxy, empty string uses relative paths (/analyze)
// In production with standalone frontend, set VITE_API_BASE_URL (e.g. https://api.yourdomain.com)
const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

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
