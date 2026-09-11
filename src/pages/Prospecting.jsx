import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { ProspectCard, SummaryChips } from '../components/workflow'
import { ApproachModal } from '../components/actions'
import { ActionModal } from '../components/workflow'
import { Empty, Field, SearchInput } from '../components/ui'

export default function Prospecting() {
  const { db, api, canDo } = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [approach, setApproach] = useState(null)
  const [detail, setDetail] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ business: '', category: '', city: '', phone: '', contact: '', potential: 'MEDIUM', estValue: '', preferredChannel: 'WhatsApp', notes: '' })

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (db.prospects || [])
      .filter((p) => filter === 'ALL' || (p.status || 'NEW') === filter)
      .filter((p) => !s || `${p.business} ${p.city} ${p.category} ${p.id}`.toLowerCase().includes(s))
      .sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 }[a.potential] ?? 1) - (({ HIGH: 0, MEDIUM: 1, LOW: 2 }[b.potential]) ?? 1))
  }, [db, q, filter])

  const counts = useMemo(() => {
    const ps = db.prospects || []
    return {
      ready: ps.filter((p) => p.status === 'NEW').length,
      contacted: ps.filter((p) => p.status === 'CONTACTED').length,
      responded: ps.filter((p) => p.status === 'RESPONDED').length
    }
  }, [db])

  const saveNew = () => {
    const r = api.saveProspect({ ...form, estValue: Number(form.estValue) || 0 })
    if (r?.error) return alert(r.error)
    setAdding(false)
    setForm({ business: '', category: '', city: '', phone: '', contact: '', potential: 'MEDIUM', estValue: '', preferredChannel: 'WhatsApp', notes: '' })
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight dark:text-white">Prospecting</h1>
          <p className="text-sm muted mt-0.5">Find → Qualify → Prioritize → Approach. A prospect is not automatically a lead.</p>
        </div>
        {canDo('prospects.manage') && <button onClick={() => setAdding(true)} className="btn-primary shrink-0">+ Prospect</button>}
      </div>

      <SummaryChips chips={[
        { value: counts.ready, label: 'Ready to approach' },
        { value: counts.contacted, label: 'Contacted' },
        { value: counts.responded, label: 'Responded' }
      ]} />

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1"><SearchInput value={q} onChange={setQ} placeholder="Search businesses…" /></div>
        <div className="flex gap-1.5 flex-wrap">
          {['ALL', 'NEW', 'CONTACTED', 'RESPONDED', 'CONVERTED'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold border ${filter === f ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900' : 'border-ink-200 muted dark:border-white/10'}`}>{f}</button>
          ))}
        </div>
      </div>

      {list.length === 0 && <div className="card"><Empty title="No prospects" sub="Add businesses from scraping, research, or directories." /></div>}

      <div className="grid sm:grid-cols-2 gap-3">
        {list.map((p) => (
          <ProspectCard
            key={p.id}
            p={p}
            onApproach={canDo('prospects.approach') ? setApproach : undefined}
            onOpen={setDetail}
          />
        ))}
      </div>

      <ApproachModal prospect={approach} open={!!approach} onClose={() => setApproach(null)} />

      <ActionModal open={!!detail} onClose={() => setDetail(null)} title={detail?.business || ''} sub={detail ? `${detail.category || ''} · ${detail.city || ''}` : ''}>
        {detail && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-ink-50 dark:bg-white/5 p-3"><p className="text-[11px] font-bold uppercase muted">Contact</p><p className="font-semibold">{detail.contact || '—'}</p><p className="text-xs muted">{detail.phone || ''}</p></div>
              <div className="rounded-xl bg-ink-50 dark:bg-white/5 p-3"><p className="text-[11px] font-bold uppercase muted">Status</p><p className="font-semibold">{detail.status}</p><p className="text-xs muted">{detail.potential} potential</p></div>
            </div>
            {detail.notes && <p className="text-sm">{detail.notes}</p>}
            <div className="flex gap-2">
              {detail.status === 'NEW' && canDo('prospects.approach') && <button onClick={() => { setDetail(null); setApproach(detail) }} className="btn-primary flex-1">Approach</button>}
              {detail.status === 'RESPONDED' && canDo('leads.convert') && (
                <button
                  onClick={() => { const r = api.convertProspectToLead(detail.id); if (!r?.error) setDetail(null); }}
                  className="btn-primary flex-1"
                >Convert to Lead</button>
              )}
              {detail.status === 'CONTACTED' && <p className="text-xs muted flex-1">Waiting for response — follow up from Home or Follow-ups.</p>}
            </div>
          </div>
        )}
      </ActionModal>

      <ActionModal open={adding} onClose={() => setAdding(false)} title="New prospect" sub="Only what you know now — details come with the action.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Business *"><input className="input" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} /></Field>
          <Field label="Contact person"><input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
          <Field label="Category"><input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="City"><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Phone"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Est. value (Rp)"><input type="number" className="input" value={form.estValue} onChange={(e) => setForm({ ...form, estValue: e.target.value })} /></Field>
          <Field label="Potential">
            <select className="input" value={form.potential} onChange={(e) => setForm({ ...form, potential: e.target.value })}>
              <option>HIGH</option><option>MEDIUM</option><option>LOW</option>
            </select>
          </Field>
          <Field label="Channel">
            <select className="input" value={form.preferredChannel} onChange={(e) => setForm({ ...form, preferredChannel: e.target.value })}>
              <option>WhatsApp</option><option>Instagram</option><option>Email</option>
            </select>
          </Field>
        </div>
        <Field label="Notes"><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        <button onClick={saveNew} className="btn-primary w-full mt-4">Save prospect</button>
      </ActionModal>
    </div>
  )
}
