import React from 'react'
import { useCrm } from '../../lib/crmStore'
import { CLIENT_STATUSES } from '../../data/crmDummy'
import { IDR, fmtDate } from '../../lib/format'
import * as Icons from 'lucide-react'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Projects' },
  { key: 'payments', label: 'Payments' },
  { key: 'history', label: 'History' },
  { key: 'notes', label: 'Notes' }
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
    OUTSTANDING: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  }
  return m[key] || m.OUTSTANDING
}

function HeroHeader({ item, selectedTab, setSelectedTab }) {
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
                  <span className="glass-pill px-2 py-0.5 rounded-md text-gray-700 dark:text-slate-200 font-semibold border border-gray-200/50 dark:border-white/10">{item.industry}</span>
                  <span>·</span>
                  <span className="glass-pill px-2 py-0.5 rounded-md text-gray-700 dark:text-slate-200 font-semibold border border-gray-200/50 dark:border-white/10">{item.city}</span>
                  <span>·</span>
                  <span className={`${statusBadgeColor(item.status)} text-[9px] font-bold px-2 py-0.5 rounded-full`}>{item.status}</span>
                </div>
              </div>
            </div>
            {item.contact?.name && <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-2 ml-15">{item.contact.name} · {item.contact.position || 'Contact'}</p>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {item.contact?.phone && <a href={`https://wa.me/${item.contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="btn-shiny-emerald text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1"><Icons.MessageCircle size={12} /> WhatsApp</a>}
            {item.contact?.email && <a href={`mailto:${item.contact.email}`} className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 hover:bg-white/90 dark:hover:bg-white/10 shadow-2xs transition"><Icons.Mail size={12} className="text-gray-500" /> Email</a>}
            {item.opportunityId && <button className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 hover:bg-white/90 dark:hover:bg-white/10 shadow-2xs transition"><Icons.ExternalLink size={12} /> View Opportunity</button>}
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center px-6">
          <div className="text-right">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{IDR(item.value)}</div>
            <div className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Client Value</div>
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
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Client Information</h3>
          <div className="space-y-2 text-[11px]">
            {[
              { label: 'Client ID', value: item.id },
              { label: 'Business', value: item.business },
              { label: 'Contact', value: item.contact?.name || '—' },
              { label: 'Position', value: item.contact?.position || '—' },
              { label: 'Phone', value: item.contact?.phone || '—' },
              { label: 'Email', value: item.contact?.email || '—' },
              { label: 'Instagram', value: item.contact?.instagram || '—' },
              { label: 'Location', value: item.location || item.city }
            ].map((r) => (
              <div key={r.label} className="flex justify-between border-b border-gray-100/80 dark:border-white/5 pb-1.5 last:border-0">
                <span className="text-gray-400 dark:text-slate-500">{r.label}</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Active Projects</h3>
          <div className="space-y-2">
            {(item.projects || []).filter((p) => p.status !== 'Completed').map((p, i) => (
              <div key={i} className="bg-white/60 dark:bg-white/5 rounded-xl p-2.5 border border-gray-200/50 dark:border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-[11px]">{p.name}</p>
                    <p className="text-[9px] text-gray-400 dark:text-slate-500">{p.status}</p>
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300">{IDR(p.value)}</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
                </div>
                <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">{p.progress || 0}%</p>
              </div>
            ))}
            {(!item.projects || item.projects.filter((p) => p.status !== 'Completed').length === 0) && <p className="text-[11px] text-gray-400 dark:text-slate-500">No active projects</p>}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Recent Activity</h3>
          <div className="space-y-2">
            <div className="flex gap-2 items-start">
              <div className="p-1.5 rounded-xl shrink-0 border bg-gray-100/70 text-gray-800 border-gray-200/50 dark:bg-white/10 dark:text-slate-300 dark:border-white/10">
                {I('Activity', 14)}
              </div>
              <div>
                <div className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">Client relationship active</div>
                <div className="text-[9px] text-gray-400 dark:text-slate-500">Since {fmtDate(item.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-4 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400 dark:text-slate-500">Total Value</span>
              <span className="font-bold text-gray-900 dark:text-white">{IDR(item.value)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400 dark:text-slate-500">Paid</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{IDR(item.paid || 0)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400 dark:text-slate-500">Outstanding</span>
              <span className="font-bold text-red-600 dark:text-red-400">{IDR(item.outstanding || 0)}</span>
            </div>
            <div className="pt-2 border-t border-gray-100/80 dark:border-white/5">
              <span className={`${paymentBadgeColor(item.paymentStatus)} text-[10px] font-bold px-2 py-0.5 rounded`}>{item.paymentStatus}</span>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Maintenance</h3>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-400 dark:text-slate-500">Status</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{item.maintenance ? 'Active' : 'Not active'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectsTab({ item }) {
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">All Projects</h3>
      <div className="space-y-2">
        {(item.projects || []).map((p, i) => (
          <div key={i} className="bg-white/60 dark:bg-white/5 rounded-xl p-3 border border-gray-200/50 dark:border-white/5">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-[11px]">{p.name}</p>
                <p className="text-[9px] text-gray-400 dark:text-slate-500">{p.status}</p>
              </div>
              <span className="text-[10px] font-bold text-gray-700 dark:text-slate-300">{IDR(p.value)}</span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.progress || 0}%` }} />
            </div>
            <p className="text-[9px] text-gray-400 dark:text-slate-500 mt-0.5">{p.progress || 0}% complete</p>
          </div>
        ))}
        {(!item.projects || item.projects.length === 0) && <p className="text-[11px] text-gray-400 dark:text-slate-500">No projects yet</p>}
      </div>
    </div>
  )
}

function PaymentsTab({ item }) {
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">Payment Overview</h3>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3 border border-gray-200/50 dark:border-white/5 text-center">
          <p className="text-lg font-extrabold text-gray-900 dark:text-white">{IDR(item.value)}</p>
          <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Total Value</p>
        </div>
        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3 border border-gray-200/50 dark:border-white/5 text-center">
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{IDR(item.paid || 0)}</p>
          <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Paid</p>
        </div>
        <div className="bg-white/60 dark:bg-white/5 rounded-xl p-3 border border-gray-200/50 dark:border-white/5 text-center">
          <p className="text-lg font-extrabold text-red-600 dark:text-red-400">{IDR(item.outstanding || 0)}</p>
          <p className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Outstanding</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-gray-400 dark:text-slate-500">Status:</span>
        <span className={`${paymentBadgeColor(item.paymentStatus)} text-[10px] font-bold px-2 py-0.5 rounded`}>{item.paymentStatus}</span>
      </div>
    </div>
  )
}

function HistoryTab({ item }) {
  const events = [
    { title: 'Client created', date: item.createdAt, icon: 'UserPlus' },
    ...(item.projects || []).map((p) => ({ title: `Project: ${p.name}`, date: item.createdAt, icon: 'FolderKanban' }))
  ]
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">Client History</h3>
      <div className="relative pl-3.5 border-l-2 border-emerald-500/80 dark:border-emerald-600/60 space-y-3">
        {events.map((e, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[19px] top-1 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white dark:ring-[#0e1513]" />
            <div className="flex justify-between items-start">
              <span className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">{e.title}</span>
              <span className="text-[9px] text-gray-400 dark:text-slate-500 shrink-0">{fmtDate(e.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesTab() {
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-3">Notes</h3>
      <p className="text-[11px] text-gray-400 dark:text-slate-500">No notes yet</p>
    </div>
  )
}

export default function ClientDetail() {
  const { selected: item, selectedTab, setSelectedTab } = useCrm()

  if (!item) return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <Icons.UserCheck size={32} />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-sm">Select a client</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 leading-relaxed">Choose from the list to see projects, payments, and history</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-3">
        <HeroHeader item={item} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        {selectedTab === 'overview' && <OverviewTab item={item} />}
        {selectedTab === 'projects' && <ProjectsTab item={item} />}
        {selectedTab === 'payments' && <PaymentsTab item={item} />}
        {selectedTab === 'history' && <HistoryTab item={item} />}
        {selectedTab === 'notes' && <NotesTab />}
      </div>
    </div>
  )
}
