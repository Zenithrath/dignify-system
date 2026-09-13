import React, { useMemo, useState } from 'react'
import { useCrm } from '../../lib/crmStore'
import { CLIENT_STATUSES } from '../../data/crmDummy'
import { IDR, fmtDate } from '../../lib/format'
import * as Icons from 'lucide-react'
import FilterTabs from './FilterTabs'
import { ActionModal } from '../workflow'
import { Field } from '../ui'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'MAINTENANCE', label: 'Maintenance' },
  { key: 'COMPLETED', label: 'Completed' }
]
const SORT_OPTIONS = [
  { key: 'latest', label: 'Recently Added' },
  { key: 'value', label: 'Highest Value' },
  { key: 'name', label: 'Name' }
]

function statusBadgeColor(key) {
  const m = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    INACTIVE: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400',
    MAINTENANCE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200'
  }
  return m[key] || m.ACTIVE
}

function paymentBadgeColor(key) {
  const m = {
    PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    OUTSTANDING: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200',
    OVERDUE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  }
  return m[key] || m.OUTSTANDING
}

function ClientItem({ item, isSelected, onClick }) {
  const activeProjects = (item.projects || []).filter((p) => p.status !== 'Completed').length
  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl p-3 transition-all duration-150 ${isSelected ? 'opp-selected shadow-xs' : 'opp-item shadow-2xs hover:shadow-sm'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${isSelected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-950 text-white'}`}>
            {item.business?.slice(0, 3) || '??'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xs dark:text-white">{item.business}</h3>
            <p className="text-[9px] text-gray-400 dark:text-slate-500">{item.industry} · {item.city}</p>
          </div>
        </div>
        <span className={`${statusBadgeColor(item.status)} text-[9px] font-bold px-2 py-0.5 rounded-full shadow-2xs`}>{item.status}</span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px]">
        <span className="text-gray-500 dark:text-slate-400">{item.contact?.name || '—'}</span>
        <span className="text-gray-400 dark:text-slate-500">{activeProjects} project{activeProjects !== 1 ? 's' : ''}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-[10px]">
        <span className="text-gray-500 dark:text-slate-400">{IDR(item.value)}</span>
        <span className={`${paymentBadgeColor(item.paymentStatus)} text-[9px] font-bold px-1.5 py-0.5 rounded`}>{item.paymentStatus}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100/80 dark:border-white/5 flex justify-between items-center text-[10px]">
        <span className="text-gray-400 dark:text-slate-500">Since: <strong className="text-gray-700 dark:text-slate-200">{fmtDate(item.createdAt)}</strong></span>
        {item.lastActivity && <span className="text-gray-500 font-medium dark:text-slate-400">Last: {fmtDate(item.lastActivity)}</span>}
      </div>
    </button>
  )
}

export default function ClientList() {
  const { data, selectedId, selectItem, counts, addClient } = useCrm()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('latest')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ business: '', contactName: '', industry: '', city: '', service: '', value: '' })

  const filtered = useMemo(() => {
    let list = data.clients || []
    if (filter !== 'ALL') list = list.filter((c) => c.status === filter)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter((c) => `${c.business} ${c.contact?.name} ${c.industry} ${c.city} ${c.service} ${c.id}`.toLowerCase().includes(s))
    }
    list = [...list].sort((a, b) => {
      if (sort === 'value') return (b.value || 0) - (a.value || 0)
      if (sort === 'name') return String(a.business || '').localeCompare(String(b.business || ''))
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    })
    return list
  }, [data, q, filter, sort])

  const handleNew = () => {
    if (!newForm.business.trim()) return
    addClient({
      ...newForm, value: Number(newForm.value) || 0,
      contact: { name: newForm.contactName, position: '', phone: '', email: '', instagram: '' },
      status: 'ACTIVE', paymentStatus: 'OUTSTANDING'
    })
    setShowNew(false)
    setNewForm({ business: '', contactName: '', industry: '', city: '', service: '', value: '' })
  }

  return (
    <>
      <div className="p-3.5 border-b border-gray-100/80 dark:border-white/5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-bold text-sm text-gray-900 dark:text-white">Clients</h2>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Businesses currently working with DIGNIFY</p>
          </div>
          <div className="flex items-center gap-1">
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition">
              <Icons.MoreHorizontal size={16} />
            </button>
            <button onClick={() => setShowNew(true)} className="btn-shiny-emerald text-white px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 text-[11px]">
              <Icons.Plus size={14} /> New
            </button>
          </div>
        </div>
        <FilterTabs
          tabs={FILTER_TABS}
          active={filter}
          onChange={setFilter}
          counts={FILTER_TABS.reduce((acc, f) => {
            acc[f.key] = f.key === 'ALL' ? (data.clients || []).length : (data.clients || []).filter((c) => c.status === f.key).length
            return acc
          }, {})}
          showSettings
        />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icons.Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input type="text" placeholder="Search clients..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 pl-8 pr-2 py-1.5 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-600/40 dark:text-slate-200" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-gray-200/80 dark:border-white/10 rounded-xl px-2 flex items-center gap-1 text-gray-600 dark:text-slate-400 text-[10px] bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition appearance-auto">
            {SORT_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Icons.Inbox size={24} />
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">No clients found</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Try adjusting your filters or search</p>
          </div>
        )}
        {filtered.map((c) => <ClientItem key={c.id} item={c} isSelected={c.id === selectedId} onClick={() => selectItem(c.id)} />)}
      </div>
      <ActionModal open={showNew} onClose={() => setShowNew(false)} title="Add client" sub="Add a new client relationship.">
        <div className="space-y-3">
          <Field label="Business *"><input className="input" value={newForm.business} onChange={(e) => setNewForm({ ...newForm, business: e.target.value })} placeholder="e.g. Kedai ABC" /></Field>
          <Field label="Contact Name"><input className="input" value={newForm.contactName} onChange={(e) => setNewForm({ ...newForm, contactName: e.target.value })} placeholder="Budi Santoso" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry"><input className="input" value={newForm.industry} onChange={(e) => setNewForm({ ...newForm, industry: e.target.value })} placeholder="F&B" /></Field>
            <Field label="City"><input className="input" value={newForm.city} onChange={(e) => setNewForm({ ...newForm, city: e.target.value })} placeholder="Malang" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Service"><input className="input" value={newForm.service} onChange={(e) => setNewForm({ ...newForm, service: e.target.value })} placeholder="Website" /></Field>
            <Field label="Value (Rp)"><input type="number" className="input" value={newForm.value} onChange={(e) => setNewForm({ ...newForm, value: e.target.value })} placeholder="5000000" /></Field>
          </div>
          <button onClick={handleNew} className="btn-shiny-emerald w-full text-white font-medium py-2 rounded-xl text-xs">Add Client</button>
        </div>
      </ActionModal>
    </>
  )
}
