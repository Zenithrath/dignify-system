import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { Badge, Card, Empty, Field, Modal, SearchInput } from '../components/ui'
import { IDR } from '../lib/format'

export default function Clients() {
  const { db, api, canDo } = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [form, setForm] = useState(null)

  const list = useMemo(() => db.clients.filter((c) => (c.company + c.id + c.contact).toLowerCase().includes(q.toLowerCase())), [db, q])
  const projectsOf = (id) => db.projects.filter((p) => p.clientId === id)
  const maintOf = (id) => db.maintenance.filter((x) => x.clientId === id)
  const invOf = (id) => db.invoices.filter((x) => x.clientId === id)

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Clients</h1><p className="text-sm text-ink-500">Lead ≠ Client · one client → many projects & maintenance</p></div>
        {canDo('clients.manage') && <button className="btn-primary" onClick={() => setForm({ company: '', contact: '', phone: '', email: '', industry: '', pic: '', status: 'ACTIVE', notes: '', leadId: '' })}>+ New client</button>}
      </div>
      <div className="w-full sm:w-72"><SearchInput value={q} onChange={setQ} placeholder="Search clients…" /></div>
      {list.length === 0 ? <Card><Empty title="No clients" sub="Convert a WON lead or add manually." /></Card> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {list.map((c) => (
            <Card key={c.id} className="card-pad cursor-pointer hover:border-brand-300 transition" >
              <div onClick={() => setSel(c)}>
                <div className="flex items-start justify-between gap-2"><div><p className="font-bold">{c.company}</p><p className="text-xs text-ink-500">{c.id}{c.leadId ? ` · from ${c.leadId}` : ''} · {c.industry}</p></div><Badge value={c.status} /></div>
                <p className="text-xs text-ink-500 mt-2">👤 {c.contact || '—'} · 📞 {c.phone || '—'}</p>
                <div className="flex gap-2 mt-3 text-xs font-bold">
                  <span className="rounded-lg bg-ink-50 px-2 py-1">{projectsOf(c.id).length} projects</span>
                  <span className="rounded-lg bg-ink-50 px-2 py-1">{maintOf(c.id).length} maintenance</span>
                  <span className="rounded-lg bg-brand-50 text-brand-800 px-2 py-1">{IDR(invOf(c.id).reduce((s, i) => s + Number(i.paid || 0), 0))} paid</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.company} wide>
        {sel && (
          <div className="space-y-3 text-sm">
            <p className="text-xs text-ink-500">{sel.id}{sel.leadId ? ` · converted from ${sel.leadId}` : ''} · PIC {db.users.find((u) => u.id === sel.pic)?.name}</p>
            <p>👤 {sel.contact || '—'} · 📞 {sel.phone} · ✉️ {sel.email || '—'}</p>
            {sel.notes && <p className="bg-ink-50 rounded-xl p-3 text-xs">{sel.notes}</p>}
            <h4 className="font-bold">Projects ({projectsOf(sel.id).length})</h4>
            {projectsOf(sel.id).map((p) => <Link key={p.id} to="/projects" className="block rounded-xl border border-ink-200 px-3 py-2 hover:border-brand-400"><b>{p.name}</b> <span className="text-xs text-ink-500">· {p.status} · {p.progress}% · {IDR(p.value)}</span></Link>)}
            <h4 className="font-bold">Maintenance ({maintOf(sel.id).length})</h4>
            {maintOf(sel.id).map((x) => <div key={x.id} className="rounded-xl border border-ink-200 px-3 py-2 text-xs"><b>{x.service}</b> · {x.status} · next {x.nextDue}</div>)}
            <h4 className="font-bold">Payments ({invOf(sel.id).length})</h4>
            {invOf(sel.id).map((i) => <div key={i.id} className="rounded-xl border border-ink-200 px-3 py-2 text-xs"><b>{i.no}</b> · {IDR(i.paid)}/{IDR(i.amount)} · {i.status}</div>)}
          </div>
        )}
      </Modal>
      <Modal open={!!form} onClose={() => setForm(null)} title="New client">
        {form && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Company"><input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
            <Field label="Contact person"><input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></Field>
            <Field label="Phone / WA"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Email"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setForm(null)}>Cancel</button><button className="btn-primary" onClick={() => { const r = api.saveClient(form); if (!r.error) setForm(null) }}>Save</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
