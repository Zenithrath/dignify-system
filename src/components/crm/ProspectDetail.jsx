import React, { useState } from 'react'
import { useCrm } from '../../lib/crmStore'
import { PROSPECT_STATUSES } from '../../data/crmDummy'
import { fmtDate } from '../../lib/format'
import * as Icons from 'lucide-react'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'digital', label: 'Digital Presence' },
  { key: 'history', label: 'History' },
  { key: 'notes', label: 'Notes' }
]

const ACTIVITY_ICONS = { DISCOVERY: 'Radar', QUALIFIED: 'CheckCircle', CONTACTED: 'Phone', RESPONDED: 'MessageCircle', CONVERTED: 'ArrowRight' }

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

function HeroHeader({ item, selectedTab, setSelectedTab }) {
  const info = PROSPECT_STATUSES.find((s) => s.key === item.status) || PROSPECT_STATUSES[0]
  return (
    <div className="glass-card rounded-2xl border border-white dark:border-white/8 shadow-sm shrink-0 overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[140px] relative">
        <div className="flex-1 p-5 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-white flex items-center justify-center font-bold text-sm border border-white/80 shadow-md shrink-0">
                {item.business?.slice(0, 2) || '??'}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{item.business}</h1>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                  <span className="glass-pill px-2 py-0.5 rounded-md text-gray-700 dark:text-slate-200 font-semibold border border-gray-200/50 dark:border-white/10">{item.category}</span>
                  <span>·</span>
                  <span className="glass-pill px-2 py-0.5 rounded-md text-gray-700 dark:text-slate-200 font-semibold border border-gray-200/50 dark:border-white/10">{item.city}</span>
                  <span>·</span>
                  <span className={`${statusBadgeColor(item.status)} text-[9px] font-bold px-2 py-0.5 rounded-full`}>{info.label}</span>
                </div>
              </div>
            </div>
            {item.location && <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 ml-15">{item.location}</p>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {item.whatsapp && <a href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="btn-shiny-emerald text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1"><Icons.MessageCircle size={12} /> WhatsApp</a>}
            {item.instagram && <a href={`https://instagram.com/${item.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 hover:bg-white/90 dark:hover:bg-white/10 shadow-2xs transition"><Icons.Instagram size={12} className="text-pink-600" /> Instagram</a>}
            {item.contact?.email && <a href={`mailto:${item.contact.email}`} className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 hover:bg-white/90 dark:hover:bg-white/10 shadow-2xs transition"><Icons.Mail size={12} className="text-gray-500" /> Email</a>}
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center px-6">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{item.potential}</div>
            <div className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Potential Score</div>
          </div>
        </div>
      </div>
      <div className="flex gap-6 px-5 pt-2.5 text-xs font-medium text-gray-500 dark:text-slate-400 overflow-x-auto relative z-10 scrollbar-none border-t border-gray-100/80 dark:border-white/5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setSelectedTab(t.key)} className={`pb-2 shrink-0 transition ${selectedTab === t.key ? 'text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-600 dark:border-emerald-400 font-bold' : 'hover:text-gray-800 dark:hover:text-slate-200'}`}>{t.label}</button>
        ))}
      </div>
    </div>
  )
}

function OverviewTab({ item }) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 lg:col-span-4 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Business Information</h3>
          <div className="space-y-2 text-[11px]">
            {[
              { label: 'Business Name', value: item.business },
              { label: 'Industry', value: item.industry || item.category },
              { label: 'Location', value: item.city },
              { label: 'Address', value: item.location || '—' },
              { label: 'Source', value: item.source },
              { label: 'Owner', value: item.owner || '—' }
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b border-gray-100/80 dark:border-white/5 pb-1.5 last:border-0">
                <span className="text-gray-400 dark:text-slate-500">{r.label}</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Why Approach</h3>
          <ul className="space-y-1.5">
            {(item.whyApproach || []).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-slate-300">
                <Icons.Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />{w}
              </li>
            ))}
            {(!item.whyApproach || item.whyApproach.length === 0) && <li className="text-[11px] text-gray-400 dark:text-slate-500">No reasons identified yet</li>}
          </ul>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Contact Person</h3>
          <div className="space-y-2 text-[11px]">
            {[
              { label: 'Name', value: item.contact?.name || '—' },
              { label: 'Position', value: item.contact?.position || '—' },
              { label: 'Phone', value: item.contact?.phone || item.whatsapp || '—' },
              { label: 'Email', value: item.contact?.email || '—' },
              { label: 'Instagram', value: item.contact?.instagram || item.instagram || '—' }
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b border-gray-100/80 dark:border-white/5 pb-1.5 last:border-0">
                <span className="text-gray-400 dark:text-slate-500">{r.label}</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Recommended Service</h3>
          <p className="text-[11px] text-gray-600 dark:text-slate-300">{item.recommendedService || '—'}</p>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-xs mb-2.5">
            <span className="text-amber-500">⚡</span> Next Action
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-xl p-2.5 border border-gray-200/50 dark:border-white/5 mb-2.5">
            <p className="font-bold text-gray-900 dark:text-white text-[11px]">{item.nextAction || '—'}</p>
            {item.nextActionDate && <p className="text-[9px] text-gray-500 dark:text-slate-400 mt-0.5">{fmtDate(item.nextActionDate)}</p>}
          </div>
          <button className="btn-shiny-emerald w-full text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1">
            Take Action <Icons.ChevronDown size={12} />
          </button>
        </div>
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Recent Activity</h3>
          <div className="space-y-2.5">
            {(item.activities || []).slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).slice(0, 4).map((a) => (
              <div key={a.id} className="flex gap-2 items-start">
                <div className="p-1.5 rounded-xl shrink-0 border bg-gray-100/70 text-gray-800 border-gray-200/50 dark:bg-white/10 dark:text-slate-300 dark:border-white/10">
                  {I(ACTIVITY_ICONS[a.type] || 'Activity', 14)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">{a.title}</div>
                  <div className="text-[9px] text-gray-400 dark:text-slate-500">{fmtDate(a.at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DigitalTab({ item }) {
  const presence = [
    { label: 'Website', value: item.website || 'Not available', icon: 'Globe', status: item.website ? 'Available' : 'Unavailable', color: item.website ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400' },
    { label: 'Instagram', value: item.instagram || 'Not available', icon: 'Instagram', status: item.instagram ? 'Connected' : 'Unavailable', color: item.instagram ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400' },
    { label: 'TikTok', value: item.tiktok || 'Not available', icon: 'Music', status: item.tiktok ? 'Connected' : 'Unavailable', color: item.tiktok ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400' },
    { label: 'WhatsApp', value: item.whatsapp || 'Not available', icon: 'MessageCircle', status: item.whatsapp ? 'Available' : 'Unavailable', color: item.whatsapp ? 'text-green-600 dark:text-green-400' : 'text-gray-400' }
  ]
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">Digital Presence</h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {presence.map((p) => (
          <div key={p.label} className="bg-white/60 dark:bg-white/5 rounded-xl p-3 border border-gray-200/50 dark:border-white/5">
            <div className="flex items-center gap-2 mb-1">
              {I(p.icon, 14)}
              <span className="font-bold text-gray-900 dark:text-white text-[11px]">{p.label}</span>
            </div>
            <p className={`text-[11px] font-semibold ${p.color}`}>{p.value}</p>
            <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">{p.status}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryTab({ item }) {
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">Activity History</h3>
      <div className="relative pl-3.5 border-l-2 border-emerald-500/80 dark:border-emerald-600/60 space-y-3">
        {(item.activities || []).slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).map((a) => (
          <div key={a.id} className="relative">
            <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-[#0e1513]" />
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">{a.title}</span>
                {a.detail && <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">{a.detail}</p>}
              </div>
              <span className="text-[9px] text-gray-400 dark:text-slate-500 shrink-0">{fmtDate(a.at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesTab({ item }) {
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">Notes</h3>
      <div className="space-y-2">
        {(item.notes || []).slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).map((n) => (
          <div key={n.id} className="bg-amber-50/80 dark:bg-amber-900/20 rounded-xl p-3 text-[11px]">
            <p className="text-gray-700 dark:text-slate-200">{n.text}</p>
            <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-1">{fmtDate(n.at)}</p>
          </div>
        ))}
        {(!item.notes || item.notes.length === 0) && <p className="text-[11px] text-gray-400 dark:text-slate-500">No notes yet</p>}
      </div>
    </div>
  )
}

export default function ProspectDetail() {
  const { selected: item, selectedTab, setSelectedTab } = useCrm()

  if (!item) return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <Icons.Radar size={32} />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-sm">Select a prospect</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 leading-relaxed">Choose from the list to see details and manage outreach</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-3">
        <HeroHeader item={item} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        {selectedTab === 'overview' && <OverviewTab item={item} />}
        {selectedTab === 'digital' && <DigitalTab item={item} />}
        {selectedTab === 'history' && <HistoryTab item={item} />}
        {selectedTab === 'notes' && <NotesTab item={item} />}
      </div>
    </div>
  )
}
