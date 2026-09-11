import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { followupBuckets } from '../lib/workflow'
import { FollowUpItem, SummaryChips } from '../components/workflow'
import { FollowUpModal } from '../components/actions'

export default function FollowUps() {
  const { db, me } = useStore()
  const nav = useNavigate()
  const [current, setCurrent] = useState(null)

  const { due, overdue, upcoming } = useMemo(() => followupBuckets(db, me), [db, me])

  const open = (item) => {
    // open relevant lead/prospect context through the modal (no searching again)
    setCurrent(item)
  }

  const goDeal = (item) => {
    if (item.leadId && !String(item.leadId).startsWith('auto')) nav(`/leads/${item.leadId}`)
    else if (item.leadId) nav(`/leads/${String(item.leadId).replace('auto-', '')}`)
    else nav('/prospecting')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight dark:text-white">Follow-ups</h1>
        <p className="text-sm muted mt-0.5">Who do I need to contact today? Not another lead table.</p>
      </div>

      <SummaryChips chips={[
        { value: due.length, label: 'Due today' },
        { value: upcoming.length, label: 'Upcoming' },
        { value: overdue.length, label: 'Overdue' }
      ]} />

      {overdue.length > 0 && (
        <section>
          <p className="kpi-label mb-2 !text-red-600 dark:!text-red-400">Overdue</p>
          <div className="space-y-2.5">
            {overdue.map((i) => <FollowUpItem key={i.kind + i.id} item={i} onFollowUp={open} />)}
          </div>
        </section>
      )}

      <section>
        <p className="kpi-label mb-2">Today</p>
        {due.length === 0 && <div className="card card-pad text-sm muted">Nothing due today. Check overdue or upcoming.</div>}
        <div className="space-y-2.5">
          {due.map((i) => <FollowUpItem key={i.kind + i.id} item={i} onFollowUp={open} />)}
        </div>
      </section>

      {upcoming.length > 0 && (
        <section>
          <p className="kpi-label mb-2">Upcoming</p>
          <div className="space-y-2.5">
            {upcoming.slice(0, 6).map((i) => <FollowUpItem key={i.kind + i.id} item={i} onFollowUp={open} />)}
          </div>
        </section>
      )}

      <FollowUpModal
        item={current}
        open={!!current}
        onClose={() => setCurrent(null)}
        onDone={() => { const it = current; setCurrent(null); if (it) goDeal(it) }}
      />
    </div>
  )
}
