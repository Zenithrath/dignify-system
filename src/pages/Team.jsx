import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Avatar, Badge, Card, Field, Modal, Progress } from '../components/ui'

export default function Team() {
  const { db, api, canDo } = useStore()
  const [form, setForm] = useState(null)
  const workload = (id) => {
    const active = db.tasks.filter((t) => t.assignee === id && t.status !== 'DONE')
    const pct = Math.min(100, active.length * 13)
    return { active: active.length, pct, done: db.tasks.filter((t) => t.assignee === id && t.status === 'DONE').length }
  }
  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Team</h1><p className="text-sm text-ink-500">Real workload comes from TASKS — check before assigning</p></div>
        {canDo('users.manage') && <button className="btn-primary" onClick={() => setForm({ name: '', email: '', role: 'STAFF', title: '', skills: [], active: true })}>+ Member</button>}
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {db.users.map((u) => {
          const w = workload(u.id)
          return (
            <Card key={u.id} className="card-pad">
              <div className="flex items-center gap-3"><Avatar name={u.name} /><div className="flex-1"><p className="font-bold">{u.name}</p><p className="text-xs text-ink-500">{u.title} · {u.role}</p></div><Badge value={u.active ? 'ACTIVE' : 'INACTIVE'} /></div>
              <div className="flex items-center gap-2 mt-3"><div className="flex-1"><Progress value={w.pct} /></div><span className="text-xs font-extrabold">{w.pct}%</span></div>
              <p className="text-xs text-ink-500 mt-1.5">{w.active} active tasks · {w.done} completed</p>
              <div className="flex gap-1.5 mt-2 flex-wrap">{(u.skills || []).map((s) => <span key={s} className="text-[11px] font-bold bg-ink-50 rounded-lg px-2 py-1">{s}</span>)}</div>
              {canDo('users.manage') && <button className="btn-ghost !text-xs mt-2" onClick={() => setForm({ ...u, skills: u.skills || [] })}>Edit member →</button>}
            </Card>
          )
        })}
      </div>
      <Modal open={!!form} onClose={() => setForm(null)} title="Team member (Admin)">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Role"><select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{['ADMIN', 'PM', 'STAFF'].map((r) => <option key={r}>{r}</option>)}</select></Field>
            <Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" onClick={() => { api.saveUser(form.id ? form : { ...form }); setForm(null) }}>Save</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
