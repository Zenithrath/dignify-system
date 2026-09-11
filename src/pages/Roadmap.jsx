import React from 'react'
import { useStore } from '../lib/store'
import { Badge, Card, Progress } from '../components/ui'
import { IDR, fmtDate } from '../lib/format'

export function Roadmap() {
  const { db } = useStore()
  return (
    <div className="space-y-4 anim-fadeUp">
      <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Roadmap 90 Hari</h1><p className="text-sm text-ink-500">Strategic planning — ROADMAP → GOAL → MILESTONE → TASK. Not mixed with daily tasks.</p></div>
      {db.roadmap.map((r) => (
        <Card key={r.id} className="card-pad">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand-700">🎯 {r.goal}</p>
          <div className="flex items-center justify-between gap-2 mt-1"><p className="font-bold">{r.milestone}</p><Badge value={r.status} /></div>
          <div className="flex items-center gap-2 mt-2"><div className="flex-1"><Progress value={r.progress} /></div><b className="text-sm">{r.progress}%</b></div>
          <p className="text-xs text-ink-500 mt-1.5">Owner: {db.users.find((u) => u.id === r.owner)?.name} · target {fmtDate(r.target)}</p>
        </Card>
      ))}
    </div>
  )
}

export function RateCard() {
  const { db } = useStore()
  return (
    <div className="space-y-4 anim-fadeUp max-w-3xl">
      <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Rate Card</h1><p className="text-sm text-ink-500">Single source of pricing for proposals & estimates.</p></div>
      <div className="grid sm:grid-cols-2 gap-3">
        {db.ratecard.map((r) => (
          <Card key={r.id} className="card-pad">
            <p className="font-bold">{r.service}</p>
            <p className="text-xs text-ink-500 mt-0.5">{r.scope}</p>
            <p className="font-display text-xl font-extrabold text-brand-700 mt-2">{IDR(r.price)}<span className="text-xs text-ink-500 font-semibold"> /{r.unit}</span></p>
          </Card>
        ))}
      </div>
    </div>
  )
}
