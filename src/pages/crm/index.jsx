import React, { useEffect, useState } from 'react'
import { CrmProvider, useCrm } from '../../lib/crmStore'
import OpportunityList from '../../components/crm/OpportunityList'
import OpportunityDetail from '../../components/crm/OpportunityDetail'
import ProspectList from '../../components/crm/ProspectList'
import ProspectDetail from '../../components/crm/ProspectDetail'
import ClientList from '../../components/crm/ClientList'
import ClientDetail from '../../components/crm/ClientDetail'
import * as Icons from 'lucide-react'

const USERS = [
  { id: 'U001', name: 'Admin', role: 'ADMIN' },
  { id: 'U002', name: 'Djibril', role: 'PM' },
  { id: 'U003', name: 'Ignas', role: 'STAFF' },
  { id: 'U006', name: 'Dian', role: 'STAFF' }
]

function CrmApp() {
  const { view, selectedId, theme, setTheme, sidebarCollapsed, setSidebarCollapsed, data, counts, switchView } = useCrm()
  const [mobileView, setMobileView] = useState('list')
  const [showUser, setShowUser] = useState(false)

  useEffect(() => { if (selectedId) setMobileView('detail') }, [selectedId])

  const NAV_ITEMS = [
    { label: 'Prospects', icon: 'Radar', count: counts.prospects, view: 'prospects' },
    { label: 'Opportunities', icon: 'Briefcase', count: counts.total, view: 'opportunities', active: view === 'opportunities' },
    { label: 'Clients', icon: 'UserCheck', count: counts.clients, view: 'clients' }
  ]

  const isDetail = !!selectedId
  const showList = mobileView === 'list' || !isDetail
  const showDetail = mobileView === 'detail' || isDetail

  const renderContent = () => {
    switch (view) {
      case 'prospects':
        return (
          <>
            <div className={`${mobileView === 'detail' && selectedId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 shrink-0`}>
              <ProspectList />
            </div>
            <div className={`${mobileView === 'list' || !selectedId ? 'hidden lg:flex' : 'flex'} flex-1 min-w-0`}>
              <ProspectDetail />
            </div>
          </>
        )
      case 'clients':
        return (
          <>
            <div className={`${mobileView === 'detail' && selectedId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 shrink-0`}>
              <ClientList />
            </div>
            <div className={`${mobileView === 'list' || !selectedId ? 'hidden lg:flex' : 'flex'} flex-1 min-w-0`}>
              <ClientDetail />
            </div>
          </>
        )
      default:
        return (
          <>
            <div className={`${mobileView === 'detail' && selectedId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-80 shrink-0`}>
              <OpportunityList />
            </div>
            <div className={`${mobileView === 'list' || !selectedId ? 'hidden lg:flex' : 'flex'} flex-1 min-w-0`}>
              <OpportunityDetail users={USERS} />
            </div>
          </>
        )
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[#f3f4f6] dark:bg-[#0b1210] text-xs antialiased">
      {/* Sidebar */}
      <aside className="w-56 bg-white/80 dark:bg-[#0e1513]/80 backdrop-blur-md border-r border-gray-200/60 dark:border-white/5 flex flex-col justify-between p-4 shrink-0 overflow-y-auto z-20">
        <div>
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="btn-shiny-emerald text-white p-1.5 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm">
              <Icons.Triangle size={16} className="fill-current" />
            </div>
            <span className="font-bold text-base tracking-tight text-gray-900 dark:text-white">Dignify</span>
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item, i) => {
              if (item.section) return <div key={i} className="pt-4 pb-1 px-3 text-[10px] font-semibold text-gray-400 dark:text-slate-500 tracking-wider">{item.section}</div>
              const C = Icons[item.icon] || Icons.Circle
              const isActive = view === item.view
              return (
                <button key={item.label} onClick={() => { switchView(item.view); setMobileView('list') }} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium ${isActive ? 'nav-crm-active text-emerald-950 dark:text-emerald-200' : 'nav-crm text-gray-600 dark:text-slate-400'}`}>
                  <div className="flex items-center gap-3">
                    <C size={16} className={isActive ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    isActive ? <span className="badge-shiny-emerald text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-xs">{item.count}</span>
                    : <span className="text-gray-400 dark:text-slate-500 text-[11px]">{item.count}</span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 mt-4 relative overflow-hidden shadow-md border border-emerald-700/50">
          <h4 className="font-semibold text-xs leading-snug mb-3">Build<br/>Meaningful<br/>Digital Presence.</h4>
          <div className="pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[10px] text-emerald-200">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-emerald-400 flex items-center justify-center font-bold text-[8px]">D</div>
              <span>Dignify OS v1.0</span>
            </div>
            <Icons.ArrowUpRight size={14} className="text-emerald-400" />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white/80 dark:bg-[#0e1513]/80 backdrop-blur-md border-b border-gray-200/60 dark:border-white/5 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="relative w-80">
            <Icons.Search size={16} className="absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" />
            <input type="text" placeholder="Search clients, businesses, or anything..." className="w-full bg-gray-100/80 dark:bg-white/5 pl-9 pr-12 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600/50 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition" />
            <span className="absolute right-2.5 top-2 text-[10px] text-gray-400 dark:text-slate-500 border border-gray-300/80 dark:border-white/10 rounded-md px-1.5 bg-white/80 dark:bg-white/5 shadow-2xs">Ctrl K</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-shiny-emerald text-white p-1.5 rounded-xl"><Icons.Plus size={16} /></button>
            <button className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition"><Icons.Bell size={16} /></button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition" title="Toggle theme">
              {theme === 'dark' ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200 dark:border-white/10 relative">
              <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-950 text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-emerald-600/20 dark:ring-emerald-500/30">R</div>
                <div className="text-left leading-tight">
                  <div className="font-bold text-gray-800 dark:text-white">Reza</div>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500">Business Team</div>
                </div>
              </button>
              {showUser && (
                <div className="absolute right-0 top-12 bg-white dark:bg-[#111a17] border border-gray-200 dark:border-white/10 rounded-xl p-2 w-44 z-50 shadow-lg">
                  <button onClick={() => { setShowUser(false); setTheme(theme === 'dark' ? 'light' : 'dark') }} className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 dark:text-slate-200">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
                  <button className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 dark:text-slate-200">Settings</button>
                  <button onClick={() => { localStorage.removeItem('dignify-crm-v1'); window.location.reload() }} className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600">Reset Demo Data</button>
                  <button className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 font-semibold">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden p-3 gap-3">
          <section className={`bg-white/70 dark:bg-[#0e1513]/70 backdrop-blur-md rounded-2xl border border-white/80 dark:border-white/5 shadow-sm flex overflow-hidden ${view === 'activities' ? 'flex-1' : 'flex-row'}`}>
            {renderContent()}
          </section>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/90 dark:bg-[#0e1513]/90 backdrop-blur-md border-t border-gray-200/60 dark:border-white/5 flex items-center justify-around px-2 py-1.5 z-30">
        {[
          { icon: 'Radar', label: 'Prospects', v: 'prospects' },
          { icon: 'Briefcase', label: 'Opps', v: 'opportunities' },
          { icon: 'UserCheck', label: 'Clients', v: 'clients' }
        ].map((b) => (
          <button key={b.v} onClick={() => { switchView(b.v); setMobileView('list') }} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl ${view === b.v ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
            {React.createElement(Icons[b.icon] || Icons.Circle, { size: 18 })}
            <span className="text-[9px] font-medium">{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CrmPage() {
  return <CrmProvider><CrmApp /></CrmProvider>
}
