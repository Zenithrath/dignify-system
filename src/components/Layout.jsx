import React, { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { useStore } from '../lib/store'
import { NAV } from '../lib/permissions'
import { Avatar } from './ui'

const icon = (name, size = 18) => {
  const C = Icons[name] || Icons.Circle
  return <C size={size} />
}

function Topbar({ onMenu }) {
  const { me, db, logout, theme, toggleTheme } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const myNotif = (db.notifications || []).filter((n) => !me || n.to === me.id)
  const unread = myNotif.filter((n) => !n.read).length

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const out = []
    ;(db.prospects || []).filter((p) => (`${p.business} ${p.city} ${p.id}`).toLowerCase().includes(s)).slice(0, 2).forEach((p) => out.push({ kind: 'Prospect', label: p.business, sub: `${p.id} · ${p.status}`, to: '/prospecting' }))
    db.leads.filter((l) => (`${l.business} ${l.city} ${l.id}`).toLowerCase().includes(s)).slice(0, 3).forEach((l) => out.push({ kind: 'Lead', label: l.business, sub: `${l.id} · ${l.stage}`, to: `/leads/${l.id}` }))
    db.clients.filter((c) => (`${c.company} ${c.id}`).toLowerCase().includes(s)).slice(0, 2).forEach((c) => out.push({ kind: 'Client', label: c.company, sub: c.id, to: '/clients' }))
    db.projects.filter((p) => (`${p.name} ${p.id}`).toLowerCase().includes(s)).slice(0, 2).forEach((p) => out.push({ kind: 'Project', label: p.name, sub: `${p.id} · ${p.status}`, to: '/projects' }))
    return out.slice(0, 9)
  }, [q, db])

  return (
    <header className="sticky top-0 z-30 surface-top backdrop-blur border-b">
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 h-16">
        <button className="lg:hidden btn-secondary !px-2.5" onClick={onMenu} aria-label="Menu"><Icons.Menu size={18} /></button>
        <div className="hidden md:block relative w-72">
          <Icons.Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search prospects, leads, clients…" className="input !pl-9 !bg-ink-50 !border-transparent focus:!bg-white dark:!bg-white/5 dark:focus:!bg-white/10" />
          {results.length > 0 && (
            <div className="absolute top-12 left-0 right-0 card p-2 shadow-pop z-40">
              {results.map((r, i) => (
                <button key={i} onClick={() => { nav(r.to); setQ('') }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-ink-50 dark:hover:bg-white/5 flex items-center justify-between gap-2">
                  <span><span className="text-[10px] font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">{r.kind}</span><span className="block text-sm font-semibold dark:text-white">{r.label}</span></span>
                  <span className="text-xs muted">{r.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button onClick={toggleTheme} className="btn-secondary !px-2.5 !py-2" aria-label="Toggle theme" title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}>
          {theme === 'dark' ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
        </button>
        <button onClick={() => nav('/follow-ups')} className="hidden sm:inline-flex btn-secondary !py-2"><Icons.CalendarDays size={16} /> Today</button>
        <button onClick={() => nav('/activity')} className="relative btn-secondary !px-2.5 !py-2" aria-label="Notifications">
          <Icons.Bell size={18} />
          {unread > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{unread}</span>}
        </button>
        <div className="relative">
          <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl pl-1 pr-2 py-1 hover:bg-ink-50 dark:hover:bg-white/5">
            <Avatar name={me?.name} />
            <span className="hidden sm:block text-left"><span className="block text-sm font-bold leading-tight dark:text-white">{me?.name}</span><span className="block text-[11px] muted font-semibold">{me?.role} · {me?.title}</span></span>
            <Icons.ChevronDown size={15} className="text-ink-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-12 card p-2 w-52 z-40">
              <div className="px-3 py-2 text-xs muted">{me?.email}</div>
              <button onClick={() => { setOpen(false); toggleTheme() }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-ink-50 dark:hover:bg-white/5 dark:text-slate-200">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
              <button onClick={() => { setOpen(false); nav('/settings') }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-ink-50 dark:hover:bg-white/5 dark:text-slate-200">Settings</button>
              <button onClick={() => { logout(); nav('/login') }} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 font-semibold">Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function Layout() {
  const { me } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const nav = NAV[me?.role || 'STAFF'] || NAV.STAFF

  const sidebar = (
    <div className="h-full flex flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <span className="w-9 h-9 rounded-2xl bg-brand-700 text-white flex items-center justify-center font-display font-extrabold">D</span>
        <span><span className="block font-display font-extrabold tracking-tight leading-none dark:text-white">DIGNIFY OS</span><span className="block text-[11px] muted font-semibold">Business Operating System</span></span>
      </Link>
      <nav className="flex-1 overflow-auto px-3 pb-4 space-y-0.5">
        {nav.map((n, i) => n.section
          ? <p key={i} className="px-3 pt-4 pb-1.5 text-[10px] font-bold tracking-[.12em] text-ink-400 dark:text-slate-500">{n.section}</p>
          : <NavLink key={n.to + n.label} to={n.to} end={n.to === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `navlink ${isActive ? 'navlink-active' : ''}`}>{icon(n.icon)} {n.label}</NavLink>)}
      </nav>
      <div className="p-3">
        <div className="rounded-2xl bg-brand-800 text-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-200">Next best action</p>
          <p className="text-sm font-semibold mt-0.5">Start today's work</p>
          <Link to="/follow-ups" className="mt-2 inline-flex text-xs font-bold bg-white/15 hover:bg-white/25 rounded-lg px-2.5 py-1.5">Open follow-ups →</Link>
        </div>
      </div>
    </div>
  )

  const bottomItems = (NAV[me?.role || 'STAFF'].filter((n) => !n.section)).slice(0, 5)

  return (
    <div className="min-h-full lg:flex dark:bg-[#0b1210]">
      <aside className="hidden lg:block w-60 shrink-0 sticky top-0 h-screen bg-white dark:bg-[#0e1513] border-r border-ink-200/70 dark:border-white/10">{sidebar}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0e1513] shadow-pop">{sidebar}</div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Topbar onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-3 sm:px-6 py-4 sm:py-6 max-w-[1200px] w-full mx-auto pb-safe"><Outlet /></main>
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-[#0e1513] border-t border-ink-200/70 dark:border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${bottomItems.length},1fr)` }}>
            {bottomItems.map((n) => (
              <NavLink key={n.to + n.label} to={n.to} end={n.to === '/'} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-ink-400 dark:text-slate-500'}`}>{icon(n.icon, 20)}{n.label.split(' ')[0]}</NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
