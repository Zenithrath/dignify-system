import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Badge, Card, Empty } from '../components/ui'
import { fmtDateTime } from '../lib/format'

export default function Activity() {
  const { db, me } = useStore()
  const [filter, setFilter] = useState('ALL')
  const myNotif = db.notifications.filter((n) => !me || n.to === me.id || me.role !== 'STAFF')
  const { api } = useStore()
  const uname = (id) => (id === 'system' ? 'System' : db.users.find((u) => u.id === id)?.name || id)

  const acts = useMemo(() => {
    if (filter === 'NOTIF') return []
    return db.activity.filter(() => true)
  }, [db, filter])

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Activity & Notifications</h1><p className="text-sm text-ink-500">Centralized history — nothing is overwritten</p></div>
        <button className="btn-secondary" onClick={() => api.markAllRead()}>Mark all read</button>
      </div>
      <div className="flex gap-1.5">{['ALL', 'NOTIF', 'LOG'].map((f) => <button key={f} onClick={() => setFilter(f)} className={`badge !py-1.5 !px-3 cursor-pointer ${filter === f ? '!bg-brand-700 !text-white' : 'bg-white border border-ink-200 text-ink-500'}`}>{f === 'ALL' ? 'All' : f === 'NOTIF' ? '🔔 Notifications' : '🕘 History'}</button>)}</div>
      <div className="grid lg:grid-cols-2 gap-4">
        {(filter === 'ALL' || filter === 'NOTIF') && (
          <Card className="card-pad">
            <h3 className="section-title mb-2">🔔 Notifications</h3>
            {myNotif.length === 0 ? <Empty title="You're up to date." /> : myNotif.slice(0, 20).map((n) => (
              <div key={n.id} onClick={() => api.markRead(n.id)} className={`rounded-xl border px-3 py-2.5 mb-2 cursor-pointer ${n.read ? 'border-ink-100 bg-white' : 'border-brand-200 bg-brand-50/60'}`}>
                <div className="flex items-center justify-between gap-2"><p className="text-sm font-bold">{!n.read && '● '}{n.title}</p><Badge value={n.type} /></div>
                <p className="text-xs text-ink-600 mt-0.5">{n.msg}</p>
                <p className="text-[11px] text-ink-400 mt-1">{fmtDateTime(n.at)} · to {uname(n.to)}</p>
              </div>
            ))}
          </Card>
        )}
        {(filter === 'ALL' || filter === 'LOG') && (
          <Card className="card-pad">
            <h3 className="section-title mb-2">🕘 Activity log</h3>
            {acts.slice(0, 30).map((a) => (
              <div key={a.id} className="flex gap-3 py-2 border-b border-ink-100 last:border-0">
                <span className="text-[11px] font-bold text-ink-400 whitespace-nowrap w-20 pt-0.5">{fmtDateTime(a.at)}</span>
                <p className="text-xs"><b>{uname(a.by)}</b> {a.text} {a.entity && <span className="text-brand-700 font-bold">· {a.entity}</span>}</p>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
