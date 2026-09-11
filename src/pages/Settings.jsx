import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Badge, Card, Field } from '../components/ui'
import { IDR } from '../lib/format'

export default function Settings() {
  const { db, api, canDo, runAutomation, me } = useStore()
  const [s, setS] = useState(db.settings)
  const [rec, setRec] = useState(null)
  const admin = canDo('settings.manage')

  return (
    <div className="space-y-4 anim-fadeUp max-w-3xl">
      <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Settings</h1>
      <Card className="card-pad space-y-3">
        <h3 className="section-title">Business</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Business name"><input className="input" disabled={!admin} value={s.businessName} onChange={(e) => setS({ ...s, businessName: e.target.value })} /></Field>
          <Field label="Apps Script API URL"><input className="input" disabled={!admin} placeholder="https://script.google.com/…/exec" value={s.gasUrl} onChange={(e) => setS({ ...s, gasUrl: e.target.value })} /></Field>
        </div>
        <h3 className="section-title pt-2">Notification rules</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Field label="Deadline warning (days before)"><input className="input" type="number" disabled={!admin} value={s.notifRules.deadlineSoonDays} onChange={(e) => setS({ ...s, notifRules: { ...s.notifRules, deadlineSoonDays: Number(e.target.value) } })} /></Field>
          <Field label="Maintenance warning (days before)"><input className="input" type="number" disabled={!admin} value={s.notifRules.maintenanceSoonDays} onChange={(e) => setS({ ...s, notifRules: { ...s.notifRules, maintenanceSoonDays: Number(e.target.value) } })} /></Field>
        </div>
        {admin ? <button className="btn-primary" onClick={() => api.saveSettings(s)}>Save settings</button> : <p className="text-xs text-ink-500">Read-only for {me.role}. Contact admin to change configuration.</p>}
      </Card>

      <Card className="card-pad">
        <div className="flex items-center justify-between"><h3 className="section-title">Automation</h3><button className="btn-secondary !py-2 !text-xs" onClick={runAutomation}>▶ Run now</button></div>
        <ul className="text-sm text-ink-600 mt-2 space-y-1.5 list-disc pl-5">
          <li>Daily 08:00 — check today's tasks, overdue, maintenance, follow-ups → notifications</li>
          <li>Daily — generate recurring routine tasks per weekday schedule (idempotent)</li>
          <li>On task DONE — recalculate project progress</li>
          <li>On maintenance DONE — compute next due + schedule next task + notify PIC</li>
          <li>On lead WON — convert to client preserving Lead ID</li>
        </ul>
        <p className="text-xs text-ink-400 mt-2">Server equivalent lives in <code>apps-script/Code.gs</code> as time-driven triggers. This button runs the same logic against the local mirror.</p>
      </Card>

      {canDo('recurring.manage') && (
        <Card className="card-pad">
          <h3 className="section-title mb-2">Recurring schedules</h3>
          {db.recurring.map((r) => (
            <div key={r.id} className="flex items-center gap-2 py-2 border-b border-ink-100 last:border-0 text-sm">
              <span className="flex-1"><b>{r.name}</b> <span className="text-ink-500">· day {r.weekday} → {db.users.find((u) => u.id === r.assignee)?.name}</span></span>
              <Badge value={r.active ? 'ACTIVE' : 'INACTIVE'} />
              <button className="btn-ghost !py-1 !text-xs" onClick={() => api.saveRecurring({ ...r, active: !r.active })}>{r.active ? 'Pause' : 'Resume'}</button>
            </div>
          ))}
        </Card>
      )}

      <Card className="card-pad">
        <h3 className="section-title mb-2">Rate card (configurable — never hard-code prices)</h3>
        {db.ratecard.map((r) => <div key={r.id} className="flex justify-between text-sm py-1.5 border-b border-ink-100 last:border-0"><span><b>{r.service}</b> <span className="text-ink-500 text-xs">· {r.scope}</span></span><b className="text-brand-700">{IDR(r.price)}</b></div>)}
      </Card>
    </div>
  )
}
