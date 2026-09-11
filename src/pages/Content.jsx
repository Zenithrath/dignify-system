import React, { useState } from 'react'
import { useStore } from '../lib/store'
import { Badge, Card, Empty, Field, Modal } from '../components/ui'
import { fmtDate } from '../lib/format'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Content() {
  const { db, api, canDo } = useStore()
  const [form, setForm] = useState(null)
  const uname = (id) => db.users.find((u) => u.id === id)?.name?.split(' ')[0] || '—'

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Content Schedule</h1><p className="text-sm text-ink-500">Mon Planning → Tue Design → Wed Editing → Thu Review → Fri Publish</p></div>
        {canDo('content.manage') && <button className="btn-primary" onClick={() => setForm({ title: '', kind: 'Reel', platform: 'Instagram', publishDate: '', status: 'PLANNING', designer: '', editor: '', reviewer: '', publisher: '', deadline: '', notes: '' })}>+ Schedule content</button>}
      </div>

      <Card className="card-pad">
        <h3 className="section-title mb-3">This week's routine (auto-generates tasks)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {db.recurring.filter((r) => r.active).sort((a, b) => a.weekday - b.weekday).map((r) => (
            <div key={r.id} className="rounded-2xl border border-ink-200 p-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-brand-700">{DAYS[r.weekday]}</p>
              <p className="text-sm font-bold mt-0.5">{r.name}</p>
              <p className="text-xs text-ink-500">PIC: {uname(r.assignee)}</p>
            </div>
          ))}
        </div>
      </Card>

      {db.content.length === 0 ? <Card><Empty title="No content scheduled" /></Card> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {db.content.map((c) => (
            <Card key={c.id} className="card-pad">
              <div className="flex items-start justify-between gap-2"><p className="font-bold">{c.title}</p><Badge value={c.status} /></div>
              <p className="text-xs text-ink-500 mt-1">{c.kind} · {c.platform} · publish {fmtDate(c.publishDate)}</p>
              <div className="grid grid-cols-2 gap-1.5 mt-3 text-xs">
                {[['🎨 Designer', c.designer], ['✂️ Editor', c.editor], ['👀 Reviewer', c.reviewer], ['🚀 Publisher', c.publisher]].map(([l, id]) => (
                  <span key={l} className="rounded-lg bg-ink-50 px-2 py-1.5 font-semibold">{l}: {uname(id)}</span>
                ))}
              </div>
              {c.notes && <p className="text-xs text-ink-500 mt-2">📝 {c.notes}</p>}
              {canDo('content.manage') && (
                <div className="flex gap-1.5 mt-3 flex-wrap">{['PLANNING', 'DESIGN', 'EDITING', 'REVIEW', 'SCHEDULED', 'PUBLISHED'].filter((s) => s !== c.status).slice(0, 3).map((s) => <button key={s} className="btn-secondary !py-1 !text-[11px]" onClick={() => api.saveContent({ ...c, status: s })}>→ {s}</button>)}
                  <button className="btn-ghost !py-1 !text-[11px]" onClick={() => setForm({ ...c })}>Edit</button></div>
              )}
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title="Schedule content">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="sm:col-span-2"><Field label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field></div>
            <Field label="Type"><select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>{['Reel', 'Carousel', 'Video', 'Static', 'Story', 'Article'].map((k) => <option key={k}>{k}</option>)}</select></Field>
            <Field label="Platform"><select className="input" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>{['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Website'].map((k) => <option key={k}>{k}</option>)}</select></Field>
            <Field label="Publish date"><input className="input" type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} /></Field>
            <Field label="Deadline"><input className="input" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" onClick={() => { api.saveContent(form.id ? form : { ...form }); setForm(null) }}>Save</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
