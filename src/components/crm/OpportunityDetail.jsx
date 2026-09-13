import React, { useMemo, useState } from 'react'
import { useCrm } from '../../lib/crmStore'
import { CRM_STAGES, STAGE_IDX, stageInfo, nextStageKey } from '../../data/crmDummy'
import { IDR, fmtDate, nowISO } from '../../lib/format'
import { ActionModal } from '../workflow'
import { Field } from '../ui'
import * as Icons from 'lucide-react'

const I = (n, s = 16) => { const C = Icons[n] || Icons.Circle; return <C size={s} /> }

const TABS = [
  { key: 'overview', label: 'Overview', icon: 'LayoutGrid' },
  { key: 'journey', label: 'Journey', icon: 'Route' },
  { key: 'brief', label: 'Brief', icon: 'FileText' },
  { key: 'analysis', label: 'Analysis', icon: 'Search' },
  { key: 'proposal', label: 'Proposal', icon: 'Send' },
  { key: 'communication', label: 'Communication', icon: 'MessageSquare' },
  { key: 'files', label: 'Files', icon: 'Paperclip' },
  { key: 'notes', label: 'Notes', icon: 'StickyNote' }
]

const ACTIVITY_ICONS = {
  PROSPECT: 'Radar', CONTACT: 'Phone', RESPONSE: 'MessageCircle', MEETING: 'Users', BRIEF: 'FileText',
  ANALYSIS: 'Search', PROPOSAL: 'Send', REJECTION: 'XCircle', STAGE: 'ArrowRight', APPROVAL: 'CheckCircle', WON: 'Trophy'
}

const PRIORITY_COLORS = {
  URGENT: 'text-red-600 dark:text-red-400',
  HIGH: 'text-red-500 dark:text-red-400',
  MEDIUM: 'text-amber-500 dark:text-amber-400',
  LOW: 'text-gray-400 dark:text-slate-500'
}

function HeroHeader({ opp }) {
  const { setStage, selectedTab, setSelectedTab } = useCrm()
  const [stageOpen, setStageOpen] = useState(false)
  const [nextStage, setNextStage] = useState('')
  const info = stageInfo(opp.stage)

  return (
    <div className="glass-card rounded-2xl border border-white dark:border-white/8 shadow-sm shrink-0 overflow-hidden">
      <div className="flex flex-col md:flex-row min-h-[170px] relative">
        {/* Left Side Details */}
        <div className="flex-1 p-5 flex flex-col justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-white flex items-center justify-center font-bold text-sm border border-white/80 shadow-md shrink-0">
                {opp.business?.slice(0, 2) || '??'}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{opp.business}</h1>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
                  <span className="glass-pill px-2 py-0.5 rounded-md text-gray-700 dark:text-slate-200 font-semibold border border-gray-200/50 dark:border-white/10">{opp.category}</span>
                  <span>·</span>
                  <span className="glass-pill px-2 py-0.5 rounded-md text-gray-700 dark:text-slate-200 font-semibold border border-gray-200/50 dark:border-white/10">{opp.city}</span>
                  <span>·</span>
                  <span className="text-gray-400 dark:text-slate-500">Prospect → Opportunity</span>
                </div>
              </div>
            </div>
            {opp.description && <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-3 font-medium">{opp.description}</p>}
          </div>

          {/* Contact Pills */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {opp.contact?.phone && (
              <a href={`https://wa.me/${opp.contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener" className="btn-shiny-emerald text-white px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1">
                <Icons.MessageCircle size={12} /> WhatsApp
              </a>
            )}
            {opp.contact?.instagram && (
              <a href={`https://instagram.com/${opp.contact.instagram.replace('@', '')}`} target="_blank" rel="noopener" className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 hover:bg-white/90 dark:hover:bg-white/10 shadow-2xs transition">
                <Icons.Instagram size={12} className="text-pink-600" /> Instagram
              </a>
            )}
            {opp.contact?.email && (
              <a href={`mailto:${opp.contact.email}`} className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 hover:bg-white/90 dark:hover:bg-white/10 shadow-2xs transition">
                <Icons.Mail size={12} className="text-gray-500" /> Email
              </a>
            )}
            {opp.location && (
              <span className="glass-pill text-gray-700 dark:text-slate-200 border border-gray-200/60 dark:border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-medium flex items-center gap-1 shadow-2xs">
                <Icons.MapPin size={12} className="text-red-500" /> Maps
              </span>
            )}
          </div>
        </div>

        {/* Right Side Cover Image */}
        <div className="w-full md:w-[50%] h-48 md:h-auto relative shrink-0 overflow-hidden">
          <img
            src={`https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80`}
            alt={`${opp.business} Banner`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 crm-hero-fade w-full h-full pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 dark:from-[#0e1513]/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            <button className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 text-gray-800 dark:text-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-semibold hover:bg-white dark:hover:bg-white/20 shadow-sm transition flex items-center gap-1">
              <Icons.Edit3 size={12} /> Edit
            </button>
            <button className="bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/10 text-gray-700 dark:text-slate-300 rounded-xl p-1.5 hover:bg-white dark:hover:bg-white/20 shadow-sm transition">
              <Icons.MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Value Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200/60 dark:divide-white/5 bg-gray-50/60 dark:bg-white/[0.03] border-t border-b border-gray-200/60 dark:border-white/5 py-2.5 px-5 relative z-10">
        <div className="pr-2">
          <div className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Est Value</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{IDR(opp.estimatedValue)}</div>
        </div>
        <div className="px-4">
          <div className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Target Deadline</div>
          <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{opp.brief?.deadline || '—'}</div>
        </div>
        <div className="px-4">
          <div className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Owner</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-emerald-950 text-white flex items-center justify-center text-[7px] font-bold ring-1 ring-gray-300 dark:ring-white/20">R</div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">{opp.owner || '—'}</span>
          </div>
        </div>
        <div className="pl-4">
          <div className="text-[9px] text-gray-400 dark:text-slate-500 uppercase tracking-wider font-semibold">Stage / Priority</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`${stageBadgeColor(opp.stage)} text-[10px] font-bold px-2 py-0.5 rounded-md`}>{info.label}</span>
            <span className={`font-bold text-xs flex items-center gap-1 ${PRIORITY_COLORS[opp.priority] || 'text-gray-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${opp.priority === 'HIGH' || opp.priority === 'URGENT' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              {opp.priority || 'MEDIUM'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Tabs */}
      <div className="flex gap-6 px-5 pt-2.5 text-xs font-medium text-gray-500 dark:text-slate-400 overflow-x-auto relative z-10 scrollbar-none">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setSelectedTab(t.key)} className={`pb-2 shrink-0 transition ${
            selectedTab === t.key
              ? 'text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-600 dark:border-emerald-400 font-bold'
              : 'hover:text-gray-800 dark:hover:text-slate-200'
          }`}>{t.label}</button>
        ))}
      </div>
    </div>
  )
}

function stageBadgeColor(key) {
  const m = {
    DISCOVERED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    CONTACTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
    RESPONDED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200',
    FOLLOW_UP: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    BRIEF: 'bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 dark:bg-emerald-900/40 dark:text-emerald-200',
    ANALYSIS: 'bg-amber-50/80 text-amber-800 border border-amber-200/60 dark:bg-amber-900/40 dark:text-amber-200',
    SOLUTION: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200',
    PROPOSAL: 'bg-orange-50/80 text-orange-800 border border-orange-200/60 dark:bg-orange-900/40 dark:text-orange-200',
    NEGOTIATION: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-200',
    WON: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
  }
  return m[key] || m.DISCOVERED
}

function OverviewTab({ opp, users }) {
  const { addNote, addActivity, setSelectedTab } = useCrm()
  const [noteText, setNoteText] = useState('')
  const na = opp.nextAction
    ? { label: opp.nextAction, detail: opp.nextActionType || '', due: opp.nextActionDate ? fmtDate(opp.nextActionDate) : '' }
    : { label: stageInfo(opp.stage).label, detail: 'Current stage', due: '' }

  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Column A: Info Cards */}
      <div className="col-span-12 lg:col-span-4 space-y-3">
        {/* Client Information */}
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs">Client Information</h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-[11px] flex items-center gap-1 transition">
              <Icons.Edit2 size={12} /> Edit
            </button>
          </div>
          <div className="space-y-2 text-[11px]">
            {[
              { label: 'Business Name', value: opp.business },
              { label: 'Contact Person', value: opp.contact?.name || '—' },
              { label: 'Position', value: opp.contact?.position || '—' },
              { label: 'Phone', value: opp.contact?.phone || '—', icon: 'Phone', iconColor: 'text-emerald-600' },
              { label: 'Instagram', value: opp.contact?.instagram || '—', icon: 'Instagram', iconColor: 'text-pink-600' },
              { label: 'Email', value: opp.contact?.email || '—', icon: 'Mail', iconColor: 'text-gray-400' },
              { label: 'Location', value: opp.location || opp.city || '—', icon: 'MapPin', iconColor: 'text-red-500' }
            ].map((row) => (
              <div key={row.label} className="flex justify-between border-b border-gray-100/80 dark:border-white/5 pb-1.5 last:border-0">
                <span className="text-gray-400 dark:text-slate-500">{row.label}</span>
                <span className="font-semibold text-gray-800 dark:text-slate-200 flex items-center gap-1">
                  {row.value}
                  {row.icon && I(row.icon, 12) && <span className={row.iconColor}>{I(row.icon, 12)}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Overview */}
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs">Business Overview</h3>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-[11px] flex items-center gap-1 transition">
              <Icons.Edit2 size={12} /> Edit
            </button>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-gray-100/80 dark:border-white/5 pb-1.5">
              <span className="text-gray-400 dark:text-slate-500">Industry</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{opp.industry || opp.category || '—'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100/80 dark:border-white/5 pb-1.5">
              <span className="text-gray-400 dark:text-slate-500">Existing System</span>
              <span className="font-semibold text-gray-800 dark:text-slate-200">{opp.existingSystem || 'None'}</span>
            </div>
            {opp.description && (
              <div className="pt-1">
                <span className="text-gray-400 dark:text-slate-500 block mb-1">Description</span>
                <p className="text-[10px] text-gray-600 dark:text-slate-300 leading-relaxed bg-white/60 dark:bg-white/5 p-2.5 rounded-xl border border-gray-200/50 dark:border-white/5">
                  {opp.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Column B: Journey & Activities */}
      <div className="col-span-12 lg:col-span-4 space-y-3">
        {/* Journey */}
        <JourneyCard opp={opp} />

        {/* Recent Activities */}
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="font-bold text-gray-900 dark:text-white text-xs">Recent Activities</h3>
            <button onClick={() => setSelectedTab('communication')} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition">See All</button>
          </div>
          <div className="space-y-2.5">
            {(opp.activities || []).slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).slice(0, 4).map((a) => (
              <div key={a.id} className="flex gap-2 items-start">
                <div className={`p-1.5 rounded-xl shrink-0 border ${
                  a.type === 'MEETING' ? 'bg-emerald-100/70 text-emerald-800 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50'
                  : a.type === 'RESPONSE' ? 'bg-blue-100/70 text-blue-800 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50'
                  : 'bg-gray-100/70 text-gray-800 border-gray-200/50 dark:bg-white/10 dark:text-slate-300 dark:border-white/10'
                }`}>
                  {I(ACTIVITY_ICONS[a.type] || 'Activity', 14)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">{a.title}</div>
                  <div className="text-[9px] text-gray-400 dark:text-slate-500">{fmtDate(a.at)}{a.channel ? ` · ${a.channel}` : ''}</div>
                  {a.detail && <div className="text-[10px] text-gray-600 dark:text-slate-400 mt-0.5">{a.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column C: Actions & Team */}
      <div className="col-span-12 lg:col-span-4 space-y-3">
        {/* Next Action */}
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-xs mb-2.5">
            <span className="text-amber-500">⚡</span> Next Action
          </div>
          <div className="bg-white/60 dark:bg-white/5 rounded-xl p-2.5 border border-gray-200/50 dark:border-white/5 mb-2.5">
            <div className="flex items-start gap-2">
              <div className="p-1.5 bg-emerald-100/80 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg shrink-0">
                {I(opp.nextActionType === 'meeting' ? 'Calendar' : 'ArrowRight', 14)}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-[11px]">{na.label}</h4>
                {na.due && <div className="text-[9px] text-gray-500 dark:text-slate-400 mt-0.5">📅 {na.due}</div>}
                {opp.nextActionType && <div className="text-[9px] text-gray-500 dark:text-slate-400 capitalize">Type: {opp.nextActionType}</div>}
              </div>
            </div>
          </div>
          <button className="btn-shiny-emerald w-full text-white font-medium py-2 rounded-xl text-xs flex items-center justify-center gap-1">
            Take Action <Icons.ChevronDown size={12} />
          </button>
        </div>

        {/* Team */}
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <h3 className="font-bold text-gray-900 dark:text-white text-xs mb-2.5">Team</h3>
          <div className="space-y-2">
            {(opp.team || []).length === 0 && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-950 text-white flex items-center justify-center text-[8px] font-bold border border-gray-200 dark:border-white/10">R</div>
                <div>
                  <div className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">Reza</div>
                  <div className="text-[9px] text-gray-400 dark:text-slate-500">Business Team</div>
                </div>
              </div>
            )}
            {(opp.team || []).map((t) => {
              const u = users?.find((x) => x.id === t.userId)
              return (
                <div key={t.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 text-white flex items-center justify-center text-[8px] font-bold border border-gray-200 dark:border-white/10">
                      {u?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-slate-200 text-[11px]">{u?.name || t.userId}</div>
                      <div className="text-[9px] text-gray-400 dark:text-slate-500">{t.role}</div>
                    </div>
                  </div>
                  <span className={`text-[8px] border font-semibold px-1.5 py-0.5 rounded-md ${
                    t.role === 'PIC' ? 'bg-gray-100/80 dark:bg-white/10 border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-slate-300'
                    : t.role === 'Approver' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/50'
                    : 'bg-gray-100/80 dark:bg-white/10 border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-slate-300'
                  }`}>{t.role}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white text-xs mb-2">
            <span className="text-amber-500">⚡</span> Quick Actions
          </div>
          <div className="space-y-1">
            {opp.stage === 'BRIEF' && (
              <button onClick={() => setSelectedTab('brief')} className="w-full text-left bg-white/50 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5 text-gray-700 dark:text-slate-300 font-medium px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-2 transition">
                <Icons.Edit3 size={12} className="text-gray-400" /> Start / Update Brief
              </button>
            )}
            {opp.stage === 'ANALYSIS' && (
              <button onClick={() => setSelectedTab('analysis')} className="w-full text-left bg-white/50 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5 text-gray-700 dark:text-slate-300 font-medium px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-2 transition">
                <Icons.BarChart2 size={12} className="text-gray-400" /> Create Analysis
              </button>
            )}
            {(opp.stage === 'SOLUTION' || opp.stage === 'PROPOSAL' || opp.stage === 'NEGOTIATION') && (
              <button onClick={() => setSelectedTab('proposal')} className="w-full text-left bg-white/50 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5 text-gray-700 dark:text-slate-300 font-medium px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-2 transition">
                <Icons.FileText size={12} className="text-gray-400" /> Generate Proposal
              </button>
            )}
            <button onClick={() => setSelectedTab('overview')} className="w-full text-left bg-white/50 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 border border-gray-200/60 dark:border-white/5 text-gray-700 dark:text-slate-300 font-medium px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-2 transition">
              <Icons.CheckCircle size={12} className="text-gray-400" /> Mark as Won / Lost
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function JourneyCard({ opp }) {
  const { setSelectedTab } = useCrm()
  const journey = ['DISCOVERED', 'CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'BRIEF', 'ANALYSIS', 'SOLUTION', 'PROPOSAL', 'NEGOTIATION', 'WON']
  const curIdx = journey.indexOf(opp.stage)
  return (
    <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-900 dark:text-white text-xs">Journey</h3>
        <button onClick={() => setSelectedTab('journey')} className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition">See All</button>
      </div>
      <div className="relative pl-3.5 border-l-2 border-emerald-500/80 dark:border-emerald-600/60 space-y-2.5 text-[11px]">
        {journey.map((s, i) => {
          const done = curIdx >= 0 && i < curIdx
          const cur = s === opp.stage
          const future = i > curIdx
          const info = stageInfo(s)
          return (
            <div key={s} className={`relative ${future ? 'opacity-40' : ''}`}>
              <div className={`absolute -left-[19px] top-1 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#0e1513] ${
                cur ? 'bg-emerald-600' : done ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-slate-600'
              }`} />
              <div className="flex justify-between items-center">
                <span className={`font-bold ${cur ? 'text-emerald-900 dark:text-emerald-300' : done ? 'text-gray-800 dark:text-slate-200' : 'text-gray-600 dark:text-slate-400'}`}>
                  {info.label}
                </span>
                {cur && (
                  <span className="text-[8px] bg-emerald-200/80 dark:bg-emerald-900/50 text-emerald-950 dark:text-emerald-200 px-1.5 py-0.2 rounded-md font-bold border border-emerald-300/50 dark:border-emerald-700/50">Current</span>
                )}
              </div>
              {done && <span className="text-[9px] text-gray-400 dark:text-slate-500">{fmtDate(opp.contactDate)}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BriefTab({ opp }) {
  const { saveBrief, completeBrief } = useCrm()
  const [form, setForm] = useState(opp.brief || { goals: '', currentCondition: '', problems: [], requirements: '', references: '', budget: '', deadline: '', meetingDate: '', meetingTime: '', meetingMethod: '', notes: '', status: 'IN_PROGRESS' })
  const [problemText, setProblemText] = useState('')

  const save = () => saveBrief(opp.id, form)
  const complete = () => { saveBrief(opp.id, { ...form, status: 'COMPLETE' }); completeBrief(opp.id) }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Brief</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500">{opp.brief?.status === 'COMPLETE' ? 'Completed' : 'In progress'}</p>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${opp.brief?.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'}`}>{opp.brief?.status || 'IN_PROGRESS'}</span>
      </div>
      <div className="glass-card rounded-2xl p-3.5 shadow-2xs space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Goals"><textarea className="input min-h-[80px]" value={form.goals || ''} onChange={(e) => setForm({ ...form, goals: e.target.value })} placeholder="What do they want to achieve?" /></Field>
          <Field label="Current Condition"><textarea className="input min-h-[80px]" value={form.currentCondition || ''} onChange={(e) => setForm({ ...form, currentCondition: e.target.value })} placeholder="Existing website/system..." /></Field>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-slate-400 mb-1.5">Problems</label>
          <div className="flex gap-2 mb-2">
            <input className="input !text-xs" value={problemText} onChange={(e) => setProblemText(e.target.value)} placeholder="Add a problem..." />
            <button onClick={() => { if (problemText.trim()) { setForm({ ...form, problems: [...(form.problems || []), problemText] }); setProblemText('') } }} className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">Add</button>
          </div>
          <ul className="space-y-1">{(form.problems || []).map((p, i) => <li key={i} className="text-sm flex items-center gap-2 dark:text-slate-200"><span className="text-red-400">•</span>{p}<button onClick={() => setForm({ ...form, problems: form.problems.filter((_, j) => j !== i) })} className="text-ink-400 hover:text-red-500 ml-auto text-xs">✕</button></li>)}</ul>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Requirements"><textarea className="input min-h-[72px]" value={form.requirements || ''} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Functional + technical requirements" /></Field>
          <Field label="References"><textarea className="input min-h-[72px]" value={form.references || ''} onChange={(e) => setForm({ ...form, references: e.target.value })} placeholder="Websites, design references" /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Budget"><input className="input" value={form.budget || ''} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="Rp 4.000.000 – 6.000.000" /></Field>
          <Field label="Deadline"><input className="input" value={form.deadline || ''} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="Oktober 2026" /></Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Meeting Date"><input type="date" className="input" value={form.meetingDate || ''} onChange={(e) => setForm({ ...form, meetingDate: e.target.value })} /></Field>
          <Field label="Meeting Time"><input className="input" value={form.meetingTime || ''} onChange={(e) => setForm({ ...form, meetingTime: e.target.value })} placeholder="10:00" /></Field>
          <Field label="Meeting Method"><input className="input" value={form.meetingMethod || ''} onChange={(e) => setForm({ ...form, meetingMethod: e.target.value })} placeholder="Google Meet" /></Field>
        </div>
        <Field label="Meeting Notes"><textarea className="input min-h-[96px]" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Structured notes from the meeting..." /></Field>
        <div className="flex gap-2">
          <button onClick={save} className="btn-secondary flex-1">Save Draft</button>
          <button onClick={complete} className="btn-primary flex-1">Mark Brief Complete</button>
        </div>
      </div>
    </div>
  )
}

function AnalysisTab({ opp }) {
  const { saveAnalysis, sendForApproval, approveAnalysis, requestRevision, setStage: moveStage } = useCrm()
  const [form, setForm] = useState(opp.analysis || { problemsIdentified: [], solution: '', scope: [], deliverables: [], timeline: '', price: 0, paymentTerms: '', risks: '', preparedBy: 'U002' })
  const [scopeText, setScopeText] = useState('')
  const [delText, setDelText] = useState('')
  const [probText, setProbText] = useState('')
  const [revOpen, setRevOpen] = useState(false)
  const [revReason, setRevReason] = useState('')
  const status = form.status || 'DRAFT'

  const save = () => saveAnalysis(opp.id, { ...form, status })
  const sendApproval = () => { saveAnalysis(opp.id, { ...form, status: 'PENDING_APPROVAL' }); sendForApproval(opp.id) }
  const approve = () => { approveAnalysis(opp.id); moveStage(opp.id, 'SOLUTION') }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Analysis</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500">Prepared after brief completion</p>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' : status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200' : status === 'REVISION_REQUESTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200'}`}>{status.replace(/_/g, ' ')}</span>
      </div>
      <div className="glass-card rounded-2xl p-3.5 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-slate-400 mb-1.5">Problems Identified</label>
          <div className="flex gap-2 mb-2">
            <input className="input !text-xs" value={probText} onChange={(e) => setProbText(e.target.value)} placeholder="Add problem..." />
            <button onClick={() => { if (probText.trim()) { setForm({ ...form, problemsIdentified: [...(form.problemsIdentified || []), probText] }); setProbText('') } }} className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">Add</button>
          </div>
          <ul className="space-y-1">{(form.problemsIdentified || []).map((p, i) => <li key={i} className="text-sm flex items-center gap-2 dark:text-slate-200"><span className="text-red-400">•</span>{p}<button onClick={() => setForm({ ...form, problemsIdentified: form.problemsIdentified.filter((_, j) => j !== i) })} className="text-ink-400 hover:text-red-500 ml-auto text-xs">✕</button></li>)}</ul>
        </div>
        <Field label="Recommended Solution"><textarea className="input min-h-[80px]" value={form.solution || ''} onChange={(e) => setForm({ ...form, solution: e.target.value })} placeholder="Solution approach..." /></Field>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-slate-400 mb-1.5">Scope of Work</label>
          <div className="flex gap-2 mb-2">
            <input className="input !text-xs" value={scopeText} onChange={(e) => setScopeText(e.target.value)} placeholder="Add scope item..." />
            <button onClick={() => { if (scopeText.trim()) { setForm({ ...form, scope: [...(form.scope || []), scopeText] }); setScopeText('') } }} className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">Add</button>
          </div>
          <ul className="space-y-1">{(form.scope || []).map((p, i) => <li key={i} className="text-sm flex items-center gap-2 dark:text-slate-200">{I('Check', 14)}{p}<button onClick={() => setForm({ ...form, scope: form.scope.filter((_, j) => j !== i) })} className="text-ink-400 hover:text-red-500 ml-auto text-xs">✕</button></li>)}</ul>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-slate-400 mb-1.5">Deliverables</label>
          <div className="flex gap-2 mb-2">
            <input className="input !text-xs" value={delText} onChange={(e) => setDelText(e.target.value)} placeholder="Add deliverable..." />
            <button onClick={() => { if (delText.trim()) { setForm({ ...form, deliverables: [...(form.deliverables || []), delText] }); setDelText('') } }} className="btn-secondary !py-1.5 !px-3 !text-xs shrink-0">Add</button>
          </div>
          <ul className="space-y-1">{(form.deliverables || []).map((p, i) => <li key={i} className="text-sm flex items-center gap-2 dark:text-slate-200">{I('Package', 14)}{p}<button onClick={() => setForm({ ...form, deliverables: form.deliverables.filter((_, j) => j !== i) })} className="text-ink-400 hover:text-red-500 ml-auto text-xs">✕</button></li>)}</ul>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Timeline"><input className="input" value={form.timeline || ''} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="6–8 weeks" /></Field>
          <Field label="Estimated Price"><input type="number" className="input" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="8000000" /></Field>
          <Field label="Payment Terms"><input className="input" value={form.paymentTerms || ''} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="DP 50%..." /></Field>
        </div>
        <Field label="Risks / Assumptions"><textarea className="input min-h-[72px]" value={form.risks || ''} onChange={(e) => setForm({ ...form, risks: e.target.value })} placeholder="Risks, assumptions..." /></Field>
        <div className="flex gap-2">
          <button onClick={save} className="btn-secondary flex-1">Save Draft</button>
          {status === 'DRAFT' && <button onClick={sendApproval} className="btn-primary flex-1">Send for Approval</button>}
          {status === 'PENDING_APPROVAL' && (<>
            <button onClick={() => setRevOpen(true)} className="btn-secondary flex-1 !text-red-600 dark:!text-red-400">Request Revision</button>
            <button onClick={approve} className="btn-primary flex-1">Approve</button>
          </>)}
          {status === 'REVISION_REQUESTED' && <button onClick={sendApproval} className="btn-primary flex-1">Resubmit</button>}
        </div>
      </div>
      <ActionModal open={revOpen} onClose={() => setRevOpen(false)} title="Request revision">
        <Field label="Reason"><textarea className="input min-h-[80px]" value={revReason} onChange={(e) => setRevReason(e.target.value)} placeholder="What needs to change?" /></Field>
        <button onClick={() => { requestRevision(opp.id, revReason); setRevOpen(false); setRevReason('') }} className="btn-primary w-full mt-3">Send back</button>
      </ActionModal>
    </div>
  )
}

function ProposalTab({ opp }) {
  const { generateProposal, updateProposalStatus } = useCrm()
  const [genOpen, setGenOpen] = useState(false)
  const [genForm, setGenForm] = useState({ title: '', amount: '' })
  const approved = opp.analysis?.status === 'APPROVED'

  const handleGenerate = () => {
    generateProposal(opp.id, {
      title: genForm.title || `${opp.business} — Proposal`,
      amount: Number(genForm.amount) || opp.estimatedValue || 0,
      service: opp.service || 'Website Development',
      template: 'standard',
      validUntil: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
    })
    setGenOpen(false)
    setGenForm({ title: '', amount: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Proposal</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500">{(opp.proposals || []).length} version{(opp.proposals || []).length !== 1 ? 's' : ''}</p>
        </div>
        <button disabled={!approved} onClick={() => setGenOpen(true)} className={`btn-shiny-emerald text-white px-3 py-1.5 rounded-xl text-xs font-medium ${!approved ? 'opacity-50 cursor-not-allowed' : ''}`}>Generate Proposal</button>
      </div>
      {!approved && <div className="glass-card rounded-2xl p-3.5 shadow-2xs text-sm text-gray-400 dark:text-slate-500">{opp.analysis ? `Analysis status: ${opp.analysis.status}. Approved analysis required.` : 'No analysis yet.'}</div>}
      {(opp.proposals || []).map((p) => (
        <div key={p.id} className="glass-card rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold dark:text-white">{p.title || `Proposal #${p.version}`}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Version {p.version} · Created {fmtDate(p.createdAt)}</p>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : p.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200'}`}>{p.status}</span>
          </div>
          <p className="text-lg font-extrabold dark:text-white mt-1">{IDR(p.amount)}</p>
          {p.sentAt && <p className="text-xs text-gray-400 dark:text-slate-500">Sent {fmtDate(p.sentAt)} · Valid until {fmtDate(p.validUntil)}</p>}
          <div className="flex gap-2 mt-3">
            {['SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED'].filter((s) => s !== p.status).slice(0, 3).map((s) => (
              <button key={s} onClick={() => updateProposalStatus(opp.id, p.id, s)} className="btn-secondary !py-1 !px-2.5 !text-[11px]">{s}</button>
            ))}
          </div>
        </div>
      ))}
      <ActionModal open={genOpen} onClose={() => setGenOpen(false)} title="Generate proposal">
        <div className="space-y-3">
          <Field label="Title"><input className="input" value={genForm.title} onChange={(e) => setGenForm({ ...genForm, title: e.target.value })} placeholder={`${opp.business} — Proposal`} /></Field>
          <Field label="Amount (Rp)"><input type="number" className="input" value={genForm.amount} onChange={(e) => setGenForm({ ...genForm, amount: e.target.value })} placeholder={String(opp.estimatedValue || '')} /></Field>
          <button onClick={handleGenerate} className="btn-shiny-emerald w-full text-white font-medium py-2 rounded-xl text-xs">Generate & open editor</button>
        </div>
      </ActionModal>
    </div>
  )
}

function CommunicationTab({ opp }) {
  const { addActivity } = useCrm()
  const [actForm, setActForm] = useState({ title: '', detail: '', type: 'CONTACT', channel: 'WhatsApp' })
  const sorted = (opp.activities || []).slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 dark:text-white">Communication History</h3>
      <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Field label="Type">
            <select className="input !text-xs" value={actForm.type} onChange={(e) => setActForm({ ...actForm, type: e.target.value })}>
              {['CONTACT', 'RESPONSE', 'MEETING', 'NOTE', 'PROPOSAL'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Channel">
            <select className="input !text-xs" value={actForm.channel} onChange={(e) => setActForm({ ...actForm, channel: e.target.value })}>
              {['WhatsApp', 'Instagram', 'Email', 'Phone', 'Meeting'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="flex items-end gap-2">
            <button onClick={() => { if (actForm.title.trim()) { addActivity(opp.id, { ...actForm }); setActForm({ ...actForm, title: '', detail: '' }) } }} className="btn-shiny-emerald text-white w-full py-2.5 rounded-xl text-xs font-medium">Add</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="input !text-xs" value={actForm.title} onChange={(e) => setActForm({ ...actForm, title: e.target.value })} placeholder="Activity title..." />
          <input className="input !text-xs" value={actForm.detail} onChange={(e) => setActForm({ ...actForm, detail: e.target.value })} placeholder="Detail..." />
        </div>
      </div>
      <div className="space-y-0">
        {sorted.map((a) => (
          <div key={a.id} className="flex gap-3 py-2.5 border-b border-gray-100/80 dark:border-white/5 last:border-0">
            <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0 text-gray-400 dark:text-slate-500">{I(ACTIVITY_ICONS[a.type] || 'Activity', 15)}</span>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 dark:text-slate-500">{fmtDate(a.at)}{a.channel ? ` · ${a.channel}` : ''}</p>
              <p className="text-sm font-semibold dark:text-white">{a.title}</p>
              {a.detail && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{a.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotesTab({ opp }) {
  const { addNote, updateNote, deleteNote } = useCrm()
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState('')

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 dark:text-white">Notes</h3>
      <div className="glass-card rounded-2xl p-3.5 shadow-2xs">
        <div className="flex gap-2">
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a note..." />
          <button onClick={() => { if (text.trim()) { addNote(opp.id, { text }); setText('') } }} className="btn-shiny-emerald text-white px-4 shrink-0 rounded-xl text-xs font-medium">Add</button>
        </div>
      </div>
      <div className="space-y-2">
        {(opp.notes || []).slice().sort((a, b) => String(b.at || '').localeCompare(String(a.at || ''))).map((n) => (
          <div key={n.id} className="glass-card rounded-2xl p-3.5 shadow-2xs">
            {editing === n.id ? (
              <div className="space-y-2">
                <textarea className="input min-h-[72px]" value={editText} onChange={(e) => setEditText(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={() => { updateNote(opp.id, n.id, editText); setEditing(null) }} className="btn-primary !py-1.5 !text-xs flex-1">Save</button>
                  <button onClick={() => setEditing(null)} className="btn-secondary !py-1.5 !text-xs flex-1">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm dark:text-slate-200">{n.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 flex-1">{fmtDate(n.at)}</p>
                  <button onClick={() => { setEditing(n.id); setEditText(n.text) }} className="text-[11px] text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">Edit</button>
                  <button onClick={() => deleteNote(opp.id, n.id)} className="text-[11px] text-gray-400 hover:text-red-500">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function OpportunityDetail({ users }) {
  const { selected: opp, selectedTab, setSelectedTab } = useCrm()

  if (!opp) return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-xs">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-100 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <Icons.MousePointerClick size={32} />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-sm">Select an opportunity</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 leading-relaxed">Choose from the list to see details and manage your pipeline</p>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-3">
        <HeroHeader opp={opp} />

        {selectedTab === 'overview' && <OverviewTab opp={opp} users={users} />}
        {selectedTab === 'journey' && <JourneyCard opp={opp} />}
        {selectedTab === 'brief' && <BriefTab opp={opp} />}
        {selectedTab === 'analysis' && <AnalysisTab opp={opp} />}
        {selectedTab === 'proposal' && <ProposalTab opp={opp} />}
        {selectedTab === 'communication' && <CommunicationTab opp={opp} />}
        {selectedTab === 'notes' && <NotesTab opp={opp} />}
        {selectedTab === 'files' && (
          <div className="glass-card rounded-2xl p-3.5 shadow-2xs text-center py-8">
            <Icons.Paperclip size={32} className="mx-auto mb-2 text-gray-300 dark:text-slate-600" />
            <p className="text-sm text-gray-400 dark:text-slate-500">File management coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
