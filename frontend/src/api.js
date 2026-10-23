// api.js — All fetch calls to the FastAPI backend
// In local dev or reverse proxy, empty string uses relative paths (/analyze)
// In production with standalone frontend, set VITE_API_BASE_URL (e.g. https://api.yourdomain.com)
const BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '')

async function apiFetch(method, path, body) {
  const targetUrl = `${BASE}${path}`
  const opts = {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }

  const res = await fetch(targetUrl, opts)
  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!isJson) {
    const rawText = await res.text()
    if (!BASE) {
      throw new Error(
        `Backend URL is not configured. On Vercel, go to Settings → Environment Variables and add VITE_API_BASE_URL (pointing to your deployed FastAPI backend).`
      )
    }
    throw new Error(
      `Backend returned non-JSON response (HTTP ${res.status}): ${rawText.slice(0, 120)}`
    )
  }

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
