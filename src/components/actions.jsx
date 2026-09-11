import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { addDays, todayISO } from '../lib/format'
import { followupMessage, outreachMessage, recommendService } from '../lib/workflow'
import { ActionModal, ChannelPicker, ResultPicker } from './workflow'
import { Field } from './ui'

// ── Approach flow: contextual panel, no giant form ─────────────────────
// System on [Mark as Contacted]: status→CONTACTED + outreach + follow-up +
// assign + activity + confirm + next recommendation (handled in store).
export function ApproachModal({ prospect, open, onClose, onDone }) {
  const { api, me } = useStore()
  const [channel, setChannel] = useState(prospect?.preferredChannel || 'WhatsApp')
  const [message, setMessage] = useState('')
  const [next, setNext] = useState(addDays(todayISO(), 2))
  const [err, setErr] = useState('')

  React.useEffect(() => {
    if (open && prospect) {
      setChannel(prospect.preferredChannel || 'WhatsApp')
      setMessage(outreachMessage(prospect, prospect.preferredChannel || 'WhatsApp'))
      setNext(addDays(todayISO(), 2))
      setErr('')
    }
  }, [open, prospect])

  const msg = useMemo(() => message || outreachMessage(prospect || {}, channel), [message, prospect, channel])

  if (!prospect) return null
  return (
    <ActionModal open={open} onClose={onClose} title={`Approach ${prospect.business}`} sub={`Recommended service: ${recommendService(prospect)}`}>
      <div className="space-y-4">
        <div>
          <p className="label">Recommended channel</p>
          <ChannelPicker value={channel} onChange={(c) => { setChannel(c); setMessage(outreachMessage(prospect, c)) }} />
        </div>
        <Field label="Message">
          <textarea className="input min-h-[96px]" value={msg} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Field label="Next follow-up">
          <input type="date" className="input" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={() => {
              const r = api.approachProspect({ prospectId: prospect.id, channel, message: msg, nextFollowUp: next || addDays(todayISO(), 2) })
              if (r?.error) return setErr(r.error)
              onClose(); onDone?.({ type: 'approached', prospect, next: r.next })
            }}
            className="btn-primary flex-1"
          >Mark as Contacted</button>
        </div>
        <p className="text-xs muted">This will update status, log outreach, create a follow-up for {prospect.owner ? 'the owner' : me?.name || 'you'}, and recommend the next action.</p>
      </div>
    </ActionModal>
  )
}

// ── Follow-up action: contextual, guides instead of just recording ─────
export function FollowUpModal({ item, open, onClose, onDone }) {
  const { db, api } = useStore()
  const [result, setResult] = useState('')
  const [note, setNote] = useState('')
  const [next, setNext] = useState(addDays(todayISO(), 1))
  const [err, setErr] = useState('')

  const lead = item?.leadId ? db.leads.find((l) => l.id === item.leadId) : null
  const prospect = item?.prospectId ? db.prospects.find((p) => p.id === item.prospectId) : null
  const business = item?.business || lead?.business || prospect?.business || ''
  const last = [...(db.outreach || [])]
    .filter((o) => (item?.leadId && o.leadId === item.leadId) || (item?.prospectId && o.prospectId === item.prospectId))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0]

  React.useEffect(() => {
    if (open) { setResult(''); setNote(''); setNext(addDays(todayISO(), 1)); setErr('') }
  }, [open, item])

  if (!item) return null
  return (
    <ActionModal open={open} onClose={onClose} title={`Follow up ${business}`} sub={item.subtitle || 'Follow-up'}>
      <div className="space-y-4">
        <div className="rounded-xl bg-ink-50 dark:bg-white/5 p-3 text-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider muted">Last interaction</p>
          <p className="font-semibold mt-0.5">{last ? `${last.date} · ${last.result}` : 'No history yet'}</p>
          {last?.note && <p className="text-xs muted mt-0.5">{last.note}</p>}
          <p className="text-xs mt-1.5">Suggested channel: <b>{item.channel || 'WhatsApp'}</b></p>
        </div>
        <Field label="Suggested message">
          <textarea className="input min-h-[72px]" defaultValue={followupMessage({ business, context: /proposal/i.test(item.subtitle || '') ? 'proposal' : 'second' })} />
        </Field>
        <div>
          <p className="label">Result</p>
          <ResultPicker value={result} onChange={setResult} />
        </div>
        <Field label="Note">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What happened?" />
        </Field>
        {result !== 'NOT_INTERESTED' && (
          <Field label="Next action date (empty = no further follow-up)">
            <input type="date" className="input" value={next} onChange={(e) => setNext(e.target.value)} />
          </Field>
        )}
        {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
        <button
          disabled={!result}
          onClick={() => {
            const targetId = item.id?.startsWith?.('auto-') ? item.id : item.id
            // synthesized rows reference leadId; completeFollowup resolves them
            const r = api.completeFollowup({ id: targetId, result, note, nextDate: result === 'NOT_INTERESTED' ? '' : next, channel: item.channel })
            if (r?.error) return setErr(r.error)
            onClose(); onDone?.({ type: 'followed-up', item, result })
          }}
          className="btn-primary w-full"
        >Complete Follow-up</button>
      </div>
    </ActionModal>
  )
}
