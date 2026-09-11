export const IDR = (n) => {
  if (n === null || n === undefined || n === '') return '—'
  const v = Number(n)
  if (Number.isNaN(v)) return String(n)
  return 'Rp' + v.toLocaleString('id-ID')
}

export const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const fmtDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export const todayISO = () => new Date().toISOString().slice(0, 10)
export const nowISO = () => new Date().toISOString()
export const addDays = (iso, days) => {
  const d = iso ? new Date(iso) : new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const daysUntil = (iso) => {
  if (!iso) return null
  const a = new Date(todayISO())
  const b = new Date(iso.length <= 10 ? iso : iso.slice(0, 10))
  return Math.round((b - a) / 86400000)
}

export const uid = (prefix) => {
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  const t = Date.now().toString(36).slice(-4).toUpperCase()
  return `${prefix}${r}${t}`
}

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?'

export const STATUS_COLORS = {
  // generic
  NEW: 'bg-sky-100 text-sky-800',
  QUALIFIED: 'bg-indigo-100 text-indigo-800',
  CONTACTED: 'bg-amber-100 text-amber-800',
  RESPONDED: 'bg-teal-100 text-teal-800',
  MEETING: 'bg-violet-100 text-violet-800',
  PROPOSAL_SENT: 'bg-blue-100 text-blue-800',
  PROPOSAL: 'bg-blue-100 text-blue-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  WON: 'bg-brand-100 text-brand-800',
  LOST: 'bg-red-100 text-red-700',
  ACTIVE: 'bg-brand-100 text-brand-800',
  INACTIVE: 'bg-ink-100 text-ink-500',
  // project
  PLANNING: 'bg-slate-200 text-slate-700',
  DESIGN: 'bg-violet-100 text-violet-800',
  DEVELOPMENT: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-amber-100 text-amber-800',
  REVISION: 'bg-orange-100 text-orange-800',
  DEPLOYMENT: 'bg-teal-100 text-teal-800',
  COMPLETED: 'bg-brand-100 text-brand-800',
  ON_HOLD: 'bg-stone-200 text-stone-600',
  CANCELLED: 'bg-red-100 text-red-700',
  // task
  TODO: 'bg-ink-100 text-ink-700',
  PENDING: 'bg-ink-100 text-ink-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  DONE: 'bg-brand-100 text-brand-800',
  BLOCKED: 'bg-red-100 text-red-700',
  // maintenance / finance
  SCHEDULED: 'bg-sky-100 text-sky-800',
  UPCOMING: 'bg-indigo-100 text-indigo-800',
  OVERDUE: 'bg-red-100 text-red-700',
  PAID: 'bg-brand-100 text-brand-800',
  UNPAID: 'bg-amber-100 text-amber-800',
  PARTIAL: 'bg-blue-100 text-blue-800',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800',
  DRAFT: 'bg-ink-100 text-ink-500',
  SENT: 'bg-blue-100 text-blue-800',
  // priority
  LOW: 'bg-ink-100 text-ink-500',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-700'
}

export const badgeClass = (s) => STATUS_COLORS[String(s || '').toUpperCase()] || 'bg-ink-100 text-ink-700'
