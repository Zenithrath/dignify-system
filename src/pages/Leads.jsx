import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { LeadCard, SummaryChips } from '../components/workflow'
import { ActionModal } from '../components/workflow'
import { Empty, Field, SearchInput } from '../components/ui'
import { todayISO } from '../lib/format'

const FILTERS = ['ALL', 'NEW', 'CONTACTED', 'RESPONDED', 'MEETING', 'PROPOSAL', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST']

export default function Leads() {
  const { db, me, api, canDo } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [stage, setStage] = useState('ALL')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState(null)

  const proposalOf = (leadId) => (db.proposals || []).filter((p) => p.leadId === leadId).sort((a, b) => String(b.sentAt || '').localeCompare(String(a.sentAt || '')))[0]

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (db.leads || [])
      .filter((l) => stage === 'ALL' || l.stage === stage)
      .filter((l) => !s || `${l.business} ${l.city} ${l.category} ${l.id}`.toLowerCase().includes(s))
      .sort((a, b) => String(a.followUp || '9999').localeCompare(String(b.followUp || '9999')))
  }, [db, q, stage])

  const stats = useMemo(() => {
    const L = db.leads || []
    const inStage = (...ss) => L.filter((l) => ss.includes(l.stage)).length
    return [
      { value: inStage('NEW', 'QUALIFIED'), label: 'New leads' },
      { value: inStage('CONTACTED', 'RESPONDED', 'MEETING'), label: 'Contacted' },
      { value: inStage('PROPOSAL', 'PROPOSAL_SENT'), label: 'Proposal' },
      { value: inStage('NEGOTIATION'), label: 'Negotiation' }
    ]
  }, [db])

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight dark:text-white">Leads</h1>
          <p className="text-sm muted mt-0.5">Meaningful interest only — not every scraped business. Outbound enters via Prospecting.</p>
        </div>
        {canDo('leads.manage') && (
          <button
            className="btn-primary shrink-0"
            onClick={() => { setForm({ business: '', contact: '', phone: '', category: '', city: '', source: 'Inbound', stage: 'NEW', score: 50, owner: me.id, value: 2500000, followUp: todayISO(), notes: '' }); setAdding(true) }}
          >+ Lead</button>
        )}
      </div>

      <SummaryChips chips={stats} />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1"><SearchInput value={q} onChange={setQ} placeholder="Search business, city…" /></div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setStage(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold border ${stage === f ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900' : 'border-ink-200 muted dark:border-white/10'}`}>{f.replace(/_/g, ' ')}</button>
          ))}
        </div>
      </div>

      {list.length === 0 && <div className="card"><Empty title="No leads" sub="Inbound inquiries land here directly. Outbound comes from Prospecting → Convert." /></div>}

      <div className="hidden sm:block card overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-ink-100 dark:border-white/10"><th className="th">Business</th><th className="th">Contact</th><th className="th">Stage</th><th className="th text-right">Value</th></tr></thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id} onClick={() => nav(`/leads/${l.id}`)} className="border-b border-ink-100 dark:border-white/5 last:border-0 hover:bg-ink-50 dark:hover:bg-white/5 cursor-pointer">
                <td className="td"><p className="font-bold dark:text-white">{l.business}</p><p className="text-[11px] muted">{l.id} · {l.city}</p></td>
                <td className="td text-sm muted">{l.contact || '—'}</td>
                <td className="td"><span className="badge bg-ink-100 text-ink-700 dark:bg-white/10 dark:text-slate-200">{String(l.stage || '').replace(/_/g, ' ')}</span></td>
                <td className="td text-right font-bold dark:text-white">{l.value ? `Rp${Number(l.value).toLocaleString('id-ID')}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2.5 sm:hidden">
        {list.map((l) => <LeadCard key={l.id} lead={l} proposal={proposalOf(l.id)} onOpen={() => nav(`/leads/${l.id}`)} />)}
      </div>

      <ActionModal open={adding} onClose={() => setAdding(false)} title="New lead" sub="Inbound inquiry — only what you need right now.">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Business *"><input className="input" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} /></Field>
            <Field label="Contact"><input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
            <Field label="Phone"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Est. value"><input type="number" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></Field>
            <div className="sm:col-span-2 flex gap-2 mt-1">
              <button onClick={() => setAdding(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => { const r = api.saveLead({ ...form, value: Number(form.value) || 0 }); if (!r?.error) { setAdding(false); setForm(null) } else alert(r.error) }}
                className="btn-primary flex-1"
              >Save lead</button>
            </div>
          </div>
        )}
      </ActionModal>
    </div>
  )
}
