import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ProposalCard, SummaryChips } from '../components/workflow'
import { ActionModal } from '../components/workflow'
import { Empty } from '../components/ui'
import { IDR, fmtDate } from '../lib/format'
import { PROPOSAL_STATUS } from '../lib/workflow'

export default function Proposals() {
  const { db, api, canDo } = useStore()
  const nav = useNavigate()
  const [filter, setFilter] = useState('ALL')
  const [sel, setSel] = useState(null) // {p, lead}

  const list = useMemo(() => {
    return (db.proposals || [])
      .filter((p) => filter === 'ALL' || p.status === filter)
      .sort((a, b) => String(b.sentAt || '').localeCompare(String(a.sentAt || '')))
  }, [db, filter])

  const counts = useMemo(() => {
    const ps = db.proposals || []
    const c = (s) => ps.filter((p) => p.status === s).length
    return [
      { value: c('DRAFT'), label: 'Draft' },
      { value: c('SENT') + c('AWAITING'), label: 'Awaiting' },
      { value: c('NEGOTIATION'), label: 'Negotiation' }
    ]
  }, [db])

  const leadOf = (id) => (db.leads || []).find((l) => l.id === id)

  const setStatus = (status) => {
    if (!sel) return
    const r = api.setProposalStatus(sel.p.id, status)
    if (!r?.error) setSel(null)
  }

  const send = () => {
    if (!sel) return
    const r = api.sendProposal(sel.p.id)
    if (!r?.error) setSel(null)
  }

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight dark:text-white">Proposals</h1>
        <p className="text-sm muted mt-0.5">Deals ready to propose or awaiting response — linked to leads, no duplicate client data.</p>
      </div>

      <SummaryChips chips={counts} />

      <div className="flex gap-1.5 flex-wrap">
        {['ALL', ...PROPOSAL_STATUS].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-bold border ${filter === f ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900' : 'border-ink-200 muted dark:border-white/10'}`}>{f}</button>
        ))}
      </div>

      {list.length === 0 && <div className="card"><Empty title="No proposals" sub="Create one from a lead deal when it's ready." /></div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((p) => (
          <ProposalCard key={p.id} p={p} lead={leadOf(p.leadId)} onOpen={(pp, lead) => setSel({ p: pp, lead })} />
        ))}
      </div>

      <ActionModal open={!!sel} onClose={() => setSel(null)} title={sel?.lead?.business || sel?.p.title || ''} sub={sel ? `${sel.p.service || ''} · ${IDR(sel.p.amount)}` : ''}>
        {sel && (
          <div className="space-y-3 text-sm">
            <p className="muted">{sel.p.sentAt ? `Sent ${fmtDate(sel.p.sentAt)}${sel.p.validUntil ? ` · valid until ${fmtDate(sel.p.validUntil)}` : ''}` : 'Not sent yet.'}</p>
            {sel.p.notes && <p>{sel.p.notes}</p>}
            {sel.lead?.followUp && <p className="muted">Next action: follow up {fmtDate(sel.lead.followUp)}</p>}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { const l = sel.lead; setSel(null); if (l) nav(`/leads/${l.id}`) }} className="btn-primary !py-2 flex-1">Open Deal</button>
              {canDo('proposals.manage') && sel.p.status === 'DRAFT' && <button onClick={send} className="btn-secondary !py-2 flex-1">Send</button>}
            </div>
            {canDo('proposals.manage') && (
              <div className="flex flex-wrap gap-2 pt-1">
                {['AWAITING', 'NEGOTIATION', 'ACCEPTED', 'REJECTED'].filter((s) => s !== sel.p.status).map((s) => (
                  <button key={s} onClick={() => setStatus(s)} className="rounded-full px-3 py-1.5 text-xs font-bold border border-ink-200 muted dark:border-white/10">{s}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </ActionModal>
    </div>
  )
}
