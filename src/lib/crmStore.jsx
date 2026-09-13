import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { seedCRM, STAGE_IDX, CRM_STAGES } from '../data/crmDummy'
import { addDays, nowISO, todayISO, uid } from './format'

const CRM_KEY = 'dignify-crm-v1'
const THEME_KEY = 'dignify-theme'
const CRM_CTX = createContext(null)
export const useCrm = () => useContext(CRM_CTX)

function loadCRM() {
  try {
    const r = localStorage.getItem(CRM_KEY)
    if (r) {
      const parsed = JSON.parse(r)
      // Migrate old data that doesn't have prospects/clients/activities
      if (!parsed.prospects || !parsed.clients || !parsed.activities) {
        const fresh = seedCRM()
        parsed.prospects = parsed.prospects || fresh.prospects
        parsed.clients = parsed.clients || fresh.clients
        parsed.activities = parsed.activities || fresh.activities
        localStorage.setItem(CRM_KEY, JSON.stringify(parsed))
      }
      return parsed
    }
  } catch {}
  const s = seedCRM()
  localStorage.setItem(CRM_KEY, JSON.stringify(s))
  return s
}

export function CrmProvider({ children }) {
  const [data, setData] = useState(loadCRM)
  const [view, setView] = useState('opportunities')
  const [selectedId, setSelectedId] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [theme, setThemeState] = useState(() => { try { return localStorage.getItem(THEME_KEY) || 'light' } catch { return 'light' } })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const setTheme = useCallback((t) => {
    setThemeState(t)
    try {
      localStorage.setItem(THEME_KEY, t)
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      if (t === 'dark') root.classList.add('dark')
      else if (t === 'system') root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      else root.classList.add('light')
    } catch {}
  }, [])

  React.useEffect(() => { setTheme(theme) }, [theme, setTheme])

  const update = useCallback((fn) => setData((prev) => {
    const d = JSON.parse(JSON.stringify(prev))
    fn(d)
    localStorage.setItem(CRM_KEY, JSON.stringify(d))
    return d
  }), [])

  const selected = useMemo(() => {
    if (view === 'opportunities') return (data.opportunities || []).find((o) => o.id === selectedId) || null
    if (view === 'prospects') return (data.prospects || []).find((p) => p.id === selectedId) || null
    if (view === 'clients') return (data.clients || []).find((c) => c.id === selectedId) || null
    return null
  }, [data, selectedId, view])

  const counts = useMemo(() => {
    const opps = data.opportunities || []
    const prospects = data.prospects || []
    const clients = data.clients || []
    const byStage = {}
    CRM_STAGES.forEach((s) => { byStage[s.key] = 0 })
    opps.forEach((o) => { if (byStage[o.stage] !== undefined) byStage[o.stage]++ })
    const prospectsByStatus = {}
    prospects.forEach((p) => { prospectsByStatus[p.status] = (prospectsByStatus[p.status] || 0) + 1 })
    const clientsByStatus = {}
    clients.forEach((c) => { clientsByStatus[c.status] = (clientsByStatus[c.status] || 0) + 1 })
    return {
      total: opps.length, byStage,
      prospects: prospects.length, prospectsByStatus,
      clients: clients.length, clientsByStatus,
      activities: (data.activities || []).length
    }
  }, [data])

  const selectOpp = useCallback((id) => { setSelectedId(id); setSelectedTab('overview') }, [])

  const selectItem = useCallback((id) => { setSelectedId(id); setSelectedTab('overview') }, [])

  const switchView = useCallback((v) => { setView(v); setSelectedId(''); setSelectedTab('overview') }, [])

  const crmApi = useMemo(() => ({
    addOpp: (o) => {
      const id = 'OPP' + String(Math.max(0, ...data.opportunities.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
      update((d) => { d.opportunities.unshift({ id, activities: [], notes: [], team: [], tags: [], files: [], proposals: [], brief: null, analysis: null, ...o }) })
      return id
    },
    updateOpp: (id, patch) => update((d) => { const o = d.opportunities.find((x) => x.id === id); if (o) Object.assign(o, patch) }),
    setStage: (id, stage) => update((d) => {
      const o = d.opportunities.find((x) => x.id === id); if (!o) return
      o.stage = stage
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), type: 'STAGE', at: nowISO(), by: 'system', title: `Stage → ${stage}`, detail: `Opportunity moved to ${stage}.` })
    }),
    addActivity: (oppId, act) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', ...act })
    }),
    addNote: (oppId, note) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.notes = o.notes || []
      o.notes.push({ id: uid('N'), at: nowISO(), by: 'system', ...note })
    }),
    updateNote: (oppId, noteId, text) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      const n = (o.notes || []).find((x) => x.id === noteId); if (n) n.text = text
    }),
    deleteNote: (oppId, noteId) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.notes = (o.notes || []).filter((x) => x.id !== noteId)
    }),
    saveBrief: (oppId, brief) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.brief = { ...(o.brief || {}), ...brief }
    }),
    completeBrief: (oppId) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.brief = { ...(o.brief || {}), status: 'COMPLETE' }
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'BRIEF', title: 'Brief completed', detail: 'All requirements captured.' })
    }),
    saveAnalysis: (oppId, analysis) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.analysis = { ...(o.analysis || {}), ...analysis, status: analysis?.status || o.analysis?.status || 'DRAFT' }
    }),
    sendForApproval: (oppId) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      if (o.analysis) { o.analysis.status = 'PENDING_APPROVAL' }
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'APPROVAL', title: 'Sent for approval', detail: 'Analysis sent to internal reviewers.' })
    }),
    approveAnalysis: (oppId) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      if (o.analysis) { o.analysis.status = 'APPROVED' }
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'APPROVAL', title: 'Analysis approved', detail: 'Internal approval received. Ready to generate proposal.' })
    }),
    requestRevision: (oppId, reason) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      if (o.analysis) { o.analysis.status = 'REVISION_REQUESTED'; o.analysis.revisionReason = reason }
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'APPROVAL', title: 'Revision requested', detail: reason || 'Changes needed.' })
    }),
    generateProposal: (oppId, propData) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.proposals = o.proposals || []
      const version = o.proposals.length + 1
      o.proposals.push({ id: uid('PROP'), version, status: 'DRAFT', createdAt: todayISO(), createdBy: 'system', ...propData })
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'PROPOSAL', title: `Proposal v${version} generated`, detail: 'Auto-filled from CRM data.' })
    }),
    updateProposalStatus: (oppId, propId, status) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      const p = (o.proposals || []).find((x) => x.id === propId); if (!p) return
      p.status = status
      if (status === 'SENT') p.sentAt = todayISO()
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'PROPOSAL', title: `Proposal v${p.version} → ${status}`, detail: `Status updated to ${status}.` })
    }),
    markWon: (oppId) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.stage = 'WON'
      o.wonDate = todayISO()
      const cid = 'CLI' + String(Math.max(0, ...(d.clients || []).map((c) => parseInt(String(c.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
      d.clients = d.clients || []
      d.clients.push({
        id: cid, opportunityId: oppId, business: o.business, contact: o.contact,
        industry: o.industry, city: o.city, location: o.location,
        service: o.service, value: o.estimatedValue, paid: 0, outstanding: o.estimatedValue,
        status: 'ACTIVE', paymentStatus: 'OUTSTANDING', maintenance: false,
        projects: [], createdAt: todayISO(), lastActivity: todayISO()
      })
      o.clientId = cid
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'WON', title: 'Deal won', detail: `Client ${cid} created.` })
      return cid
    }),
    markRejected: (oppId, reason, followUpDate) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.stage = 'REJECTED'
      o.rejectionReason = reason || ''
      if (followUpDate) o.followUpDate = followUpDate
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'REJECTION', title: 'Opportunity rejected', detail: `Reason: ${reason || 'Not specified'}.` })
    }),
    reopen: (oppId, stage) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.stage = stage || 'FOLLOW_UP'
      o.rejectionReason = ''
      o.activities = o.activities || []
      o.activities.push({ id: uid('A'), at: nowISO(), by: 'system', type: 'STAGE', title: 'Opportunity reopened', detail: `Moved to ${stage || 'FOLLOW_UP'}.` })
    }),
    addTeam: (oppId, userId, role) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.team = o.team || []
      if (!o.team.some((t) => t.userId === userId)) o.team.push({ userId, role })
    }),
    removeTeam: (oppId, userId) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.team = (o.team || []).filter((t) => t.userId !== userId)
    }),
    addTag: (oppId, tag) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.tags = o.tags || []
      if (!o.tags.includes(tag)) o.tags.push(tag)
    }),
    removeTag: (oppId, tag) => update((d) => {
      const o = d.opportunities.find((x) => x.id === oppId); if (!o) return
      o.tags = (o.tags || []).filter((t) => t !== tag)
    }),
    addProspect: (p) => {
      const id = 'PR' + String(Math.max(0, ...(data.prospects || []).map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
      update((d) => { d.prospects = d.prospects || []; d.prospects.unshift({ id, activities: [], notes: [], tags: [], createdAt: todayISO(), ...p }) })
      return id
    },
    updateProspect: (id, patch) => update((d) => { const p = (d.prospects || []).find((x) => x.id === id); if (p) Object.assign(p, patch) }),
    convertProspect: (prId, oppData) => update((d) => {
      const p = (d.prospects || []).find((x) => x.id === prId); if (!p) return
      p.status = 'CONVERTED'
      p.activities = p.activities || []
      p.activities.push({ id: uid('A'), type: 'CONVERTED', at: nowISO(), by: 'system', title: 'Converted to opportunity', detail: 'Created opportunity.' })
      const oid = 'OPP' + String(Math.max(0, ...d.opportunities.map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
      d.opportunities.unshift({
        id: oid, business: p.business, category: p.category, city: p.city, industry: p.industry,
        location: p.location, contact: p.contact, description: '',
        existingSystem: '', service: oppData?.service || '', estimatedValue: oppData?.estimatedValue || 0,
        priority: oppData?.priority || 'MEDIUM', stage: 'DISCOVERED',
        owner: p.owner, pic: p.owner, contactDate: todayISO(), respondedDate: '', followUpDate: '',
        nextAction: 'Initial contact', nextActionDate: addDays(todayISO(), 3), nextActionType: 'contact',
        brief: null, analysis: null, proposals: [],
        activities: [{ id: uid('A'), type: 'PROSPECT', at: nowISO(), by: 'system', title: 'Prospect converted', detail: `Converted from ${prId}.` }],
        notes: [], team: [{ userId: p.owner, role: 'PIC' }], tags: p.tags || [], files: []
      })
      return oid
    }),
    addClient: (c) => {
      const id = 'CLI' + String(Math.max(0, ...(data.clients || []).map((x) => parseInt(String(x.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')
      update((d) => { d.clients = d.clients || []; d.clients.unshift({ id, projects: [], createdAt: todayISO(), lastActivity: todayISO(), paid: 0, outstanding: c.value || 0, paymentStatus: 'OUTSTANDING', maintenance: false, ...c }) })
      return id
    },
    updateClient: (id, patch) => update((d) => { const c = (d.clients || []).find((x) => x.id === id); if (c) Object.assign(c, patch) }),
    addGlobalActivity: (act) => update((d) => {
      d.activities = d.activities || []
      d.activities.unshift({ id: uid('ACT'), at: nowISO(), by: 'system', ...act })
    }),
    resetData: () => { const s = seedCRM(); setData(s); localStorage.setItem(CRM_KEY, JSON.stringify(s)) }
  }), [data, update])

  const value = { data, view, selected, selectedId, selectedTab, theme, sidebarCollapsed, counts, ...crmApi, selectOpp, selectItem, switchView, setSelectedTab, setTheme, setSidebarCollapsed }
  return <CRM_CTX.Provider value={value}>{children}</CRM_CTX.Provider>
}
