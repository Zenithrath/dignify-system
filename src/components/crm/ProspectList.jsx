import React, { useMemo, useState } from 'react'
import { useCrm } from '../../lib/crmStore'
import { PROSPECT_STATUSES } from '../../data/crmDummy'
import { fmtDate } from '../../lib/format'
import * as Icons from 'lucide-react'
import FilterTabs from './FilterTabs'
import { ActionModal } from '../workflow'
import { Field } from '../ui'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'NEW', label: 'New' },
  { key: 'QUALIFIED', label: 'Qualified' },
  { key: 'READY', label: 'Ready' },
  { key: 'CONTACTED', label: 'Contacted' },
  { key: 'CONVERTED', label: 'Converted' }
]
const SORT_OPTIONS = [
  { key: 'latest', label: 'Recently Added' },
  { key: 'potential', label: 'Highest Potential' },
  { key: 'action', label: 'Next Action' }
]

function statusBadgeColor(key) {
  const m = {
    NEW: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    QUALIFIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    READY: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200',
    CONTACTED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    RESPONDED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    CONVERTED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
    NOT_RELEVANT: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-slate-400',
    DO_NOT_CONTACT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  }
  return m[key] || m.NEW
}

const STATUS_PULSE = ['READY', 'CONTACTED']

function ProspectItem({ item, isSelected, onClick }) {
  const hasPulse = STATUS_PULSE.includes(item.status)
  const info = PROSPECT_STATUSES.find((s) => s.key === item.status) || PROSPECT_STATUSES[0]
  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl p-3 transition-all duration-150 ${isSelected ? 'opp-selected shadow-xs' : 'opp-item shadow-2xs hover:shadow-sm'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${isSelected ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-950 text-white'}`}>
            {item.business?.slice(0, 3) || '??'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xs dark:text-white">{item.business}</h3>
            <p className="text-[9px] text-gray-400 dark:text-slate-500">{item.category} · {item.city}</p>
          </div>
        </div>
        <span className={`${statusBadgeColor(item.status)} text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs`}>
          {hasPulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
          {info.label}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px]">
        <span className="text-gray-500 dark:text-slate-400">Potential: <strong className="text-gray-700 dark:text-slate-200">{item.potential}</strong></span>
        <span className="text-gray-400 dark:text-slate-500">{item.source}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[10px]">
        {item.website && <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">{I('Globe', 10)} Web</span>}
        {item.instagram && <span className="text-pink-600 dark:text-pink-400 flex items-center gap-0.5">{I('Instagram', 10)} IG</span>}
        {item.whatsapp && <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">{I('MessageCircle', 10)} WA</span>}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100/80 dark:border-white/5 flex justify-between items-center text-[10px]">
        <span className="text-gray-400 dark:text-slate-500">Next: <strong className="text-gray-700 dark:text-slate-200">{item.nextAction}</strong></span>
        {item.nextActionDate && <span className="text-gray-500 font-medium dark:text-slate-400">{fmtDate(item.nextActionDate)}</span>}
      </div>
    </button>
  )
}

export default function ProspectList() {
  const { data, selectedId, selectItem, counts, addProspect } = useCrm()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('latest')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ business: '', category: '', city: '', industry: '', source: 'Scraped', whatsapp: '', instagram: '', website: '' })

  const filtered = useMemo(() => {
    let list = data.prospects || []
    if (filter !== 'ALL') list = list.filter((p) => p.status === filter)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter((p) => `${p.business} ${p.category} ${p.city} ${p.industry} ${p.source} ${p.id}`.toLowerCase().includes(s))
    }
    list = [...list].sort((a, b) => {
      if (sort === 'potential') return (b.potential || 0) - (a.potential || 0)
      if (sort === 'action') return String(a.nextActionDate || 'z').localeCompare(String(b.nextActionDate || 'z'))
      return String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    })
    return list
  }, [data, q, filter, sort])

  const handleNew = () => {
    if (!newForm.business.trim()) return
    addProspect({
      ...newForm,
      status: 'NEW', potential: 50, owner: 'U002',
      whyApproach: [], recommendedService: '', nextAction: 'Review prospect', nextActionDate: '',
      contact: { name: '', position: '', phone: newForm.whatsapp, email: '', instagram: newForm.instagram }
    })
    setShowNew(false)
    setNewForm({ business: '', category: '', city: '', industry: '', source: 'Scraped', whatsapp: '', instagram: '', website: '' })
  }

  return (
    <>
      <div className="p-3.5 border-b border-gray-100/80 dark:border-white/5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-bold text-sm text-gray-900 dark:text-white">Prospects</h2>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Businesses discovered and prioritized for outreach</p>
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
            acc[f.key] = f.key === 'ALL' ? (data.prospects || []).length : (data.prospects || []).filter((p) => p.status === f.key).length
            return acc
          }, {})}
          showSettings
        />
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icons.Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input type="text" placeholder="Search prospects..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 pl-8 pr-2 py-1.5 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-600/40 dark:text-slate-200" />
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
            <p className="text-xs font-bold text-gray-900 dark:text-white">No prospects found</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Try adjusting your filters or search</p>
          </div>
        )}
        {filtered.map((p) => <ProspectItem key={p.id} item={p} isSelected={p.id === selectedId} onClick={() => selectItem(p.id)} />)}
      </div>
      <ActionModal open={showNew} onClose={() => setShowNew(false)} title="Add prospect" sub="Add a business to your prospect pipeline.">
        <div className="space-y-3">
          <Field label="Business *"><input className="input" value={newForm.business} onChange={(e) => setNewForm({ ...newForm, business: e.target.value })} placeholder="e.g. Kedai ABC" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><input className="input" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })} placeholder="Restaurant" /></Field>
            <Field label="City"><input className="input" value={newForm.city} onChange={(e) => setNewForm({ ...newForm, city: e.target.value })} placeholder="Malang" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Industry"><input className="input" value={newForm.industry} onChange={(e) => setNewForm({ ...newForm, industry: e.target.value })} placeholder="F&B" /></Field>
            <Field label="Source">
              <select className="input" value={newForm.source} onChange={(e) => setNewForm({ ...newForm, source: e.target.value })}>
                {['Scraped', 'Manual', 'Imported', 'Inbound', 'Referral'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><input className="input" value={newForm.whatsapp} onChange={(e) => setNewForm({ ...newForm, whatsapp: e.target.value })} placeholder="0812..." /></Field>
            <Field label="Instagram"><input className="input" value={newForm.instagram} onChange={(e) => setNewForm({ ...newForm, instagram: e.target.value })} placeholder="@username" /></Field>
          </div>
          <Field label="Website"><input className="input" value={newForm.website} onChange={(e) => setNewForm({ ...newForm, website: e.target.value })} placeholder="https://..." /></Field>
          <button onClick={handleNew} className="btn-shiny-emerald w-full text-white font-medium py-2 rounded-xl text-xs">Add Prospect</button>
        </div>
      </ActionModal>
    </>
  )
}
