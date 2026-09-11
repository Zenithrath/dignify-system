import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Badge, Card, Empty } from '../components/ui'
import { ActionModal, LeadPipeline, LeadTimeline, NextAction } from '../components/workflow'
import { FollowUpModal } from '../components/actions'
import { Field } from '../components/ui'
import { IDR, fmtDate } from '../lib/format'
import { STAGE_PROBABILITY, nextActionForLead } from '../lib/workflow'

const STAGES = ['NEW', 'CONTACTED', 'RESPONDED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']

export default function LeadDetail() {
  const { id } = useParams()
  const { db, api, canDo } = useStore()
  const nav = useNavigate()
  const [followOpen, setFollowOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [proposalOpen, setProposalOpen] = useState(false)
  const [wonOpen, setWonOpen] = useState(false)
  const [wonClient, setWonClient] = useState('')
  const [nextStage, setNextStage] = useState('')
  const [prop, setProp] = useState({ title: '', service: 'Website Development', amount: '' })

  const lead = (db.leads || []).find((l) => l.id === id)
  const outreach = useMemo(
    () => (db.outreach || []).filter((o) => o.leadId === id).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [db, id]
  )
  const proposal = useMemo(
    () => (db.proposals || []).filter((p) => p.leadId === id).sort((a, b) => String(b.sentAt || '').localeCompare(String(a.sentAt || '')))[0],
    [db, id]
  )
  const followItem = useMemo(() => {
    const f = (db.followups || []).find((x) => x.leadId === id && !x.done)
    if (f) return { kind: 'followup', id: f.id, business: lead?.business, subtitle: f.purpose, channel: f.channel, leadId: id, prospectId: '' }
    return { kind: 'followup', id: `auto-${id}`, business: lead?.business, subtitle: 'Follow-up', channel: 'WhatsApp', leadId: id, prospectId: '' }
  }, [db, id, lead])

  if (!lead) return <div className="card card-pad max-w-2xl"><Empty title="Lead not found" sub="It may have been removed." action={<button onClick={() => nav('/leads')} className="btn-secondary">Back to leads</button>} /></div>

  const na = nextActionForLead(lead, proposal)
  const prob = STAGE_PROBABILITY[lead.stage] ?? STAGE_PROBABILITY.PROPOSAL_SENT ?? 10
  const owner = db.users.find((u) => u.id === lead.owner)?.name || '—'

  const doStage = () => {
    if (!nextStage) return
    if (nextStage === 'WON') {
      const r = api.markWon(lead.id)
      if (!r?.error) { setWonClient(r.clientId); setStageOpen(false); setWonOpen(true) }
      return
    }
    const r = api.setStage(lead.id, nextStage, `Stage updated to ${nextStage}.`)
    if (!r?.error) setStageOpen(false)
  }

  const doProposal = () => {
    const saved = api.saveProposal({ leadId: lead.id, title: prop.title || `${lead.business} — Proposal`, service: prop.service, amount: Number(prop.amount) || lead.value || 0, status: 'DRAFT' })
    if (saved?.error) return alert(saved.error)
    // one tap: create + send → stage PROPOSAL_SENT + follow-up tomorrow (system handles the rest)
    if (saved?.id) api.sendProposal(saved.id)
    setProposalOpen(false)
    setProp({ title: '', service: 'Website Development', amount: '' })
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <button onClick={() => nav('/leads')} className="text-xs font-bold muted">← All leads</button>

      <div className="card card-pad">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-extrabold dark:text-white">{lead.business}</h1>
            <p className="text-sm muted">{lead.category || 'Business'} · {lead.city || '—'}</p>
          </div>
          <Badge value={lead.stage} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl bg-ink-50 dark:bg-white/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider muted">Contact</p>
            <p className="font-bold mt-1 dark:text-white">{lead.contact || '—'}</p>
            <p className="text-sm muted">WA: {lead.phone || '—'}</p>
            <p className="text-sm muted">IG: {lead.social || '—'}</p>
            <p className="text-sm muted mt-1">Owner: {owner}</p>
          </div>
          <div className="rounded-2xl bg-ink-50 dark:bg-white/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider muted">Deal</p>
            <p className="font-semibold mt-1 dark:text-white">{prop?.service || lead.service || 'Website Development'}</p>
            <p className="font-display text-xl font-extrabold dark:text-white">{IDR(lead.value)}</p>
            <p className="text-sm muted">Stage: <b className="dark:text-slate-200">{String(lead.stage).replace(/_/g, ' ')}</b> · Probability {prob}%</p>
            {lead.followUp && <p className="text-xs muted mt-0.5">Follow up {fmtDate(lead.followUp)}</p>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card card-pad">
          <p className="section-title mb-3">Pipeline</p>
          <LeadPipeline current={lead.stage === 'PROPOSAL_SENT' ? 'PROPOSAL' : lead.stage} />
        </div>
        <div className="space-y-3">
          <NextAction
            title={na.label} detail={na.detail} due={lead.followUp ? fmtDate(lead.followUp) : ''}
            tone={na.tone}
            actionLabel={lead.stage === 'WON' ? 'Create Project' : 'Follow Up'}
            onAction={() => { if (lead.stage === 'WON') nav('/projects'); else setFollowOpen(true) }}
          />
          <div className="card card-pad">
            <p className="text-[11px] font-bold uppercase tracking-wider muted mb-2">
              {lead.stage === 'PROPOSAL_SENT' || lead.stage === 'PROPOSAL' ? 'Proposal has been sent. Follow up tomorrow.' : 'Recommended moves'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setFollowOpen(true)} className="btn-primary !py-2">Follow Up</button>
              {canDo('leads.manage') && <button onClick={() => { setNextStage(''); setStageOpen(true) }} className="btn-secondary !py-2">Update Stage</button>}
              {canDo('proposals.manage') && <button onClick={() => setProposalOpen(true)} className="btn-secondary !py-2">Send Proposal</button>}
              {canDo('leads.convert') && lead.stage !== 'WON' && (
                <button
                  onClick={() => { const r = api.markWon(lead.id); if (!r?.error) { setWonClient(r.clientId); setWonOpen(true) } }}
                  className="btn-secondary !py-2 !border-brand-300 !text-brand-800 dark:!text-brand-200"
                >Mark as Won</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <p className="section-title mb-2">Outreach history</p>
        <LeadTimeline items={outreach} users={db.users} />
      </div>

      <FollowUpModal item={followItem} open={followOpen} onClose={() => setFollowOpen(false)} />

      <ActionModal open={stageOpen} onClose={() => setStageOpen(false)} title="Update stage" sub="Move the deal — history is appended, never overwritten.">
        <div className="flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <button key={s} onClick={() => setNextStage(s)} className={`rounded-full px-3 py-1.5 text-xs font-bold border ${nextStage === s ? 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900' : 'border-ink-200 muted dark:border-white/10'}`}>{s.replace(/_/g, ' ')}</button>
          ))}
        </div>
        <button disabled={!nextStage} onClick={doStage} className="btn-primary w-full mt-4">Move to {nextStage?.replace(/_/g, ' ') || '…'}</button>
      </ActionModal>

      <ActionModal open={proposalOpen} onClose={() => setProposalOpen(false)} title="Send proposal" sub="No duplicate client data — linked directly to this lead.">
        <div className="space-y-3">
          <Field label="Title"><input className="input" value={prop.title} onChange={(e) => setProp({ ...prop, title: e.target.value })} placeholder={`${lead.business} — Proposal`} /></Field>
          <Field label="Service"><input className="input" value={prop.service} onChange={(e) => setProp({ ...prop, service: e.target.value })} /></Field>
          <Field label="Amount (Rp)"><input type="number" className="input" value={prop.amount} onChange={(e) => setProp({ ...prop, amount: e.target.value })} placeholder={String(lead.value || '')} /></Field>
          <button onClick={doProposal} className="btn-primary w-full">Create & open proposals</button>
        </div>
      </ActionModal>

      <ActionModal open={wonOpen} onClose={() => setWonOpen(false)} title="Deal won 🎉" sub="Client created successfully. No blank project was created.">
        <div className="space-y-3 text-sm">
          <p>Client <b>{wonClient}</b> created — Lead ID, Prospect ID, outreach, proposal, and activity history preserved.</p>
          <p className="muted">Next recommended action:</p>
          <div className="flex gap-2">
            <button onClick={() => nav('/clients')} className="btn-secondary flex-1">Open Client</button>
            <button onClick={() => nav('/projects')} className="btn-primary flex-1">Create Project</button>
          </div>
        </div>
      </ActionModal>
    </div>
  )
}

// re-export to satisfy fast-refresh chunking on some setups
export const __leadDetail = true
