import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Avatar, Badge, Card, Empty, Field, Modal, Progress, SearchInput } from '../components/ui'
import { IDR, fmtDate } from '../lib/format'

const STATUSES = ['PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'REVISION', 'DEPLOYMENT', 'COMPLETED', 'ON_HOLD', 'CANCELLED']

export default function Projects() {
  const { db, me, api, canDo } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState(null)

  const mineOnly = me?.role === 'STAFF'
  const list = useMemo(() => {
    let l = db.projects
    if (mineOnly) { const myP = new Set(db.tasks.filter((t) => t.assignee === me.id).map((t) => t.projectId)); l = l.filter((p) => myP.has(p.id)) }
    return l.filter((p) => (p.name + p.id).toLowerCase().includes(q.toLowerCase()))
  }, [db, q, mineOnly, me])

  const tasksOf = (id) => db.tasks.filter((t) => t.projectId === id)
  const cname = (id) => db.clients.find((c) => c.id === id)?.company || id

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">{mineOnly ? 'My Projects' : 'Projects'}</h1><p className="text-sm text-ink-500">Progress auto-calculates from task completion</p></div>
        {canDo('projects.manage') && <button className="btn-primary" onClick={() => setForm({ name: '', clientId: db.clients[0]?.id || '', service: 'Website Development', desc: '', value: 3000000, start: '', deadline: '', pm: me.id, status: 'PLANNING', priority: 'MEDIUM', notes: '' })}>+ New project</button>}
      </div>
      <div className="w-full sm:w-72"><SearchInput value={q} onChange={setQ} placeholder="Search projects…" /></div>
      {list.length === 0 ? <Card><Empty title="No projects" sub="Projects appear here once created." /></Card> : (
        <div className="grid md:grid-cols-2 gap-3">
          {list.map((p) => {
            const ts = tasksOf(p.id)
            const over = ts.filter((t) => t.status !== 'DONE' && t.deadline && t.deadline < new Date().toISOString().slice(0, 10)).length
            return (
              <Card key={p.id} className="card-pad cursor-pointer hover:border-brand-300 transition" >
                <div onClick={() => setSel(p)}>
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="font-bold truncate">{p.name}</p><p className="text-xs text-ink-500">{p.id} · {cname(p.clientId)} · {IDR(p.value)}</p></div><Badge value={p.status} /></div>
                  <div className="flex items-center gap-2 mt-3"><div className="flex-1"><Progress value={p.progress} /></div><span className="text-xs font-extrabold">{p.progress}%</span></div>
                  <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
                    <span>📅 {fmtDate(p.deadline)} {over > 0 && <b className="text-red-600">· {over} overdue</b>}</span>
                    <span className="flex -space-x-1.5">{[...new Set(ts.map((t) => t.assignee))].slice(0, 4).map((a) => <Avatar key={a} name={db.users.find((u) => u.id === a)?.name} size="w-6 h-6 text-[9px] ring-2 ring-white" />)}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.name} wide>
        {sel && (
          <div className="space-y-3 text-sm">
            <div className="flex gap-2 flex-wrap items-center"><Badge value={sel.status} /><Badge value={sel.priority} /><span className="text-xs text-ink-500">{sel.id} · {cname(sel.clientId)} · {IDR(sel.value)}</span></div>
            <p className="text-ink-700">{sel.desc}</p>
            <div><p className="font-bold text-xs mb-1">MILESTONES</p>{(sel.milestones || []).map((ms, i) => <p key={i} className="text-xs py-1">{ms.done ? '✅' : '⬜'} {ms.t}</p>)}</div>
            <div><p className="font-bold text-xs mb-1">TASKS ({tasksOf(sel.id).length})</p>
              {tasksOf(sel.id).map((t) => <div key={t.id} className="flex items-center gap-2 py-1.5 border-b border-ink-100 last:border-0 text-xs"><Badge value={t.status} /><span className="flex-1 font-semibold">{t.title}</span><span className="text-ink-500">{db.users.find((u) => u.id === t.assignee)?.name} · {fmtDate(t.deadline)}</span></div>)}
            </div>
            {canDo('projects.manage') && (
              <div className="flex gap-1.5 flex-wrap pt-1">{STATUSES.filter((s) => s !== sel.status).slice(0, 6).map((s) => <button key={s} className="btn-secondary !py-1.5 !text-xs" onClick={() => { api.saveProject({ ...sel, status: s }); setSel({ ...sel, status: s }) }}>→ {s}</button>)}</div>
            )}
          </div>
        )}
      </Modal>
      <Modal open={!!form} onClose={() => setForm(null)} title="New project">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Field label="Project name"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field></div>
            <Field label="Client"><select className="input" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>{db.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
            <Field label="Service"><input className="input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} /></Field>
            <Field label="Value (Rp)"><input className="input" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></Field>
            <Field label="Deadline"><input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Description"><textarea className="input" rows={2} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></Field></div>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" onClick={() => { const r = api.saveProject(form); if (!r.error) setForm(null) }}>Create</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
