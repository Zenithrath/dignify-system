import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Badge, Card, Empty, Field, Modal } from '../components/ui'
import { IDR, fmtDate } from '../lib/format'

export default function Maintenance() {
  const { db, api, canDo } = useStore()
  const [form, setForm] = useState(null)
  const cname = (id) => db.clients.find((c) => c.id === id)?.company || id
  const uname = (id) => db.users.find((u) => u.id === id)?.name || '—'
  const isAdmin = canDo('maintenance.manage')

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Maintenance</h1><p className="text-sm text-ink-500">Recurring service · completion auto-schedules the next cycle + notifies</p></div>
        {isAdmin && <button className="btn-primary" onClick={() => setForm({ clientId: db.clients[0]?.id || '', service: '', plan: 'Monthly', start: '', intervalDays: 30, nextDue: '', pic: db.users[0]?.id || '', status: 'SCHEDULED', fee: 750000, payStatus: 'UNPAID', desc: '' })}>+ New maintenance</button>}
      </div>
      {!isAdmin && <p className="text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2">Full maintenance configuration is Administrator-only. You can execute assigned work and mark completion.</p>}
      {db.maintenance.length === 0 ? <Card><Empty title="No maintenance contracts" /></Card> : (
        <div className="grid md:grid-cols-2 gap-3">
          {db.maintenance.map((x) => (
            <Card key={x.id} className="card-pad">
              <div className="flex items-start justify-between gap-2"><div><p className="font-bold">{x.service}</p><p className="text-xs text-ink-500">{x.id} · {cname(x.clientId)} · {x.plan}{x.intervalDays ? ` / ${x.intervalDays}d` : ''}</p></div><Badge value={x.status} /></div>
              <div className="flex gap-2 mt-3 text-xs font-bold flex-wrap">
                <span className="rounded-lg bg-ink-50 px-2 py-1">📅 Next: {fmtDate(x.nextDue)}</span>
                <span className="rounded-lg bg-ink-50 px-2 py-1">🧑‍🔧 {uname(x.pic)}</span>
                <span className="rounded-lg bg-brand-50 text-brand-800 px-2 py-1">{IDR(x.fee)} · {x.payStatus}</span>
              </div>
              <p className="text-xs text-ink-500 mt-2">{x.desc}</p>
              {(x.history || []).length > 0 && <div className="mt-2 text-xs text-ink-500">{x.history.slice(0, 2).map((h, i) => <p key={i}>✓ {h.date} — {h.note}</p>)}</div>}
              <div className="flex gap-2 mt-3">
                <button className="btn-primary !py-2 !text-xs" onClick={() => api.completeMaintenance(x.id)}>Mark completed → next cycle</button>
                {isAdmin && <button className="btn-secondary !py-2 !text-xs" onClick={() => setForm({ ...x })}>Reschedule / edit</button>}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title="Maintenance record (Admin)">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Client"><select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>{db.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
            <Field label="Service"><input className="input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></Field>
            <Field label="Interval (days, 0 = one-time)"><input className="input" type="number" value={form.intervalDays} onChange={(e) => setForm({ ...form, intervalDays: Number(e.target.value) })} /></Field>
            <Field label="Next due"><input className="input" type="date" value={form.nextDue} onChange={(e) => setForm({ ...form, nextDue: e.target.value })} /></Field>
            <Field label="PIC"><select className="input" value={form.pic} onChange={(e) => setForm({ ...form, pic: e.target.value })}>{db.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>
            <Field label="Status"><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['SCHEDULED', 'UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Fee (Rp)"><input className="input" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })} /></Field>
            <Field label="Pay status"><select className="input" value={form.payStatus} onChange={(e) => setForm({ ...form, payStatus: e.target.value })}>{['PAID', 'UNPAID', 'PARTIAL'].map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" onClick={() => { api.saveMaintenance(form); setForm(null) }}>Save</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
