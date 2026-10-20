// components/ui/Toast.jsx — Notification toast system
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

let _listeners = []
let _idCounter = 0

export function toast(message, { type = 'info', title, duration = 4000 } = {}) {
  const id = ++_idCounter
  _listeners.forEach(fn => fn({ id, message, title, type, duration }))
  return id
}
toast.success = (message, opts) => toast(message, { type: 'success', ...opts })
toast.error   = (message, opts) => toast(message, { type: 'error',   ...opts })
toast.info    = (message, opts) => toast(message, { type: 'info',    ...opts })

const ICONS = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  info:    <Info size={18} />,
}

function ToastItem({ id, message, title, type, duration, onRemove }) {
  const [hiding, setHiding] = useState(false)

  const dismiss = useCallback(() => {
    setHiding(true)
    setTimeout(() => onRemove(id), 300)
  }, [id, onRemove])

  useEffect(() => {
    const t = setTimeout(dismiss, duration)
    return () => clearTimeout(t)
  }, [dismiss, duration])

  return (
    <div className={`toast toast-${type} ${hiding ? 'hiding' : ''}`} role="alert">
      <span className={`toast-icon ${type}`}>{ICONS[type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div className="toast-content-title">{title}</div>}
        <div className="toast-content-body">{message}</div>
      </div>
      <button className="toast-close" onClick={dismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [items, setItems] = useState([])

  useEffect(() => {
    const handler = (item) => setItems(prev => [...prev, item])
    _listeners.push(handler)
    return () => { _listeners = _listeners.filter(fn => fn !== handler) }
  }, [])

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <div className="toast-container" aria-live="polite">
      {items.map(item => (
        <ToastItem key={item.id} {...item} onRemove={remove} />
      ))}
    </div>
  )
}
