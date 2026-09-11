import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { seedDB } from './seed'
import { can } from './permissions'
import { addDays, nowISO, todayISO, uid } from './format'

const LS_KEY = 'dignify-os-v1'
const SESSION_KEY = 'dignify-os-session'
const THEME_KEY = 'dignify-os-theme'

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

// Demo credentials: admin@dignify.id / pm@dignify.id / ignas@dignify.id — password: dignify123
const PASSWORD = 'dignify123'

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // migrate older saves: ensure workflow collections exist
      const fresh = seedDB()
      let dirty = false
      ;['prospects', 'followups', 'proposals'].forEach((k) => {
        if (!Array.isArray(parsed[k])) { parsed[k] = fresh[k]; dirty = true }
      })
      if (dirty) localStorage.setItem(LS_KEY, JSON.stringify(parsed))
      return parsed
    }
  } catch { /* ignore */ }
  const s = seedDB()
  localStorage.setItem(LS_KEY, JSON.stringify(s))
  return s
}

export function StoreProvider({ children }) {
  const [db, setDb] = useState(load)
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || '')
  const [toasts, setToasts] = useState([])
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || 'light' } catch { return 'light' }
  })

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(db)) }, [db])
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
      const root = document.documentElement
      if (theme === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
    } catch { /* ignore */ }
  }, [theme])
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const me = useMemo(() => db.users.find((u) => u.id === sessionId && u.active) || null, [db, sessionId])

  const toast = (msg, kind = 'ok') => {
    const id = uid('toast')
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }

  // ---------- backend-style guard: authenticate → authorize → validate → mutate → log ----------
  const guard = (perm) => {
    if (!me) return 'Not authenticated.'
    if (!can(me.role, perm)) return "You don't have permission to perform this action."
    return null
  }

  const log = (draft, text, entity = '') => {
    draft.activity.unshift({ id: uid('ACT'), at: nowISO(), by: me?.id || 'system', text, entity })
    draft.activity = draft.activity.slice(0, 300)
  }
  const notify = (draft, to, title, msg, type, entity = '') => {
    if (!to) return
    draft.notifications.unshift({ id: uid('NOTIF'), to, title, msg, type, entity, at: nowISO(), read: false })
    draft.notifications = draft.notifications.slice(0, 300)
  }

  const recalcProject = (draft, projectId) => {
    const tasks = draft.tasks.filter((t) => t.projectId === projectId && t.type === 'PROJECT')
    const p = draft.projects.find((x) => x.id === projectId)
    if (!p) return
    if (!tasks.length) return
    const done = tasks.filter((t) => t.status === 'DONE').length
    p.progress = Math.round((done / tasks.length) * 100)
    if (p.progress === 100 && !['COMPLETED', 'CANCELLED'].includes(p.status)) {
      // keep status, PM confirms delivery — but log milestone
    }
  }

  const update = (fn) => setDb((prev) => {
    const draft = JSON.parse(JSON.stringify(prev))
    fn(draft)
    return draft
  })

  // ---------- auth ----------
  const login = (email, password) => {
    const u = db.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase() && x.active)
    if (!u || password !== PASSWORD) return { error: 'Invalid email or password. Try a demo account below.' }
    localStorage.setItem(SESSION_KEY, u.id)
    setSessionId(u.id)
    return { ok: true, user: u }
  }
  const logout = () => { localStorage.removeItem(SESSION_KEY); setSessionId('') }

  // ---------- automation: daily checks + recurring generation + maintenance rollover ----------
  const runAutomation = () => {
    update((d) => {
      const T = todayISO()
      const weekday = new Date().getDay() // 0 sun
      // 1. generate recurring tasks due today (idempotent per rule+date)
      d.recurring.filter((r) => r.active && r.weekday === weekday).forEach((r) => {
        const exists = d.tasks.some((t) => t.autoRule === r.id && t.deadline === T)
        if (!exists) {
          const id = uid('T')
          d.tasks.unshift({ id, type: r.type, projectId: '', title: r.title, assignee: r.assignee, status: 'TODO', priority: 'MEDIUM', deadline: T, progress: 0, notes: `Auto-generated from ${r.name}.`, createdBy: 'system', createdAt: T, autoRule: r.id })
          log(d, `auto-generated routine task ${r.title}`, id)
          notify(d, r.assignee, 'Routine task generated', `${r.title} — due today.`, 'task', id)
        }
      })
      // 2. overdue + deadline-soon notifications (once per day per entity)
      const soonDays = d.settings?.notifRules?.deadlineSoonDays ?? 2
      d.tasks.filter((t) => !['DONE'].includes(t.status) && t.deadline).forEach((t) => {
        const diff = Math.round((new Date(t.deadline) - new Date(T)) / 86400000)
        const key = diff < 0 ? `overdue:${t.id}:${T}` : diff <= soonDays ? `soon:${t.id}:${T}` : null
        if (!key) return
        const already = d.activity.some((a) => a.text === key)
        if (already) return
        log(d, key, t.id)
        notify(d, t.assignee, diff < 0 ? 'Task overdue' : 'Deadline approaching', `${t.title} — ${diff < 0 ? `${-diff}d overdue` : `due in ${diff}d`}.`, 'overdue', t.id)
      })
      // 3. maintenance due/overdue
      const mSoon = d.settings?.notifRules?.maintenanceSoonDays ?? 5
      d.maintenance.forEach((m) => {
        if (['COMPLETED', 'CANCELLED'].includes(m.status)) return
        const diff = Math.round((new Date(m.nextDue) - new Date(T)) / 86400000)
        if (diff < 0 && m.status !== 'OVERDUE') { m.status = 'OVERDUE'; log(d, `maintenance ${m.id} marked OVERDUE`, m.id) }
        if (diff < 0 || diff <= mSoon) {
          const key = `maint:${m.id}:${T}`
          if (!d.activity.some((a) => a.text === key)) {
            log(d, key, m.id)
            notify(d, m.pic, diff < 0 ? 'Maintenance overdue' : 'Maintenance due soon', `${m.service} — ${diff < 0 ? `${-diff}d overdue` : `due in ${diff}d`}.`, 'maintenance', m.id)
          }
        }
      })
      // 4. payment overdue
      d.invoices.filter((i) => i.status !== 'PAID' && i.due < T).forEach((inv) => {
        const key = `pay:${inv.id}:${T}`
        if (d.activity.some((a) => a.text === key)) return
        log(d, key, inv.id)
        const admins = d.users.filter((u) => u.role === 'ADMIN').map((u) => u.id)
        admins.forEach((a) => notify(d, a, 'Payment overdue', `${inv.no} due ${inv.due}.`, 'finance', inv.id))
      })
    })
    toast('Automation checked: routines, deadlines, maintenance, payments.')
  }

  // ---------- mutations (all permission-checked) ----------
  const api = {
    // leads
    saveLead: (lead) => {
      const err = guard('leads.manage'); if (err) return { error: err }
      if (!lead.business?.trim()) return { error: 'Business name is required.' }
      update((d) => {
        if (lead.id && d.leads.some((l) => l.id === lead.id)) {
          Object.assign(d.leads.find((l) => l.id === lead.id), { ...lead, updatedAt: todayISO() })
          log(d, `updated lead ${lead.business}`, lead.id)
        } else {
          const id = `L${String(d.leads.length + 1).padStart(3, '0')}${Math.floor(Math.random() * 90 + 10)}`.slice(0, 4)
          const nid = lead.id || ('L' + String(Math.max(0, ...d.leads.map((l) => parseInt(l.id.slice(1)) || 0)) + 1).padStart(3, '0'))
          d.leads.unshift({ ...lead, id: nid, updatedAt: todayISO() })
          log(d, `added new lead ${lead.business}`, nid)
        }
      })
      return { ok: true }
    },
    setStage: (leadId, stage, note = '') => {
      const err = guard('leads.manage'); if (err) return { error: err }
      update((d) => {
        const l = d.leads.find((x) => x.id === leadId); if (!l) return
        l.stage = stage; l.updatedAt = todayISO()
        if (note) d.outreach.unshift({ id: uid('O'), leadId, date: todayISO(), channel: 'Status', result: stage, by: me.id, note })
        log(d, `moved lead ${l.business} → ${stage}`, leadId)
        if (stage === 'MEETING' || stage === 'PROPOSAL_SENT') notify(d, l.owner, 'Pipeline update', `${l.business} → ${stage}.`, 'sales', leadId)
      })
      return { ok: true }
    },
    addOutreach: (leadId, o) => {
      const err = guard('outreach.manage'); if (err) return { error: err }
      update((d) => {
        d.outreach.unshift({ id: uid('O'), leadId, date: o.date || todayISO(), channel: o.channel, result: o.result, by: me.id, note: o.note })
        log(d, `logged outreach on ${leadId} (${o.channel})`, leadId)
      })
      return { ok: true }
    },
    convertLead: (leadId) => {
      const err = guard('leads.convert'); if (err) return { error: err }
      let clientId = ''
      update((d) => {
        const l = d.leads.find((x) => x.id === leadId); if (!l || l.stage === 'WON' && d.clients.some((c) => c.leadId === leadId)) return
        l.stage = 'WON'; l.updatedAt = todayISO()
        clientId = 'C' + String(Math.max(0, ...d.clients.map((c) => parseInt(c.id.slice(1)) || 0)) + 1).padStart(3, '0')
        d.clients.unshift({ id: clientId, leadId, company: l.business, contact: '', phone: l.phone || '', email: '', industry: l.category || '', pic: l.owner || me.id, status: 'ACTIVE', notes: `Converted from ${leadId}. ${l.notes || ''}`.trim() })
        log(d, `converted lead ${l.business} → client ${clientId}`, clientId)
        notify(d, l.owner || me.id, 'Lead won', `${l.business} converted to ${clientId}.`, 'sales', clientId)
      })
      toast('Client converted successfully.')
      return { ok: true, clientId }
    },
    // clients
    saveClient: (c) => {
      const err = guard('clients.manage'); if (err) return { error: err }
      if (!c.company?.trim()) return { error: 'Company name is required.' }
      update((d) => {
        if (d.clients.some((x) => x.id === c.id)) Object.assign(d.clients.find((x) => x.id === c.id), c)
        else { const nid = c.id || 'C' + String(Math.max(0, ...d.clients.map((x) => parseInt(x.id.slice(1)) || 0)) + 1).padStart(3, '0'); d.clients.unshift({ ...c, id: nid }); log(d, `created client ${c.company}`, nid) }
      })
      return { ok: true }
    },
    // projects
    saveProject: (p) => {
      const err = guard('projects.manage'); if (err) return { error: err }
      if (!p.name?.trim()) return { error: 'Project name is required.' }
      update((d) => {
        if (d.projects.some((x) => x.id === p.id)) Object.assign(d.projects.find((x) => x.id === p.id), p)
        else { const nid = p.id || 'P' + String(Math.max(0, ...d.projects.map((x) => parseInt(x.id.slice(1)) || 0)) + 1).padStart(3, '0'); d.projects.unshift({ ...p, id: nid, progress: 0, milestones: p.milestones || [] }); log(d, `created project ${p.name}`, nid); notify(d, p.pm, 'New project', `${p.name} assigned to you.`, 'project', nid) }
      })
      return { ok: true }
    },
    // tasks
    saveTask: (t) => {
      const isOwnUpdate = t.id && me && db.tasks.find((x) => x.id === t.id)?.assignee === me.id
      const need = t.id && isOwnUpdate && !['assignee', 'title'].some((k) => t._reassign) ? 'tasks.update_own' : 'tasks.create'
      // staff creating new tasks is blocked; staff updating own status/progress/notes allowed
      if (need === 'tasks.create') { const err = guard('tasks.create'); if (err) return { error: err } }
      else { const err = guard('tasks.update_own'); if (err) return { error: err } }
      if (!t.title?.trim()) return { error: 'Task title is required.' }
      update((d) => {
        if (t.id && d.tasks.some((x) => x.id === t.id)) {
          const cur = d.tasks.find((x) => x.id === t.id)
          const prevAssignee = cur.assignee
          const { _reassign, ...rest } = t
          Object.assign(cur, rest)
          if (cur.status === 'DONE') cur.progress = 100
          if (cur.projectId) recalcProject(d, cur.projectId)
          log(d, `${me.name} updated task ${cur.title} → ${cur.status}`, cur.id)
          if (prevAssignee !== cur.assignee) notify(d, cur.assignee, 'New task assigned', `${cur.title} — due ${cur.deadline || '—'}.`, 'task', cur.id)
          if (cur.status === 'DONE') { const pm = d.projects.find((p) => p.id === cur.projectId)?.pm || d.users.find((u) => u.role === 'PM')?.id; if (pm) notify(d, pm, 'Task completed', `${me.name} completed ${cur.title}.`, 'task', cur.id) }
        } else {
          const nid = 'T' + String(Math.max(0, ...d.tasks.map((x) => parseInt(x.id.slice(1)) || 0)) + 1).padStart(3, '0')
          d.tasks.unshift({ ...t, id: nid, createdBy: me.id, createdAt: todayISO() })
          if (t.projectId) recalcProject(d, t.projectId)
          log(d, `${me.name} created task ${t.title}`, nid)
          notify(d, t.assignee, 'New task assigned', `${t.title} — due ${t.deadline || '—'}.`, 'task', nid)
        }
      })
      toast('Task saved.')
      return { ok: true }
    },
    quickStatus: (taskId, status) => {
      const t = db.tasks.find((x) => x.id === taskId)
      if (!t) return { error: 'Not found.' }
      if (me.role === 'STAFF' && t.assignee !== me.id) return { error: "You don't have permission to perform this action." }
      return api.saveTask({ ...t, status, progress: status === 'DONE' ? 100 : t.progress })
    },
    // content
    saveContent: (c) => {
      const err = guard('content.manage'); if (err) return { error: err }
      update((d) => {
        if (d.content.some((x) => x.id === c.id)) Object.assign(d.content.find((x) => x.id === c.id), c)
        else { const nid = uid('CT'); d.content.unshift({ ...c, id: nid }); log(d, `scheduled content ${c.title}`, nid) }
      })
      return { ok: true }
    },
    // maintenance (admin full control)
    saveMaintenance: (m) => {
      const err = guard('maintenance.manage'); if (err) return { error: err }
      update((d) => {
        if (d.maintenance.some((x) => x.id === m.id)) Object.assign(d.maintenance.find((x) => x.id === m.id), m)
        else { const nid = 'M' + String(Math.max(0, ...d.maintenance.map((x) => parseInt(x.id.slice(1)) || 0)) + 1).padStart(3, '0'); d.maintenance.unshift({ ...m, id: nid, history: [] }); log(d, `scheduled maintenance ${nid}`, nid) }
      })
      toast('Maintenance saved.')
      return { ok: true }
    },
    completeMaintenance: (id) => {
      if (!me || !can(me.role, 'maintenance.execute')) return { error: "You don't have permission to perform this action." }
      update((d) => {
        const m = d.maintenance.find((x) => x.id === id); if (!m) return
        m.history.unshift({ date: todayISO(), note: `Completed by ${me.name}.` })
        if (m.intervalDays > 0) {
          m.nextDue = addDays(todayISO(), m.intervalDays)
          m.status = 'SCHEDULED'
          // auto-generate next task
          const tid = 'T' + String(Math.max(0, ...d.tasks.map((x) => parseInt(x.id.slice(1)) || 0)) + 1).padStart(3, '0')
          d.tasks.unshift({ id: tid, type: 'MAINTENANCE', projectId: '', title: `${m.service} — next cycle`, assignee: m.pic, status: 'TODO', priority: 'MEDIUM', deadline: m.nextDue, progress: 0, notes: `Auto from ${id}.`, createdBy: 'system', createdAt: todayISO(), maintenanceId: id })
          notify(d, m.pic, 'Next maintenance scheduled', `${m.service} — due ${m.nextDue}.`, 'maintenance', id)
          log(d, `completed maintenance ${id}, next due ${m.nextDue}`, id)
        } else { m.status = 'COMPLETED'; log(d, `completed maintenance ${id}`, id) }
      })
      toast('Maintenance completed. Next cycle scheduled.')
      return { ok: true }
    },
    // finance
    saveInvoice: (inv) => {
      const err = guard('finance.manage'); if (err) return { error: err }
      update((d) => {
        if (d.invoices.some((x) => x.id === inv.id)) Object.assign(d.invoices.find((x) => x.id === inv.id), inv)
        else { const nid = uid('INV'); d.invoices.unshift({ ...inv, id: nid }); log(d, `created invoice ${inv.no}`, nid) }
      })
      return { ok: true }
    },
    recordPayment: (invoiceId, amount) => {
      const err = guard('finance.manage'); if (err) return { error: err }
      update((d) => {
        const inv = d.invoices.find((x) => x.id === invoiceId); if (!inv) return
        inv.paid = Math.min(inv.amount, (Number(inv.paid) || 0) + Number(amount))
        inv.status = inv.paid >= inv.amount ? 'PAID' : inv.paid > 0 ? 'PARTIAL' : inv.status
        log(d, `recorded payment ${inv.no} (${Number(amount).toLocaleString('id-ID')})`, inv.id)
        notify(d, inv.clientId ? d.clients.find((c) => c.id === inv.clientId)?.pic : '', 'Payment recorded', `${inv.no} — paid ${Number(inv.paid).toLocaleString('id-ID')}.`, 'finance', inv.id)
      })
      toast('Payment recorded.')
      return { ok: true }
    },
    saveExpense: (e) => {
      const err = guard('finance.manage'); if (err) return { error: err }
      update((d) => { d.expenses.unshift({ ...e, id: uid('E'), by: me.id }) })
      return { ok: true }
    },
    // team/users
    saveUser: (u) => {
      const err = guard('users.manage'); if (err) return { error: err }
      update((d) => {
        if (d.users.some((x) => x.id === u.id)) Object.assign(d.users.find((x) => x.id === u.id), u)
        else d.users.push({ ...u, id: uid('U') })
        log(d, `updated team member ${u.name}`, u.id)
      })
      return { ok: true }
    },
    // recurring / settings / roadmap
    saveRecurring: (r) => {
      const err = guard('recurring.manage'); if (err) return { error: err }
      update((d) => {
        if (d.recurring.some((x) => x.id === r.id)) Object.assign(d.recurring.find((x) => x.id === r.id), r)
        else d.recurring.push({ ...r, id: uid('R') })
      })
      return { ok: true }
    },
    saveSettings: (s) => {
      const err = guard('settings.manage'); if (err) return { error: err }
      update((d) => { d.settings = { ...d.settings, ...s } })
      toast('Settings saved.')
      return { ok: true }
    },
    // ---------- business workflow: prospecting → leads → follow-ups → proposals → won → client ----------
    saveProspect: (p) => {
      const err = guard('prospects.manage'); if (err) return { error: err }
      if (!p.business?.trim()) return { error: 'Business name is required.' }
      update((d) => {
        if (p.id && d.prospects.some((x) => x.id === p.id)) {
          Object.assign(d.prospects.find((x) => x.id === p.id), p)
          log(d, `updated prospect ${p.business}`, p.id)
        } else {
          const nid = p.id || 'PR' + String(Math.max(0, ...d.prospects.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
          d.prospects.unshift({ status: 'NEW', potential: 'MEDIUM', owner: me.id, createdAt: todayISO(), ...p, id: nid })
          log(d, `added prospect ${p.business}`, nid)
        }
      })
      return { ok: true }
    },
    approachProspect: ({ prospectId, channel = 'WhatsApp', message = '', nextFollowUp = '' }) => {
      const err = guard('prospects.approach'); if (err) return { error: err }
      const date = nextFollowUp || addDays(todayISO(), 2)
      update((d) => {
        const p = d.prospects.find((x) => x.id === prospectId); if (!p) return
        // 1. status → CONTACTED
        p.status = 'CONTACTED'
        // 2. outreach history (prospect-scoped, never overwritten)
        d.outreach.unshift({ id: uid('O'), leadId: '', prospectId, date: todayISO(), channel, result: 'First approach', by: me.id, note: message || `First approach via ${channel}.` })
        // 3+4. follow-up assigned
        const fid = 'F' + String(Math.max(0, ...d.followups.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
        d.followups.unshift({ id: fid, leadId: '', prospectId, date, time: '', purpose: 'Second outreach', channel, assignee: p.owner || me.id, done: false, result: '', note: '' })
        // 5. activity + notify
        log(d, `${me.name} approached ${p.business} via ${channel}`, prospectId)
        notify(d, p.owner || me.id, 'Prospect contacted', `${p.business} — follow up ${date}.`, 'sales', prospectId)
      })
      toast('Marked as contacted. Follow-up created.')
      return { ok: true, next: 'followup' }
    },
    convertProspectToLead: (prospectId) => {
      const err = guard('leads.convert'); if (err) return { error: err }
      let leadId = ''
      update((d) => {
        const p = d.prospects.find((x) => x.id === prospectId); if (!p) return
        if (p.status === 'CONVERTED' && d.leads.some((l) => l.prospectId === prospectId)) return
        leadId = 'L' + String(Math.max(0, ...d.leads.map((l) => parseInt(String(l.id).slice(1)) || 0)) + 1).padStart(3, '0')
        d.leads.unshift({
          id: leadId, prospectId, business: p.business, category: p.category || '', city: p.city || '',
          rating: p.rating || 0, reviews: p.reviews || 0, phone: p.phone || '', website: p.website || '',
          social: p.social || '', source: p.source || 'Outbound', stage: 'RESPONDED',
          score: p.potential === 'HIGH' ? 80 : p.potential === 'MEDIUM' ? 60 : 40,
          owner: p.owner || me.id, value: p.estValue || 0, followUp: addDays(todayISO(), 1),
          notes: `Converted from prospect ${prospectId}. ${p.notes || ''}`.trim(), updatedAt: todayISO()
        })
        p.status = 'CONVERTED'
        d.outreach.unshift({ id: uid('O'), leadId, prospectId, date: todayISO(), channel: 'Status', result: 'CONVERTED', by: me.id, note: `Prospect ${p.business} responded — converted to lead.` })
        log(d, `converted prospect ${p.business} → lead ${leadId}`, leadId)
        notify(d, p.owner || me.id, 'New lead', `${p.business} is now a lead.`, 'sales', leadId)
      })
      toast('Converted to lead.')
      return { ok: true, leadId }
    },
    saveFollowup: (f) => {
      const err = guard('followups.manage'); if (err) return { error: err }
      if (!f.date) return { error: 'Follow-up date is required.' }
      update((d) => {
        if (f.id && d.followups.some((x) => x.id === f.id)) Object.assign(d.followups.find((x) => x.id === f.id), f)
        else {
          const nid = f.id || 'F' + String(Math.max(0, ...d.followups.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
          d.followups.unshift({ done: false, ...f, id: nid })
          const biz = d.leads.find((l) => l.id === f.leadId)?.business || d.prospects.find((p) => p.id === f.prospectId)?.business || nid
          log(d, `scheduled follow-up ${biz} → ${f.date}`, nid)
        }
      })
      return { ok: true }
    },
    completeFollowup: ({ id, result = 'RESPONDED', note = '', nextDate = '', channel = '' }) => {
      const err = guard('followups.manage'); if (err) return { error: err }
      update((d) => {
        // support synthesized auto- ids (auto-L###) → create real record as done + next
        const real = d.followups.find((x) => x.id === id)
        const leadId = real?.leadId || (String(id).startsWith('auto-') ? String(id).replace('auto-', '') : '')
        const prospectId = real?.prospectId || ''
        const lead = d.leads.find((l) => l.id === leadId)
        const prospect = d.prospects.find((p) => p.id === prospectId)
        const biz = lead?.business || prospect?.business || 'record'
        const ch = channel || real?.channel || 'WhatsApp'
        // save outreach history (immutable append)
        d.outreach.unshift({ id: uid('O'), leadId: leadId || '', prospectId: prospectId || '', date: todayISO(), channel: ch, result: String(result).replace(/_/g, ' '), by: me.id, note: note || `${biz} follow-up: ${result}.` })
        if (real) { real.done = true; real.result = result; real.note = note }
        // update lead/prospect state from result
        if (result === 'MEETING' && lead) { lead.stage = 'MEETING'; lead.followUp = nextDate || addDays(todayISO(), 1) }
        else if (result === 'INTERESTED' && lead) { lead.stage = lead.stage === 'NEW' ? 'RESPONDED' : lead.stage; lead.followUp = nextDate || addDays(todayISO(), 1) }
        else if (result === 'INTERESTED' && prospect) { prospect.status = 'RESPONDED' }
        else if (result === 'RESPONDED' && prospect) { prospect.status = 'RESPONDED' }
        else if (result === 'NOT_INTERESTED') { if (lead) { lead.stage = 'LOST'; lead.followUp = '' } if (prospect) prospect.status = 'DROPPED' }
        else if (lead && nextDate) lead.followUp = nextDate
        // create next follow-up if needed
        if (nextDate && result !== 'NOT_INTERESTED') {
          const fid = 'F' + String(Math.max(0, ...d.followups.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
          d.followups.unshift({ id: fid, leadId: leadId || '', prospectId: prospectId || '', date: nextDate, time: '', purpose: 'Next follow-up', channel: ch, assignee: real?.assignee || lead?.owner || prospect?.owner || me.id, done: false, result: '', note: '' })
        }
        log(d, `completed follow-up ${biz} → ${String(result).replace(/_/g, ' ')}`, leadId || prospectId || id)
      })
      toast('Follow-up completed.')
      return { ok: true }
    },
    saveProposal: (p) => {
      const err = guard('proposals.manage'); if (err) return { error: err }
      if (!p.leadId) return { error: 'Lead is required.' }
      if (!p.amount && p.amount !== 0) return { error: 'Amount is required.' }
      let nid = p.id
      update((d) => {
        if (nid && d.proposals.some((x) => x.id === nid)) {
          Object.assign(d.proposals.find((x) => x.id === nid), p)
          log(d, `updated proposal ${p.title || nid}`, nid)
        } else {
          nid = nid || 'PROP' + String(Math.max(0, ...d.proposals.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
          d.proposals.unshift({ status: 'DRAFT', sentAt: '', ...p, id: nid })
          log(d, `created proposal ${p.title || nid}`, nid)
        }
      })
      return { ok: true, id: nid }
    },
    sendProposal: (proposalId) => {
      const err = guard('proposals.manage'); if (err) return { error: err }
      update((d) => {
        const p = d.proposals.find((x) => x.id === proposalId); if (!p) return
        const lead = d.leads.find((l) => l.id === p.leadId)
        p.status = 'SENT'; p.sentAt = todayISO()
        if (lead) {
          lead.stage = 'PROPOSAL_SENT'; lead.updatedAt = todayISO()
          lead.followUp = addDays(todayISO(), 1)
          lead.value = p.amount || lead.value
          d.outreach.unshift({ id: uid('O'), leadId: lead.id, prospectId: lead.prospectId || '', date: todayISO(), channel: 'Email', result: 'Proposal sent', by: me.id, note: p.title || 'Proposal sent.' })
          const fid = 'F' + String(Math.max(0, ...d.followups.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
          d.followups.unshift({ id: fid, leadId: lead.id, prospectId: '', date: lead.followUp, time: '', purpose: 'Proposal follow-up', channel: 'WhatsApp', assignee: lead.owner || me.id, done: false, result: '', note: '' })
          notify(d, lead.owner || me.id, 'Proposal sent', `${lead.business} — follow up ${lead.followUp}.`, 'sales', lead.id)
        }
        log(d, `sent proposal ${p.title || p.id}`, p.id)
      })
      toast('Proposal sent. Follow-up scheduled for tomorrow.')
      return { ok: true }
    },
    setProposalStatus: (proposalId, status) => {
      const err = guard('proposals.manage'); if (err) return { error: err }
      update((d) => {
        const p = d.proposals.find((x) => x.id === proposalId); if (!p) return
        p.status = status
        const lead = d.leads.find((l) => l.id === p.leadId)
        if (lead) {
          if (status === 'NEGOTIATION') lead.stage = 'NEGOTIATION'
          if (status === 'ACCEPTED') lead.stage = 'WON'
          if (status === 'REJECTED') lead.stage = 'LOST'
          lead.updatedAt = todayISO()
        }
        log(d, `proposal ${p.title || p.id} → ${status}`, p.id)
      })
      return { ok: true }
    },
    markWon: (leadId) => {
      const err = guard('leads.convert'); if (err) return { error: err }
      let clientId = ''
      update((d) => {
        const l = d.leads.find((x) => x.id === leadId); if (!l) return
        if (!(l.stage === 'WON' && d.clients.some((c) => c.leadId === leadId))) {
          l.stage = 'WON'; l.updatedAt = todayISO(); l.followUp = ''
          clientId = 'C' + String(Math.max(0, ...d.clients.map((c) => parseInt(String(c.id).slice(1)) || 0)) + 1).padStart(3, '0')
          d.clients.unshift({ id: clientId, leadId, prospectId: l.prospectId || '', company: l.business, contact: l.contact || '', phone: l.phone || '', email: '', industry: l.category || '', pic: l.owner || me.id, status: 'ACTIVE', notes: `Won from ${leadId}${l.prospectId ? ` / ${l.prospectId}` : ''}. History preserved.` })
          d.proposals.filter((p) => p.leadId === leadId && p.status !== 'REJECTED').forEach((p) => { p.status = 'ACCEPTED' })
          d.followups.filter((f) => f.leadId === leadId && !f.done).forEach((f) => { f.done = true; f.result = 'WON' })
          log(d, `won deal ${l.business} → client ${clientId}`, clientId)
          notify(d, l.owner || me.id, 'Deal won', `${l.business} → ${clientId}. Create project next.`, 'sales', clientId)
        } else {
          clientId = d.clients.find((c) => c.leadId === leadId)?.id || ''
        }
      })
      toast('Deal won. Client created — next: create project.')
      return { ok: true, clientId }
    },
    markRead: (id) => update((d) => { const n = d.notifications.find((x) => x.id === id); if (n) n.read = true }),
    markAllRead: () => update((d) => { d.notifications.forEach((n) => { if (!me || n.to === me.id) n.read = true }) }),
    resetDemo: () => { const s = seedDB(); setDb(s) }
  }

  const value = { db, me, login, logout, api, guard, toast, toasts, runAutomation, theme, toggleTheme, canDo: (p) => (me ? can(me.role, p) : false) }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}
