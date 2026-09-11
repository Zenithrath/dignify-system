import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Avatar, Badge, Card, Empty, Field, Modal, SearchInput } from '../components/ui'
import { fmtDate } from '../lib/format'

const TYPES = ['ALL', 'PROJECT', 'ROUTINE', 'CONTENT', 'MAINTENANCE', 'SALES', 'INTERNAL']
const STATUS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']

export default function Tasks() {
  const { db, me, api, canDo } = useStore()
  const [q, setQ] = useState('')
  const [type, setType] = useState(me?.role === 'STAFF' ? 'ALL' : 'ALL')
  const [form, setForm] = useState(null)
  const [detail, setDetail] = useState(null)

  const list = useMemo(() => {
    let l = [...db.tasks].sort((a, b) => (a.deadline || 'z') < (b.deadline || 'z') ? -1 : 1)
    if (me?.role === 'STAFF') l = l.filter((t) => t.assignee === me.id)
    if (type !== 'ALL') l = l.filter((t) => t.type === type)
    if (q) l = l.filter((t) => (t.title + t.id).toLowerCase().includes(q.toLowerCase()))
    return l
  }, [db, me, type, q])

  const uname = (id) => db.users.find((u) => u.id === id)?.name || '—'
  const pname = (id) => db.projects.find((p) => p.id === id)?.name || ''

  const openNew = () => setForm({ title: '', type: 'PROJECT', projectId: db.projects[0]?.id || '', assignee: db.users.find((u) => u.role === 'STAFF')?.id || '', status: 'TODO', priority: 'MEDIUM', deadline: '', progress: 0, notes: '' })

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">{me?.role === 'STAFF' ? 'My Tasks' : 'Tasks'}</h1><p className="text-sm text-ink-500">One engine · types: PROJECT / ROUTINE / CONTENT / MAINTENANCE / SALES / INTERNAL</p></div>
        {canDo('tasks.create') && <button className="btn-primary" onClick={openNew}>+ New task</button>}
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <div className="w-full sm:w-64"><SearchInput value={q} onChange={setQ} placeholder="Search tasks…" /></div>
        {TYPES.map((t) => <button key={t} onClick={() => setType(t)} className={`badge !py-1.5 !px-3 cursor-pointer ${type === t ? '!bg-brand-700 !text-white' : 'bg-white border border-ink-200 text-ink-500'}`}>{t}</button>)}
      </div>
      {list.length === 0 ? <Card><Empty title={me?.role === 'STAFF' ? "You're all caught up." : 'No tasks'} sub="Tasks assigned by the PM appear here." /></Card> : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-ink-50/70"><tr><th className="th">Task</th><th className="th">Type</th><th className="th">Assignee</th><th className="th">Due</th><th className="th">Status</th><th className="th text-right">Action</th></tr></thead>
              <tbody className="divide-y divide-ink-100">
                {list.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-50/50 cursor-pointer" onClick={() => setDetail(t)}>
                    <td className="td"><p className="font-semibold">{t.title}</p><p className="text-xs text-ink-500">{t.id}{pname(t.projectId) ? ` · ${pname(t.projectId)}` : ''}</p></td>
                    <td className="td"><Badge value={t.type} /></td>
                    <td className="td"><span className="flex items-center gap-2"><Avatar name={uname(t.assignee)} size="w-7 h-7 text-[10px]" /><span className="text-xs font-semibold hidden sm:inline">{uname(t.assignee).split(' ')[0]}</span></span></td>
                    <td className="td text-xs font-semibold">{fmtDate(t.deadline)}</td>
                    <td className="td"><Badge value={t.status} /></td>
                    <td className="td text-right" onClick={(e) => e.stopPropagation()}>
                      <select className="input !w-auto !py-1.5 !text-xs font-bold" value={t.status} onChange={(e) => api.quickStatus(t.id, e.target.value)}>
                        {STATUS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title}>
        {detail && <TaskDetail t={detail} close={() => setDetail(null)} />}
      </Modal>
      <Modal open={!!form} onClose={() => setForm(null)} title="New task (PM assigns)">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2"><Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field></div>
            <Field label="Type"><select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.slice(1).map((t) => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Project"><select className="input" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}><option value="">— none —</option>{db.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
            <Field label="Assignee"><select className="input" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>{db.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}</select></Field>
            <Field label="Deadline"><input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <Field label="Priority"><select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => <option key={p}>{p}</option>)}</select></Field>
            <Field label="Status"><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" onClick={() => { const r = api.saveTask({ ...form, _reassign: true }); if (!r.error) setForm(null) }}>Assign task</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function TaskDetail({ t, close }) {
  const { db, me, api, canDo } = useStore()
  const [s, setS] = useState({ ...t })
  const staffLocked = me?.role === 'STAFF' && t.assignee !== me.id
  const save = () => {
    const r = api.saveTask({ ...s, _reassign: canDo('tasks.assign') && s.assignee !== t.assignee })
    if (!r.error) close()
  }
  return (
    <div className="space-y-3 text-sm">
      <div className="flex gap-2 flex-wrap"><Badge value={s.type} /><Badge value={s.priority} /><span className="text-xs text-ink-500">{s.id}</span></div>
      {staffLocked && <p className="text-xs font-bold bg-amber-50 text-amber-800 rounded-xl px-3 py-2">Read-only: assigned to {db.users.find((u) => u.id === t.assignee)?.name}.</p>}
      <Field label="Title"><input className="input" value={s.title} disabled={staffLocked} onChange={(e) => setS({ ...s, title: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status"><select className="input" value={s.status} onChange={(e) => setS({ ...s, status: e.target.value, progress: e.target.value === 'DONE' ? 100 : s.progress })}>{['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Progress %"><input className="input" type="number" min={0} max={100} value={s.progress} onChange={(e) => setS({ ...s, progress: Number(e.target.value) })} /></Field>
        <Field label="Assignee"><select className="input" value={s.assignee} disabled={!canDo('tasks.assign')} onChange={(e) => setS({ ...s, assignee: e.target.value })}>{db.users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></Field>
        <Field label="Deadline"><input className="input" type="date" value={s.deadline || ''} disabled={!canDo('tasks.assign') && me?.role === 'STAFF'} onChange={(e) => setS({ ...s, deadline: e.target.value })} /></Field>
      </div>
      <Field label="Notes"><textarea className="input" rows={3} value={s.notes || ''} onChange={(e) => setS({ ...s, notes: e.target.value })} /></Field>
      <div className="flex justify-end gap-2"><button className="btn-secondary" onClick={close}>Close</button><button className="btn-primary" onClick={save}>Save updates</button></div>
      {!canDo('tasks.assign') && <p className="text-[11px] text-ink-400">Staff can update status / progress / notes on their own tasks. Assignment is PM-only (enforced server-side too).</p>}
    </div>
  )
}
