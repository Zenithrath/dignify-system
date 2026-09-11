import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { useStore } from '../lib/store'
import { buildDailyActions, greeting } from '../lib/workflow'
import { DailyActionList, SummaryChips } from '../components/workflow'
import { ApproachModal, FollowUpModal } from '../components/actions'

export default function Home() {
  const { db, me } = useStore()
  const nav = useNavigate()
  const [approach, setApproach] = useState(null)
  const [follow, setFollow] = useState(null)

  const actions = useMemo(() => buildDailyActions(db, me), [db, me])
  const prospectsReady = useMemo(
    () => (db.prospects || []).filter((p) => (p.status || 'NEW') === 'NEW' && (me?.role !== 'STAFF' || (p.owner || me.id) === me.id)).length,
    [db, me]
  )
  const dueToday = actions.filter((a) => a.kind === 'followup' && a.diff === 0).length
  const awaiting = useMemo(
    () => (db.proposals || []).filter((p) => ['SENT', 'AWAITING'].includes(p.status)).length,
    [db]
  )

  const openAction = (a) => {
    if (a.kind === 'prospect') {
      const p = (db.prospects || []).find((x) => x.id === a.prospectId)
      if (p) return setApproach(p)
      return nav('/prospecting')
    }
    if (a.kind === 'followup') return setFollow(a)
    if (a.kind === 'proposal' && a.leadId) return nav(`/leads/${a.leadId}`)
    return nav('/follow-ups')
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white">{greeting(me?.name)}</h1>
        <p className="muted mt-1">Here's what needs your attention today.</p>
      </div>

      <div>
        <p className="kpi-label mb-2">Today</p>
        <SummaryChips chips={[
          { value: prospectsReady, label: 'Prospects to approach' },
          { value: dueToday, label: 'Follow-ups due' },
          { value: awaiting, label: 'Proposals waiting' }
        ]} />
        <button
          onClick={() => document.getElementById('today-work')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary w-full mt-3 !py-3"
        ><Icons.Play size={16} /> Start today's work</button>
      </div>

      <div id="today-work">
        <div className="flex items-center justify-between mb-2">
          <p className="section-title">Prioritized actions</p>
          <button onClick={() => nav('/follow-ups')} className="text-xs font-bold text-brand-700 dark:text-brand-300">View all →</button>
        </div>
        <DailyActionList items={actions} onOpen={openAction} />
      </div>

      <ApproachModal prospect={approach} open={!!approach} onClose={() => setApproach(null)} />
      <FollowUpModal item={follow} open={!!follow} onClose={() => setFollow(null)} />
    </div>
  )
}
