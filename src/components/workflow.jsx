import React from 'react'
import * as Icons from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Card, Modal, Progress } from './ui'
import { IDR, fmtDate } from '../lib/format'
import { PIPELINE, nextActionForLead, nextActionForProspect, prospectSignals, recommendService } from '../lib/workflow'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

// ── Next action banner: Current State + Next Action + Due ──────────────
export function NextAction({ title, detail, due, tone = 'start', actionLabel, onAction }) {
  const tones = {
    start: 'bg-brand-700 text-white',
    hot: 'bg-amber-500 text-white',
    follow: 'bg-white text-ink-900 border border-ink-200 dark:bg-white/5 dark:text-white dark:border-white/10',
    done: 'bg-ink-100 text-ink-500 dark:bg-white/5 dark:text-slate-400'
  }
  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3 ${tones[tone] || tones.start}`}>
      <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">{I(tone === 'done' ? 'Check' : 'Zap')}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Next action</p>
        <p className="font-bold leading-tight">{title}</p>
        {detail && <p className="text-xs opacity-80 mt-0.5">{detail}{due ? ` · ${due}` : ''}</p>}
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className={`rounded-xl px-3.5 py-2 text-sm font-bold shrink-0 ${tone === 'follow' ? 'bg-brand-700 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>{actionLabel}</button>
      )}
    </div>
  )
}

// ── Contextual modal shell (no giant forms) ────────────────────────────
export function ActionModal({ open, onClose, title, sub, children }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {sub && <p className="text-sm muted -mt-1 mb-4">{sub}</p>}
      {children}
    </Modal>
  )
}

export function ChannelPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {['WhatsApp', 'Instagram', 'Email'].map((c) => (
        <button key={c} onClick={() => onChange(c)} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${value === c ? 'border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 dark:border-brand-500' : 'border-ink-200 hover:bg-ink-50 dark:border-white/10 dark:hover:bg-white/5'}`}>{c}</button>
      ))}
    </div>
  )
}

export function ResultPicker({ value, onChange }) {
  const opts = [
    ['NO_RESPONSE', 'No response'], ['RESPONDED', 'Responded'], ['INTERESTED', 'Interested'],
    ['NOT_INTERESTED', 'Not interested'], ['MEETING', 'Meeting scheduled']
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} className={`rounded-full px-3 py-1.5 text-xs font-bold border transition ${value === v ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900' : 'border-ink-200 muted hover:bg-ink-50 dark:border-white/10 dark:hover:bg-white/5'}`}>{l}</button>
      ))}
    </div>
  )
}

// ── Prospect card: who · why · value · status · next action ────────────
export function ProspectCard({ p, onApproach, onOpen }) {
  const signals = prospectSignals(p)
  const na = nextActionForProspect(p)
  return (
    <Card className="card-pad anim-fadeUp">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold truncate">{p.business}</p>
          <p className="text-xs muted">{p.category || 'Business'} · {p.city || '—'}</p>
        </div>
        <Badge value={p.potential === 'HIGH' ? 'HIGH' : p.potential || 'MEDIUM'} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs muted">
        <span className="inline-flex items-center gap-1">{I('Star', 13)} {p.rating || '—'} ({p.reviews || 0})</span>
        <span className="inline-flex items-center gap-1">{I('Globe', 13)} {p.website || 'No website'}</span>
        <span className="inline-flex items-center gap-1">{I('Instagram', 13)} {p.social || '—'}</span>
      </div>
      <div className="mt-3 rounded-xl bg-ink-50 dark:bg-white/5 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wider muted">Why this prospect?</p>
        <ul className="mt-1.5 space-y-1">
          {signals.map((s) => <li key={s} className="text-xs font-medium flex items-center gap-1.5"><span className="text-brand-600 dark:text-brand-400">{I('Check', 13)}</span>{s}</li>)}
        </ul>
        <p className="text-xs mt-2">Recommended: <b>{recommendService(p)}</b>{p.estValue ? ` · ${IDR(p.estValue)}` : ''}</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Badge value={p.status || 'NEW'} />
        <span className="text-xs muted flex-1 truncate">{na.label}</span>
        {p.status === 'NEW' && onApproach && <button onClick={() => onApproach(p)} className="btn-primary !py-2">Approach</button>}
        {p.status !== 'NEW' && onOpen && <button onClick={() => onOpen(p)} className="btn-secondary !py-2">Open</button>}
      </div>
    </Card>
  )
}

// ── Lead row card ──────────────────────────────────────────────────────
export function LeadCard({ lead, proposal, onOpen }) {
  const na = nextActionForLead(lead, proposal)
  return (
    <button onClick={onOpen} className="w-full text-left card card-pad hover:shadow-pop transition anim-fadeUp">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate">{lead.business}</p>
          <p className="text-xs muted truncate">{lead.contact || lead.city || ''} · {lead.category || ''}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold">{lead.value ? IDR(lead.value) : '—'}</p>
          <p className="text-[11px] muted">{lead.followUp ? `Due ${fmtDate(lead.followUp)}` : ''}</p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Badge value={lead.stage} />
        {proposal && ['SENT', 'AWAITING'].includes(proposal.status) && <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Proposal {proposal.status.toLowerCase()}</span>}
        <span className="text-xs muted flex-1 truncate text-right">{na.label}</span>
      </div>
    </button>
  )
}

// ── Vertical pipeline ──────────────────────────────────────────────────
export function LeadPipeline({ current }) {
  const idx = PIPELINE.indexOf(current)
  return (
    <div className="relative pl-5">
      <span className="absolute left-[7px] top-2 bottom-2 w-px bg-ink-200 dark:bg-white/10" />
      {PIPELINE.map((s, i) => {
        const done = idx >= 0 && i < idx
        const cur = s === current
        return (
          <div key={s} className="relative py-1.5 flex items-center gap-2.5">
            <span className={`absolute -left-5 w-[15px] h-[15px] rounded-full border-2 ${cur ? 'border-brand-600 bg-brand-600' : done ? 'border-brand-600 bg-brand-100 dark:bg-brand-900' : 'border-ink-300 bg-white dark:bg-transparent dark:border-white/20'}`} />
            <span className={`text-sm ${cur ? 'font-bold' : done ? 'font-medium' : 'muted'}`}>{s.replace(/_/g, ' ')}</span>
            {cur && <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">· current</span>}
          </div>
        )
      })}
    </div>
  )
}

// ── Immutable outreach timeline ────────────────────────────────────────
export function LeadTimeline({ items = [], users = [] }) {
  const uname = (id) => users.find((u) => u.id === id)?.name || 'System'
  if (!items.length) return <p className="text-sm muted">No interactions yet.</p>
  return (
    <div className="space-y-0">
      {items.map((o) => (
        <div key={o.id} className="flex gap-3 py-2.5 border-b border-ink-100 dark:border-white/5 last:border-0">
          <span className="w-8 h-8 rounded-xl bg-ink-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-ink-500 dark:text-slate-300">{I(o.channel === 'Email' ? 'Mail' : o.channel === 'Instagram' ? 'Instagram' : o.channel === 'Meeting' ? 'Users' : 'MessageCircle', 15)}</span>
          <div className="min-w-0">
            <p className="text-xs muted">{fmtDate(o.date)} · {o.channel} · {uname(o.by)}</p>
            <p className="text-sm font-semibold">{o.result}</p>
            {o.note && <p className="text-xs muted mt-0.5">{o.note}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Follow-up item ─────────────────────────────────────────────────────
export function FollowUpItem({ item, onFollowUp }) {
  const overdue = item.diff !== null && item.diff < 0
  return (
    <div className="card card-pad flex items-center gap-3 anim-fadeUp">
      <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold ${overdue ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'}`}>
        <span className="text-sm leading-none">{item.time ? item.time.slice(0, 2) : '•'}</span>
        <span className="text-[9px] font-semibold">{item.time ? item.time.slice(3) : 'TODO'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">{item.business}</p>
        <p className="text-xs muted truncate">{item.subtitle} · {item.channel}{item.assigneeName ? ` · ${item.assigneeName}` : ''}</p>
        {overdue && <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{Math.abs(item.diff)} days overdue</p>}
      </div>
      <button onClick={() => onFollowUp(item)} className={overdue ? 'btn-danger !py-2' : 'btn-primary !py-2'}>{overdue ? 'Handle' : 'Follow Up'}</button>
    </div>
  )
}

// ── Proposal card ──────────────────────────────────────────────────────
export function ProposalCard({ p, lead, onOpen }) {
  return (
    <Card className="card-pad anim-fadeUp">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold truncate">{lead?.business || p.title}</p>
          <p className="text-xs muted truncate">{p.service || ''}</p>
        </div>
        <Badge value={p.status} />
      </div>
      <p className="mt-1 font-display font-extrabold">{IDR(p.amount)}</p>
      <p className="text-xs muted mt-0.5">{p.sentAt ? `Sent ${fmtDate(p.sentAt)}` : 'Not sent yet'}{lead?.followUp ? ` · Follow up ${fmtDate(lead.followUp)}` : ''}</p>
      <button onClick={() => onOpen(p, lead)} className="btn-secondary w-full mt-3 !py-2">Open Deal</button>
    </Card>
  )
}

// ── Prioritized daily list ─────────────────────────────────────────────
export function DailyActionList({ items, onOpen }) {
  const nav = useNavigate()
  if (!items.length) return <div className="card card-pad text-sm muted">Nothing urgent. Nice work — explore Prospecting for new opportunities.</div>
  return (
    <div className="space-y-2.5">
      {items.slice(0, 8).map((a, i) => (
        <div key={a.kind + a.id} className="card card-pad flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-ink-100 dark:bg-white/10 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{a.title}</p>
            <p className="text-xs muted truncate">{a.subtitle} · {a.channel}{a.diff < 0 ? ` · ${Math.abs(a.diff)}d overdue` : ''}</p>
          </div>
          <button
            onClick={() => {
              if (onOpen) return onOpen(a)
              if (a.leadId) nav(`/leads/${a.leadId}`)
              else if (a.prospectId) nav('/prospecting')
              else nav('/follow-ups')
            }}
            className="btn-secondary !py-1.5 !px-3 !text-xs"
          >Open</button>
        </div>
      ))}
    </div>
  )
}

export function SummaryChips({ chips }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {chips.map((c) => (
        <div key={c.label} className="card card-pad text-center">
          <p className="font-display text-2xl font-extrabold">{c.value}</p>
          <p className="text-[11px] font-semibold muted uppercase tracking-wide mt-0.5">{c.label}</p>
        </div>
      ))}
    </div>
  )
}

export { Progress }
