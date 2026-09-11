import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import * as Icons from 'lucide-react'
import { useStore } from '../lib/store'
import { Avatar, Badge, Card, Progress } from '../components/ui'
import { IDR, fmtDate, todayISO } from '../lib/format'

const Kpi = ({ icon, label, value, sub, tone = 'bg-brand-50 text-brand-700' }) => {
  const I = Icons[icon] || Icons.Activity
  return (
    <Card className="card-pad">
      <div className="flex items-start justify-between">
        <div><p className="kpi-label">{label}</p><p className="font-display text-2xl font-extrabold mt-1 tracking-tight">{value}</p>{sub && <p className="text-xs text-ink-500 mt-0.5">{sub}</p>}</div>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${tone}`}><I size={19} /></span>
      </div>
    </Card>
  )
}

function TaskRow({ t, users }) {
  const u = users.find((x) => x.id === t.assignee)
  return (
    <Link to="/tasks" className="flex items-center gap-3 px-1 py-2.5 border-b border-ink-100 last:border-0 hover:bg-ink-50/60 rounded-lg">
      <Avatar name={u?.name} size="w-8 h-8 text-[11px]" />
      <span className="flex-1 min-w-0"><span className="block text-sm font-semibold truncate">{t.title}</span><span className="block text-xs text-ink-500">{t.id} · due {fmtDate(t.deadline)}</span></span>
      <Badge value={t.status} />
    </Link>
  )
}

export default function Dashboard() {
  const { db, me, runAutomation } = useStore()
  const T = todayISO()
  const users = db.users

  const m = useMemo(() => {
    const activeProjects = db.projects.filter((p) => !['COMPLETED', 'CANCELLED'].includes(p.status))
    const myTasks = db.tasks.filter((t) => t.assignee === me?.id && t.status !== 'DONE')
    const myOverdue = myTasks.filter((t) => t.deadline && t.deadline < T)
    const overdueAll = db.tasks.filter((t) => t.status !== 'DONE' && t.deadline && t.deadline < T)
    const revenue = db.invoices.reduce((s, i) => s + Number(i.paid || 0), 0)
    const outstanding = db.invoices.reduce((s, i) => s + (Number(i.amount) - Number(i.paid || 0)), 0)
    const expenses = db.expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
    const maintDue = db.maintenance.filter((x) => !['COMPLETED', 'CANCELLED'].includes(x.status))
    const won = db.leads.filter((l) => l.stage === 'WON').length
    const conv = db.leads.length ? Math.round((won / db.leads.length) * 100) : 0
    return { activeProjects, myTasks, myOverdue, overdueAll, revenue, outstanding, expenses, maintDue, won, conv }
  }, [db, me, T])

  const funnel = useMemo(() => {
    const stages = ['NEW', 'QUALIFIED', 'CONTACTED', 'RESPONDED', 'MEETING', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON']
    return stages.map((s) => ({ stage: s.replace('_', ' '), count: db.leads.filter((l) => l.stage === s).length }))
  }, [db])

  if (me?.role === 'STAFF') {
    const mine = db.tasks.filter((t) => t.assignee === me.id)
    const today = mine.filter((t) => t.deadline === T && t.status !== 'DONE')
    const upcoming = mine.filter((t) => t.deadline > T && t.status !== 'DONE').slice(0, 5)
    const over = mine.filter((t) => t.deadline && t.deadline < T && t.status !== 'DONE')
    const done = mine.filter((t) => t.status === 'DONE').slice(0, 4)
    const myProjects = db.projects.filter((p) => mine.some((t) => t.projectId === p.id)).slice(0, 4)
    return (
      <div className="space-y-4 anim-fadeUp">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Halo, {me.name.split(' ')[0]} 👋</h1><p className="text-sm text-ink-500">What do you need to do today?</p></div>
          <Link to="/tasks" className="btn-primary">Open My Tasks</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon="Sun" label="Due today" value={today.length} sub="stay focused" />
          <Kpi icon="AlertTriangle" label="Overdue" value={over.length} sub={over.length ? 'clear these first' : "you're clear"} tone="bg-red-50 text-red-600" />
          <Kpi icon="CalendarDays" label="Upcoming" value={upcoming.length} sub="next deadlines" tone="bg-blue-50 text-blue-700" />
          <Kpi icon="CheckCircle2" label="Completed" value={mine.filter((t) => t.status === 'DONE').length} sub="all time" />
        </div>
        <div className="grid lg:grid-cols-5 gap-4">
          <Card className="card-pad lg:col-span-3">
            <div className="flex items-center justify-between mb-2"><h3 className="section-title">Today's tasks</h3><Link to="/tasks" className="text-xs font-bold text-brand-700">View all →</Link></div>
            {today.length === 0 && over.length === 0 ? <p className="text-sm text-ink-500 py-6 text-center font-semibold">You're all caught up. 🎉</p> : [...over, ...today].map((t) => <TaskRow key={t.id} t={t} users={users} />)}
          </Card>
          <Card className="card-pad lg:col-span-2">
            <h3 className="section-title mb-2">My projects</h3>
            {myProjects.length === 0 ? <p className="text-sm text-ink-500">No assigned projects yet.</p> : myProjects.map((p) => (
              <Link key={p.id} to="/projects" className="block py-2.5 border-b border-ink-100 last:border-0">
                <div className="flex items-center justify-between text-sm"><span className="font-semibold truncate">{p.name}</span><span className="text-xs font-bold text-brand-700">{p.progress}%</span></div>
                <Progress value={p.progress} />
              </Link>
            ))}
            <h3 className="section-title mt-4 mb-2">Recently completed</h3>
            {done.length === 0 ? <p className="text-xs text-ink-500">Nothing completed yet.</p> : done.map((t) => <TaskRow key={t.id} t={t} users={users} />)}
          </Card>
        </div>
      </div>
    )
  }

  const isAdmin = me?.role === 'ADMIN'
  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">{isAdmin ? 'Business overview' : 'Operations overview'}</h1><p className="text-sm text-ink-500">{isAdmin ? 'How is the entire business performing?' : 'How are all projects and team members progressing?'}</p></div>
        <div className="flex gap-2"><button onClick={runAutomation} className="btn-secondary"><Icons.Sparkles size={15} /> Run automation</button><Link to="/projects" className="btn-primary">+ New project</Link></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi icon="Magnet" label="Total leads" value={db.leads.length} sub={`${m.conv}% won rate`} />
        <Kpi icon="KanbanSquare" label="Active projects" value={m.activeProjects.length} sub={`${db.projects.filter((p) => p.status === 'COMPLETED').length} completed`} />
        <Kpi icon="Wallet" label={isAdmin ? 'Revenue collected' : 'Outstanding'} value={IDR(isAdmin ? m.revenue : m.outstanding)} sub={isAdmin ? `${IDR(m.outstanding)} outstanding` : `${db.invoices.filter((i) => i.status !== 'PAID').length} open invoices`} />
        <Kpi icon="Wrench" label="Maintenance open" value={m.maintDue.length} sub={`${m.maintDue.filter((x) => x.status === 'OVERDUE').length} overdue`} tone="bg-amber-50 text-amber-700" />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="card-pad lg:col-span-3">
          <div className="flex items-center justify-between"><h3 className="section-title">Sales funnel</h3><Link to="/leads" className="text-xs font-bold text-brand-700">Pipeline →</Link></div>
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} interval={0} angle={-18} dy={8} height={52} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#059669" radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="card-pad lg:col-span-2">
          <div className="flex items-center justify-between"><h3 className="section-title">Task overview</h3><Link to="/tasks" className="text-xs font-bold text-brand-700">All tasks →</Link></div>
          <div className="mt-2 max-h-60 overflow-auto">{db.tasks.filter((t) => t.status !== 'DONE').slice(0, 7).map((t) => <TaskRow key={t.id} t={t} users={users} />)}</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="card-pad lg:col-span-3">
          <div className="flex items-center justify-between mb-2"><h3 className="section-title">Project progress</h3><Link to="/projects" className="text-xs font-bold text-brand-700">Monitor →</Link></div>
          <div className="space-y-3">
            {db.projects.slice(0, 5).map((p) => (
              <div key={p.id}>
                <div className="flex items-center justify-between text-sm mb-1"><span className="font-semibold truncate pr-2">{p.name}</span><span className="flex items-center gap-2 shrink-0"><Badge value={p.status} /><span className="text-xs font-bold">{p.progress}%</span></span></div>
                <Progress value={p.progress} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="card-pad lg:col-span-2">
          <h3 className="section-title mb-2">Needs attention</h3>
          <div className="space-y-2 text-sm">
            {m.overdueAll.slice(0, 3).map((t) => <div key={t.id} className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 font-semibold text-red-800">⏰ {t.title} <span className="font-normal">· {t.deadline}</span></div>)}
            {m.maintDue.filter((x) => x.status === 'OVERDUE').slice(0, 2).map((x) => <div key={x.id} className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 font-semibold text-amber-800">🔧 {x.service} overdue <span className="font-normal">· {x.nextDue}</span></div>)}
            {db.invoices.filter((i) => i.status !== 'PAID').slice(0, 2).map((i) => <div key={i.id} className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 font-semibold text-blue-800">💰 {i.no} — {IDR(Number(i.amount) - Number(i.paid))} <span className="font-normal">due {i.due}</span></div>)}
            {m.overdueAll.length === 0 && <p className="text-ink-500 text-sm">All clear — nothing overdue. 🎉</p>}
          </div>
          <h3 className="section-title mt-4 mb-2">Recent activity</h3>
          <div className="space-y-2">{db.activity.slice(0, 4).map((a) => <p key={a.id} className="text-xs text-ink-500"><span className="font-bold text-ink-700">{users.find((u) => u.id === a.by)?.name || 'System'}</span> {a.text}</p>)}</div>
        </Card>
      </div>

      {isAdmin && (
        <Card className="card-pad">
          <div className="flex items-center justify-between"><h3 className="section-title">Cash snapshot</h3><Link to="/finance" className="text-xs font-bold text-brand-700">Finance →</Link></div>
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[{ n: 'Paid', v: m.revenue }, { n: 'Outstanding', v: m.outstanding }, { n: 'Expenses', v: m.expenses }]}>
                <XAxis dataKey="n" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1e6)}jt`} /><Tooltip formatter={(v) => IDR(v)} />
                <Area dataKey="v" fill="#a7f3d0" stroke="#059669" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  )
}
