import { addDays, daysUntil, todayISO } from './format'

// ── Business workflow: PROSPECTING → LEADS → FOLLOW-UPS → PROPOSALS → WON → CLIENT ──
// UI is driven by USER INTENT → ACTION → SYSTEM RESPONSE → NEXT ACTION.
// This module is pure (no React) so pages + store share one brain.

export const PROSPECT_STATUS = ['NEW', 'CONTACTED', 'RESPONDED', 'CONVERTED', 'DROPPED']
export const PIPELINE = ['NEW', 'CONTACTED', 'RESPONDED', 'MEETING', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']
export const PROPOSAL_STATUS = ['DRAFT', 'SENT', 'AWAITING', 'NEGOTIATION', 'ACCEPTED', 'REJECTED']
export const FOLLOWUP_RESULTS = ['NO_RESPONSE', 'RESPONDED', 'INTERESTED', 'NOT_INTERESTED', 'MEETING']

export const STAGE_PROBABILITY = {
  NEW: 10, CONTACTED: 20, RESPONDED: 35, QUALIFIED: 40,
  MEETING: 55, PROPOSAL: 70, PROPOSAL_SENT: 70, NEGOTIATION: 85, WON: 100, LOST: 0
}

export const greeting = (name = '') => {
  const h = new Date().getHours()
  const first = String(name || '').split(' ')[0] || 'there'
  if (h < 11) return `Good morning, ${first}`
  if (h < 15) return `Good afternoon, ${first}`
  if (h < 19) return `Good evening, ${first}`
  return `Good night, ${first}`
}

// ── Prospect intelligence ─────────────────────────────────────────────
export function prospectSignals(p = {}) {
  const out = []
  if (!p.website) out.push('No website')
  if (String(p.social || '').trim()) out.push('Active Instagram')
  if ((p.reviews || 0) >= 200) out.push('High customer activity')
  if (p.category) out.push('Relevant business category')
  if ((p.rating || 0) >= 4.5) out.push('Strong reputation')
  return out.slice(0, 5)
}

export function recommendService(p = {}) {
  if (!p.website) return 'Company Website'
  const cat = String(p.category || '').toLowerCase()
  if (cat.includes('beauty') || cat.includes('fashion')) return 'Landing Page + Booking'
  if (cat.includes('f&b') || cat.includes('restaurant') || cat.includes('cafe') || cat.includes('kopi')) return 'Company Profile + Menu'
  if (cat.includes('fitness') || cat.includes('gym')) return 'Landing Page + Membership'
  if (cat.includes('property')) return 'Property Catalog'
  return 'Company Website'
}

export function outreachMessage(p = {}, channel = 'WhatsApp') {
  const name = p.business || 'there'
  const service = recommendService(p)
  const openers = {
    WhatsApp: `Halo ${name}! Saya dari Dignify — kami bantu bisnis seperti Anda naik kelas lewat ${service}.`,
    Instagram: `Halo ${name}! Suka banget sama konten & review pelanggan Anda. Kami dari Dignify, bantu bikin ${service}.`,
    Email: `Halo tim ${name},\n\nSaya dari Dignify. Kami melihat potensi besar untuk ${service} — boleh share portfolio singkat?`
  }
  const body = `${openers[channel] || openers.WhatsApp} Boleh 15 menit minggu ini untuk diskusi singkat?`
  return body
}

export function followupMessage(kind = {}) {
  const name = kind.business || 'there'
  if (kind.context === 'proposal') return `Halo ${name}! Menindaklanjuti proposal yang kami kirim — apakah ada yang ingin didiskusikan? Kami siap bantu sampai deal.`
  if (kind.context === 'second') return `Halo ${name}! Sekadar mengingatkan penawaran kami kemarin. Boleh tahu apakah ada kebutuhan website/konten dalam waktu dekat?`
  return `Halo ${name}! Apa kabar? Menindaklanjuti obrolan kita sebelumnya — kapan waktu yang pas untuk lanjut?`
}

// ── Next-action recommenders ──────────────────────────────────────────
export function nextActionForProspect(p = {}) {
  const s = p.status || 'NEW'
  if (s === 'NEW') return { label: 'Approach prospect', detail: `Recommended: ${recommendService(p)}`, action: 'approach', tone: 'start' }
  if (s === 'CONTACTED') return { label: 'Follow up first outreach', detail: 'Waiting for response', action: 'followup', tone: 'follow' }
  if (s === 'RESPONDED') return { label: 'Convert to lead', detail: 'They responded — qualify now', action: 'convert', tone: 'hot' }
  return { label: 'No action needed', detail: '', action: null, tone: 'done' }
}

export function nextActionForLead(lead = {}, proposal) {
  const stage = lead.stage || 'NEW'
  if (stage === 'WON') return { label: 'Create project', detail: 'Deal won — kick off delivery', action: 'create-project', tone: 'start' }
  if (stage === 'LOST') return { label: 'Archived', detail: '', action: null, tone: 'done' }
  if (proposal && ['SENT', 'AWAITING'].includes(proposal.status)) {
    const due = lead.followUp ? `Follow up ${lead.followUp}` : 'Follow up tomorrow'
    return { label: 'Follow up proposal', detail: `Sent ${proposal.sentAt || ''} · ${due}`, action: 'followup', tone: 'hot' }
  }
  if (stage === 'NEGOTIATION') return { label: 'Push to close', detail: 'Send final terms', action: 'proposal', tone: 'hot' }
  if (stage === 'PROPOSAL_SENT' || stage === 'PROPOSAL') return { label: 'Send proposal', detail: 'Deal ready to propose', action: 'proposal', tone: 'hot' }
  if (stage === 'MEETING') return { label: 'Send proposal', detail: 'After meeting — propose now', action: 'proposal', tone: 'start' }
  if (stage === 'RESPONDED') return { label: 'Schedule meeting', detail: 'They responded', action: 'stage', tone: 'start' }
  if (stage === 'CONTACTED') return { label: 'Follow up outreach', detail: lead.followUp ? `Due ${lead.followUp}` : 'Second outreach', action: 'followup', tone: 'follow' }
  return { label: 'Qualify lead', detail: 'Move to contacted', action: 'stage', tone: 'follow' }
}

// ── Daily prioritization ──────────────────────────────────────────────
// Score: overdue (50) > due today (30) > high value (0-15) > high potential (0-10)
function score({ dueDiff, value, score: pot }) {
  let s = 0
  if (dueDiff !== null && dueDiff !== undefined) {
    if (dueDiff < 0) s += 50 + Math.min(20, Math.abs(dueDiff) * 2)
    else if (dueDiff === 0) s += 30
    else if (dueDiff <= 2) s += 12
  }
  if (value) s += Math.min(15, value / 1000000)
  if (pot) s += Math.min(10, pot / 10)
  return s
}

export function buildDailyActions(db = {}, me) {
  const T = todayISO()
  const items = []
  const uname = (id) => db.users?.find((u) => u.id === id)?.name || '—'

  // follow-ups collection (explicit) + lead.followUp fallback
  const fus = [...(db.followups || [])].filter((f) => !f.done)
  fus.forEach((f) => {
    const lead = db.leads?.find((l) => l.id === f.leadId)
    const prospect = db.prospects?.find((p) => p.id === f.prospectId)
    const business = lead?.business || prospect?.business || 'Unknown'
    const diff = f.date ? Math.round((new Date(f.date) - new Date(T)) / 864e5) : null
    items.push({
      kind: 'followup', id: f.id, business,
      title: `Follow up ${business}`,
      subtitle: f.purpose || lead?.stage || 'Follow-up',
      channel: f.channel || 'WhatsApp',
      date: f.date, diff, assignee: f.assignee, assigneeName: uname(f.assignee),
      value: lead?.value || 0, potential: lead?.score || prospect?.potential === 'HIGH' ? 85 : 50,
      leadId: f.leadId, prospectId: f.prospectId,
      s: score({ dueDiff: diff, value: lead?.value, pot: lead?.score })
    })
  })
  // leads with followUp date but no explicit followup row → synthesize (avoid dupes)
  ;(db.leads || []).filter((l) => l.followUp && !['WON', 'LOST'].includes(l.stage)).forEach((l) => {
    const has = fus.some((f) => f.leadId === l.id && f.date === l.followUp)
    if (has) return
    const diff = Math.round((new Date(l.followUp) - new Date(T)) / 864e5)
    if (diff > 7) return
    items.push({
      kind: 'followup', id: `auto-${l.id}`, business: l.business,
      title: `Follow up ${l.business}`,
      subtitle: l.stage === 'PROPOSAL_SENT' || l.stage === 'PROPOSAL' ? 'Proposal follow-up' : 'Scheduled follow-up',
      channel: 'WhatsApp', date: l.followUp, diff, assignee: l.owner, assigneeName: uname(l.owner),
      value: l.value || 0, potential: l.score || 50, leadId: l.id, prospectId: l.prospectId || '',
      s: score({ dueDiff: diff, value: l.value, pot: l.score })
    })
  })
  // fresh prospects ready to approach
  ;(db.prospects || []).filter((p) => (p.status || 'NEW') === 'NEW').slice(0, 20).forEach((p) => {
    items.push({
      kind: 'prospect', id: p.id, business: p.business,
      title: `Approach ${p.business}`,
      subtitle: 'New prospect', channel: p.preferredChannel || 'WhatsApp',
      date: T, diff: 0, assignee: p.owner || me?.id, assigneeName: uname(p.owner || me?.id),
      value: p.estValue || 0, potential: p.potential === 'HIGH' ? 90 : p.potential === 'MEDIUM' ? 60 : 35,
      prospectId: p.id, leadId: '',
      s: score({ dueDiff: 1, value: 0, pot: p.potential === 'HIGH' ? 90 : 55 }) - 4
    })
  })
  // proposals awaiting response
  ;(db.proposals || []).filter((p) => ['SENT', 'AWAITING', 'NEGOTIATION'].includes(p.status)).forEach((p) => {
    const lead = db.leads?.find((l) => l.id === p.leadId)
    if (!lead || ['WON', 'LOST'].includes(lead.stage)) return
    if (items.some((i) => i.leadId === p.leadId && i.kind === 'followup')) return
    items.push({
      kind: 'proposal', id: p.id, business: lead.business,
      title: `Send proposal ${lead.business}`,
      subtitle: 'Proposal ready', channel: 'Email',
      date: lead.followUp || addDays(T, 1), diff: lead.followUp ? Math.round((new Date(lead.followUp) - new Date(T)) / 864e5) : 1,
      assignee: lead.owner, assigneeName: uname(lead.owner),
      value: p.amount || lead.value || 0, potential: lead.score || 70, leadId: lead.id, proposalId: p.id,
      s: score({ dueDiff: 1, value: p.amount, pot: 75 })
    })
  })

  // scope to me for STAFF
  const scoped = me?.role === 'STAFF' ? items.filter((i) => !i.assignee || i.assignee === me.id) : items
  scoped.sort((a, b) => b.s - a.s)
  return scoped
}

export function followupBuckets(db = {}, me) {
  const T = todayISO()
  const all = buildDailyActions(db, me).filter((i) => i.kind === 'followup')
  const due = all.filter((i) => i.diff === 0)
  const overdue = all.filter((i) => i.diff !== null && i.diff < 0)
  const upcoming = all.filter((i) => i.diff !== null && i.diff > 0)
  return { due, overdue, upcoming, T }
}

export function unreadCount() { return 0 }
export { daysUntil }
