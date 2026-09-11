import { addDays, todayISO } from '../lib/format'

const T = todayISO()

export const CRM_STAGES = [
  { key: 'DISCOVERED', label: 'Discovered', color: 'slate' },
  { key: 'CONTACTED', label: 'Contacted', color: 'blue' },
  { key: 'RESPONDED', label: 'Responded', color: 'cyan' },
  { key: 'FOLLOW_UP', label: 'Follow Up', color: 'amber' },
  { key: 'BRIEF', label: 'Brief', color: 'violet' },
  { key: 'ANALYSIS', label: 'Analysis', color: 'indigo' },
  { key: 'SOLUTION', label: 'Solution', color: 'purple' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'brand' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'orange' },
  { key: 'WON', label: 'Won', color: 'green' },
  { key: 'REJECTED', label: 'Rejected', color: 'red' }
]

export const STAGE_IDX = Object.fromEntries(CRM_STAGES.map((s, i) => [s.key, i]))

export const PRIORITY = { URGENT: 'URGENT', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' }

export function stageInfo(key) {
  return CRM_STAGES.find((s) => s.key === key) || CRM_STAGES[0]
}

export function nextStage(current) {
  const order = ['DISCOVERED', 'CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'BRIEF', 'ANALYSIS', 'SOLUTION', 'PROPOSAL', 'NEGOTIATION', 'WON']
  const idx = order.indexOf(current)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
}

export function prevStage(current) {
  const order = ['DISCOVERED', 'CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'BRIEF', 'ANALYSIS', 'SOLUTION', 'PROPOSAL', 'NEGOTIATION', 'WON']
  const idx = order.indexOf(current)
  return idx > 0 ? order[idx - 1] : null
}

export function canGenerateProposal(opp) {
  const a = opp?.analysis
  if (!a) return false
  return a.status === 'APPROVED'
}

export function canSendForApproval(opp) {
  const a = opp?.analysis
  if (!a) return false
  return a.status === 'DRAFT' && a.scope && a.scope.length > 0
}

export function approvalState(opp) {
  return opp?.analysis?.status || 'DRAFT'
}

export const APPROVAL_STATES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REVISION_REQUESTED']

export const PROPOSAL_STATUS = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'REJECTED']

export function buildCommunication(opp, users = []) {
  const uid = (id) => users.find((u) => u.id === id)?.name || 'System'
  return (opp?.activities || [])
    .slice()
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')))
    .map((a) => ({ ...a, actorName: uid(a.by) }))
}
