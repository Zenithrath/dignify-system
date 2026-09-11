import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Badge, Card } from '../components/ui'

export default function Calendar() {
  const { db, me } = useStore()
  const [mode, setMode] = useState(me?.role === 'STAFF' ? 'MINE' : 'ALL')
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [day, setDay] = useState(null)

  const events = useMemo(() => {
    const ev = []
    db.tasks.forEach((t) => { if (!t.deadline) return; if (mode === 'MINE' && t.assignee !== me?.id) return; ev.push({ date: t.deadline, kind: 'TASK', label: t.title, ref: t.id, status: t.status }) })
    db.projects.forEach((p) => { if (mode === 'MINE') return; if (p.deadline) ev.push({ date: p.deadline, kind: 'PROJECT', label: `🚀 ${p.name}`, ref: p.id, status: p.status }) })
    db.maintenance.forEach((x) => { if (mode === 'MINE' && x.pic !== me?.id) return; ev.push({ date: x.nextDue, kind: 'MAINT', label: `🔧 ${x.service}`, ref: x.id, status: x.status }) })
    db.content.forEach((c) => ev.push({ date: c.publishDate, kind: 'CONTENT', label: `🎬 ${c.title}`, ref: c.id, status: c.status }))
    db.leads.filter((l) => l.followUp).forEach((l) => { if (mode === 'MINE' && l.owner !== me?.id) return; ev.push({ date: l.followUp, kind: 'FOLLOW-UP', label: `📞 ${l.business}`, ref: l.id, status: l.stage }) })
    return ev
  }, [db, mode, me])

  const byDate = useMemo(() => {
    const map = {}
    events.forEach((e) => { (map[e.date] = map[e.date] || []).push(e) })
    return map
  }, [events])

  const first = new Date(cursor.y, cursor.m, 1)
  const startPad = (first.getDay() + 6) % 7
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const cells = [...Array(startPad).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  const iso = (d) => `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const monthName = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Schedule</h1><p className="text-sm text-ink-500">Deadlines · content · maintenance · follow-ups</p></div>
        <div className="flex gap-1.5">
          {[['MINE', 'My schedule'], ['ALL', 'All team']].map(([v, l]) => <button key={v} onClick={() => setMode(v)} className={`badge !py-1.5 !px-3 cursor-pointer ${mode === v ? '!bg-brand-700 !text-white' : 'bg-white border border-ink-200 text-ink-500'}`}>{l}</button>)}
        </div>
      </div>
      <Card className="card-pad">
        <div className="flex items-center justify-between mb-3">
          <button className="btn-secondary !py-1.5" onClick={() => setCursor({ y: cursor.m === 0 ? cursor.y - 1 : cursor.y, m: (cursor.m + 11) % 12 })}>←</button>
          <h3 className="font-display font-extrabold">{monthName}</h3>
          <button className="btn-secondary !py-1.5" onClick={() => setCursor({ y: cursor.m === 11 ? cursor.y + 1 : cursor.y, m: (cursor.m + 1) % 12 })}>→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-ink-400 mb-1">{['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d) => <span key={d}>{d}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />
            const k = iso(d)
            const evs = byDate[k] || []
            const isToday = k === new Date().toISOString().slice(0, 10)
            return (
              <button key={i} onClick={() => setDay(k)} className={`min-h-[56px] sm:min-h-[76px] rounded-xl border text-left p-1 sm:p-1.5 align-top ${isToday ? 'border-brand-500 bg-brand-50/60' : 'border-ink-100 bg-white hover:border-brand-300'}`}>
                <span className={`text-xs font-extrabold ${isToday ? 'text-brand-800' : ''}`}>{d}</span>
                <span className="hidden sm:block space-y-0.5 mt-0.5">{evs.slice(0, 2).map((e, j) => <span key={j} className="block text-[10px] font-semibold truncate rounded bg-ink-50 px-1 py-0.5">{e.label}</span>)}{evs.length > 2 && <span className="block text-[10px] font-bold text-brand-700">+{evs.length - 2} more</span>}</span>
                {evs.length > 0 && <span className="sm:hidden flex gap-0.5 mt-1">{evs.slice(0, 3).map((_, j) => <span key={j} className="w-1.5 h-1.5 rounded-full bg-brand-600" />)}</span>}
              </button>
            )
          })}
        </div>
      </Card>
      {day && (
        <Card className="card-pad">
          <div className="flex items-center justify-between"><h3 className="section-title">{day}</h3><button className="btn-ghost !py-1" onClick={() => setDay(null)}>Close ✕</button></div>
          <div className="mt-2 space-y-1.5">{(byDate[day] || []).map((e, i) => <div key={i} className="flex items-center gap-2 text-sm rounded-xl bg-ink-50 px-3 py-2"><Badge value={e.kind} /><span className="flex-1 font-semibold">{e.label}</span><Badge value={e.status} /></div>)}
            {(byDate[day] || []).length === 0 && <p className="text-sm text-ink-500">Nothing scheduled.</p>}</div>
        </Card>
      )}
    </div>
  )
}
