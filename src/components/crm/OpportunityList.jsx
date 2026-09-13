import React, { useMemo, useState } from 'react'
import { useCrm } from '../../lib/crmStore'
import { CRM_STAGES, stageInfo } from '../../data/crmDummy'
import { IDR, fmtDate } from '../../lib/format'
import * as Icons from 'lucide-react'
import FilterTabs from './FilterTabs'
import { ActionModal } from '../workflow'
import { Field } from '../ui'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

const FILTER_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'BRIEF', label: 'Brief' },
  { key: 'ANALYSIS', label: 'Analysis' },
  { key: 'SOLUTION', label: 'Solution' },
  { key: 'PROPOSAL', label: 'Proposal' },
  { key: 'NEGOTIATION', label: 'Negotiation' },
  { key: 'WON', label: 'Won' },
  { key: 'REJECTED', label: 'Rejected' }
]
const SORT_OPTIONS = [
  { key: 'latest', label: 'Latest' },
  { key: 'oldest', label: 'Oldest' },
  { key: 'value', label: 'Highest Value' },
  { key: 'action', label: 'Next Action' }
]

function stageBadgeColor(key) {
  const m = {
    DISCOVERED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    CONTACTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    RESPONDED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200',
    FOLLOW_UP: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    BRIEF: 'bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 dark:bg-emerald-900/40 dark:text-emerald-200',
    ANALYSIS: 'bg-amber-50/80 text-amber-800 border border-amber-200/60 dark:bg-amber-900/40 dark:text-amber-200',
    SOLUTION: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
    PROPOSAL: 'bg-orange-50/80 text-orange-800 border border-orange-200/60 dark:bg-orange-900/40 dark:text-orange-200',
    NEGOTIATION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
    WON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  }
  return m[key] || m.DISCOVERED
}

const STAGE_PULSE = ['BRIEF', 'ANALYSIS', 'PROPOSAL', 'NEGOTIATION']

function OppItem({ opp, isSelected, onClick }) {
  const na = opp.nextAction || stageInfo(opp.stage).label
  const naDate = opp.nextActionDate || opp.followUpDate || ''
  const info = stageInfo(opp.stage)
  const hasPulse = STAGE_PULSE.includes(opp.stage)
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-3 transition-all duration-150 ${
        isSelected ? 'opp-selected shadow-xs' : 'opp-item shadow-2xs hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
            isSelected
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-emerald-950 text-white'
          }`}>
            {opp.business?.slice(0, 3) || '??'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xs dark:text-white">{opp.business}</h3>
            <p className="text-[9px] text-gray-400 dark:text-slate-500">{opp.category} · {opp.city}</p>
          </div>
        </div>
        <span className={`${stageBadgeColor(opp.stage)} text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs`}>
          {hasPulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />}
          {info.label}
        </span>
      </div>
      <div className="mt-2 text-xs font-bold text-gray-900 dark:text-white">{IDR(opp.estimatedValue)}</div>
      <div className="text-[10px] text-gray-500 dark:text-slate-400">{opp.service}</div>
      <div className="mt-2.5 pt-2 border-t border-gray-100/80 dark:border-white/5 flex justify-between items-center text-[10px]">
        <span className="text-gray-400 dark:text-slate-500">Next: <strong className="text-gray-700 dark:text-slate-200">{na}</strong></span>
        {naDate && <span className="text-gray-500 font-medium dark:text-slate-400">{fmtDate(naDate)}</span>}
      </div>
    </button>
  )
}

export default function OpportunityList() {
  const { data, selectedId, selectOpp, counts, addOpp } = useCrm()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [sort, setSort] = useState('latest')
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ business: '', category: '', city: '', service: 'Website Company Profile', estimatedValue: '', priority: 'MEDIUM' })

  const filtered = useMemo(() => {
    let list = data.opportunities || []
    if (filter !== 'ALL') list = list.filter((o) => o.stage === filter)
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter((o) => `${o.business} ${o.category} ${o.city} ${o.service} ${o.id}`.toLowerCase().includes(s))
    }
    list = [...list].sort((a, b) => {
      if (sort === 'value') return (b.estimatedValue || 0) - (a.estimatedValue || 0)
      if (sort === 'oldest') return String(a.contactDate || '').localeCompare(String(b.contactDate || ''))
      if (sort === 'action') return String(a.nextActionDate || 'z').localeCompare(String(b.nextActionDate || 'z'))
      return String(b.contactDate || '').localeCompare(String(a.contactDate || ''))
    })
    return list
  }, [data, q, filter, sort])

  const handleNew = () => {
    if (!newForm.business.trim()) return
    addOpp({
      ...newForm, estimatedValue: Number(newForm.estimatedValue) || 0,
      stage: 'DISCOVERED', contactDate: new Date().toISOString().slice(0, 10),
      owner: 'U002', pic: 'U002',
      contact: { name: '', phone: '', email: '', position: '', instagram: '' },
      activities: [{ id: 'AN001', type: 'PROSPECT', at: new Date().toISOString(), by: 'system', title: 'Prospect created', detail: 'New opportunity added.' }],
      notes: [], team: [], tags: [], files: [], brief: null, analysis: null, proposals: []
    })
    setShowNew(false)
    setNewForm({ business: '', category: '', city: '', service: 'Website Company Profile', estimatedValue: '', priority: 'MEDIUM' })
  }

  return (
    <>
      <div className="p-3.5 border-b border-gray-100/80 dark:border-white/5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="font-bold text-sm text-gray-900 dark:text-white">Opportunities</h2>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">Calon client yang sedang diproses</p>
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

        {/* Filter Tabs */}
        <FilterTabs
          tabs={FILTER_TABS.slice(0, 4)}
          active={filter}
          onChange={setFilter}
          counts={{ ALL: counts.total, ...counts.byStage }}
          showSettings
        />

        {/* Search & Sort */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icons.Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search opportunity..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 pl-8 pr-2 py-1.5 rounded-xl text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-600/40 dark:text-slate-200"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-200/80 dark:border-white/10 rounded-xl px-2 flex items-center gap-1 text-gray-600 dark:text-slate-400 text-[10px] bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition appearance-auto"
          >
            {SORT_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-100 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Icons.Inbox size={24} />
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">No opportunities found</p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">Try adjusting your filters or search</p>
          </div>
        )}
        {filtered.map((opp) => (
          <OppItem key={opp.id} opp={opp} isSelected={opp.id === selectedId} onClick={() => selectOpp(opp.id)} />
        ))}
      </div>

      {/* New Opportunity Modal */}
      <ActionModal open={showNew} onClose={() => setShowNew(false)} title="New opportunity" sub="Start tracking a potential client.">
        <div className="space-y-3">
          <Field label="Business *"><input className="input" value={newForm.business} onChange={(e) => setNewForm({ ...newForm, business: e.target.value })} placeholder="e.g. Kedai ABC" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category"><input className="input" value={newForm.category} onChange={(e) => setNewForm({ ...newForm, category: e.target.value })} placeholder="Restaurant" /></Field>
            <Field label="City"><input className="input" value={newForm.city} onChange={(e) => setNewForm({ ...newForm, city: e.target.value })} placeholder="Malang" /></Field>
          </div>
          <Field label="Service"><input className="input" value={newForm.service} onChange={(e) => setNewForm({ ...newForm, service: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Est. Value"><input type="number" className="input" value={newForm.estimatedValue} onChange={(e) => setNewForm({ ...newForm, estimatedValue: e.target.value })} placeholder="5000000" /></Field>
            <Field label="Priority">
              <select className="input" value={newForm.priority} onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}>
                <option>URGENT</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option>
              </select>
            </Field>
          </div>
          <button onClick={handleNew} className="btn-shiny-emerald w-full text-white font-medium py-2 rounded-xl text-xs">Create opportunity</button>
        </div>
      </ActionModal>
    </>
  )
}
