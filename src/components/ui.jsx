import React from 'react'
import { badgeClass, fmtDate, initials } from '../lib/format'

export const Card = ({ className = '', children }) => (
  <div className={`card ${className}`}>{children}</div>
)

export const Badge = ({ value }) => (
  <span className={`badge ${badgeClass(value)}`}>{String(value || '—').replace(/_/g, ' ')}</span>
)

export const Avatar = ({ name, size = 'w-9 h-9 text-xs' }) => (
  <div className={`${size} rounded-full bg-brand-700 text-white flex items-center justify-center font-bold shrink-0`}>
    {initials(name)}
  </div>
)

export const Empty = ({ title, sub, action }) => (
  <div className="text-center py-10 px-6">
    <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 flex items-center justify-center text-xl mb-3">✦</div>
    <p className="font-bold text-ink-900 dark:text-white">{title}</p>
    {sub && <p className="text-sm text-ink-500 dark:text-slate-400 mt-1">{sub}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const Field = ({ label, children }) => (
  <label className="block">
    <span className="label">{label}</span>
    {children}
  </label>
)

export const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-900/50 dark:bg-black/70" onClick={onClose} />
      <div className={`relative bg-white dark:bg-[#131c19] w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} rounded-t-3xl sm:rounded-3xl shadow-pop max-h-[92vh] overflow-auto anim-fadeUp border border-transparent dark:border-white/10`}>
        <div className="sticky top-0 bg-white/95 dark:bg-[#131c19]/95 backdrop-blur px-5 py-4 border-b border-ink-100 dark:border-white/10 flex items-center justify-between rounded-t-3xl">
          <h3 className="font-display font-bold dark:text-white">{title}</h3>
          <button onClick={onClose} className="btn-ghost !px-2.5">✕</button>
        </div>
        <div className="p-5 dark:text-slate-200">{children}</div>
      </div>
    </div>
  )
}

export const Progress = ({ value }) => (
  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
    <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all" style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} />
  </div>
)

export const SearchInput = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm">⌕</span>
    <input className="input !pl-9" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
)
