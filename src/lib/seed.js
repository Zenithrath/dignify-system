import { addDays, todayISO } from './format'

// Seed mirrors the Google Sheets schema (see ARCHITECTURE.md).
// IDs: L### leads, C### clients, P### projects, T### tasks,
// M### maintenance, INV### invoices, ACT### activity, NOTIF### notifications.
export function seedDB() {
  const T = todayISO()
  return {
    users: [
      { id: 'U001', name: 'Admin Dignify', email: 'admin@dignify.id', role: 'ADMIN', title: 'Administrator', skills: ['Management', 'Finance'], active: true, avatar: null },
      { id: 'U002', name: 'Djibril', email: 'pm@dignify.id', role: 'PM', title: 'Project Manager', skills: ['Planning', 'QA', 'Client Comm'], active: true },
      { id: 'U003', name: 'Ignas', email: 'ignas@dignify.id', role: 'STAFF', title: 'UI/UX Designer', skills: ['Figma', 'Design System'], active: true },
      { id: 'U004', name: 'Staff Bima', email: 'bima@dignify.id', role: 'STAFF', title: 'Frontend Developer', skills: ['React', 'Tailwind'], active: true },
      { id: 'U005', name: 'Staff Cinta', email: 'cinta@dignify.id', role: 'STAFF', title: 'Video Editor', skills: ['Premiere', 'Reels'], active: true },
      { id: 'U006', name: 'Staff Dian', email: 'dian@dignify.id', role: 'STAFF', title: 'Content & Admin', skills: ['Copywriting', 'Publishing'], active: true },
      { id: 'U007', name: 'Staff Eko', email: 'eko@dignify.id', role: 'STAFF', title: 'Backend & Automation', skills: ['Apps Script', 'APIs'], active: true }
    ],
    leads: [
      { id: 'L001', business: 'Kopi Nusa', category: 'F&B', city: 'Jakarta', rating: 4.6, reviews: 812, phone: '0812-1000-0001', website: 'kopinusa.id', social: '@kopinusa', source: 'Maps', stage: 'MEETING', score: 82, owner: 'U002', value: 4500000, followUp: T, notes: 'Owner wants new company profile + menu.', updatedAt: T },
      { id: 'L002', business: 'Bengkel Jaya Abadi', category: 'Automotive', city: 'Bandung', rating: 4.3, reviews: 214, phone: '0812-1000-0002', website: '', social: '@bengkeljaya', source: 'Instagram', stage: 'RESPONDED', score: 64, owner: 'U002', value: 2800000, followUp: addDays(T, 1), notes: 'Replied on IG, asked for portfolio.', updatedAt: T },
      { id: 'L003', business: 'Skinnara Beauty', category: 'Beauty', city: 'Surabaya', rating: 4.8, reviews: 1204, phone: '0812-1000-0003', website: 'skinnara.com', social: '@skinnara', source: 'Referral', stage: 'PROPOSAL_SENT', score: 91, owner: 'U002', value: 7500000, followUp: addDays(T, 2), notes: 'Proposal sent, waiting for DP decision.', updatedAt: T },
      { id: 'L004', business: 'Toko Berkah Frozen', category: 'Retail', city: 'Semarang', rating: 4.1, reviews: 98, phone: '0812-1000-0004', website: '', social: '', source: 'Maps', stage: 'CONTACTED', score: 48, owner: 'U006', value: 1800000, followUp: addDays(T, 1), notes: 'WA sent, no response yet.', updatedAt: T },
      { id: 'L005', business: 'Gym Atlas', category: 'Fitness', city: 'Jakarta', rating: 4.7, reviews: 640, phone: '0812-1000-0005', website: 'atlasgym.co', social: '@atlasgym', source: 'Website', stage: 'NEGOTIATION', score: 88, owner: 'U002', value: 9200000, followUp: T, notes: 'Negotiating maintenance bundle.', updatedAt: T },
      { id: 'L006', business: 'Batik Laras', category: 'Fashion', city: 'Solo', rating: 4.5, reviews: 377, phone: '0812-1000-0006', website: '', social: '@batiklaras', source: 'Marketplace', stage: 'QUALIFIED', score: 57, owner: 'U006', value: 3200000, followUp: addDays(T, 3), notes: '', updatedAt: T },
      { id: 'L007', business: 'Klinik Sehat Qolbu', category: 'Health', city: 'Bekasi', rating: 4.4, reviews: 502, phone: '0812-1000-0007', website: '', social: '', source: 'Maps', stage: 'NEW', score: 35, owner: 'U006', value: 2500000, followUp: addDays(T, 2), notes: '', updatedAt: T },
      { id: 'L008', business: 'Property Amanah', category: 'Property', city: 'Bogor', rating: 4.2, reviews: 88, phone: '0812-1000-0008', website: 'amanahproperty.id', social: '', source: 'Referral', stage: 'WON', score: 95, owner: 'U002', value: 12500000, followUp: '', notes: 'Won — converted to C004.', updatedAt: T },
      { id: 'L009', business: 'Resto Sederhana Rasa', category: 'F&B', city: 'Padang', rating: 4.0, reviews: 1500, phone: '0812-1000-0009', website: '', social: '', source: 'Maps', stage: 'LOST', score: 20, owner: 'U002', value: 2000000, followUp: '', notes: 'Lost: budget < 1jt.', updatedAt: T },
      { id: 'L010', business: 'Educa Course', category: 'Education', city: 'Yogyakarta', rating: 4.9, reviews: 231, phone: '0812-1000-0010', website: 'educa.id', social: '@educa.id', source: 'Instagram', stage: 'CONTACTED', score: 61, owner: 'U006', value: 5400000, followUp: addDays(T, 4), notes: 'Landing page + automation interest.', updatedAt: T }
    ],
    outreach: [
      { id: 'O001', leadId: 'L001', date: addDays(T, -10), channel: 'WhatsApp', result: 'No response', by: 'U006', note: 'Intro + portfolio link.' },
      { id: 'O002', leadId: 'L001', date: addDays(T, -7), channel: 'Instagram', result: 'Replied', by: 'U006', note: 'Owner replied, moved to call.' },
      { id: 'O003', leadId: 'L001', date: addDays(T, -3), channel: 'Meeting', result: 'Proposal requested', by: 'U002', note: 'On-site meeting, needs company profile.' },
      { id: 'O004', leadId: 'L003', date: addDays(T, -5), channel: 'WhatsApp', result: 'Replied', by: 'U002', note: 'Sent rate card.' },
      { id: 'O005', leadId: 'L003', date: addDays(T, -1), channel: 'Email', result: 'Proposal sent', by: 'U002', note: 'Proposal PDF via Drive.' },
      { id: 'O006', leadId: 'L002', date: addDays(T, -2), channel: 'Instagram', result: 'Replied', by: 'U006', note: 'Asked for pricing.' }
    ],
    prospects: [
      { id: 'PR001', business: 'Kedai ABC', category: 'Restaurant', city: 'Malang', rating: 4.8, reviews: 327, website: '', social: '@kedaiabc', source: 'Maps scraping', potential: 'HIGH', status: 'NEW', owner: 'U002', estValue: 3500000, preferredChannel: 'WhatsApp', phone: '0812-3000-0001', contact: 'Budi', notes: 'No website, active IG, ramai.', createdAt: addDays(T, -4) },
      { id: 'PR002', business: 'Studio XYZ', category: 'Creative', city: 'Jakarta', rating: 4.6, reviews: 412, website: '', social: '@studioxyz', source: 'Directory', potential: 'HIGH', status: 'NEW', owner: 'U002', estValue: 4500000, preferredChannel: 'Instagram', phone: '0812-3000-0002', contact: 'Andi', notes: 'Butuh portfolio site.', createdAt: addDays(T, -3) },
      { id: 'PR003', business: 'Cafe 27', category: 'Cafe', city: 'Bandung', rating: 4.4, reviews: 198, website: '', social: '@cafe27', source: 'Manual research', potential: 'MEDIUM', status: 'CONTACTED', owner: 'U006', estValue: 2800000, preferredChannel: 'Instagram', phone: '0812-3000-0003', contact: 'Rina', notes: 'First outreach sent, waiting.', createdAt: addDays(T, -6) },
      { id: 'PR004', business: 'PT Maju Bersama', category: 'Services', city: 'Surabaya', rating: 4.2, reviews: 120, website: 'majubersama.co', social: '', source: 'Directory', potential: 'MEDIUM', status: 'RESPONDED', owner: 'U002', estValue: 6000000, preferredChannel: 'Email', phone: '0812-3000-0004', contact: 'Pak Hendra', notes: 'Responded, minta proposal.', createdAt: addDays(T, -9) },
      { id: 'PR005', business: 'Bengkel Barokah', category: 'Automotive', city: 'Semarang', rating: 4.1, reviews: 86, website: '', social: '', source: 'Maps scraping', potential: 'LOW', status: 'NEW', owner: 'U006', estValue: 1800000, preferredChannel: 'WhatsApp', phone: '0812-3000-0005', contact: '', notes: '', createdAt: addDays(T, -1) }
    ],
    followups: [
      { id: 'F001', leadId: 'L003', prospectId: '', date: T, time: '09:00', purpose: 'Proposal follow-up', channel: 'WhatsApp', assignee: 'U002', done: false, result: '', note: '' },
      { id: 'F002', leadId: '', prospectId: 'PR002', date: T, time: '11:00', purpose: 'Ask about website requirements', channel: 'WhatsApp', assignee: 'U002', done: false, result: '', note: '' },
      { id: 'F003', leadId: '', prospectId: 'PR003', date: T, time: '15:00', purpose: 'Second outreach', channel: 'Instagram', assignee: 'U006', done: false, result: '', note: '' },
      { id: 'F004', leadId: 'L005', prospectId: '', date: addDays(T, -2), time: '10:00', purpose: 'Negotiation check-in', channel: 'WhatsApp', assignee: 'U002', done: false, result: '', note: '2 days overdue' },
      { id: 'F005', leadId: 'L001', prospectId: '', date: addDays(T, 1), time: '10:00', purpose: 'Meeting recap + proposal', channel: 'WhatsApp', assignee: 'U002', done: false, result: '', note: '' }
    ],
    proposals: [
      { id: 'PROP001', leadId: 'L003', title: 'Skinnara — Landing + Booking', service: 'Website Development', amount: 7500000, status: 'AWAITING', sentAt: addDays(T, -1), validUntil: addDays(T, 6), notes: 'Waiting DP decision.' },
      { id: 'PROP002', leadId: 'L005', title: 'Gym Atlas — Web + Maintenance bundle', service: 'Website + Maintenance', amount: 9200000, status: 'NEGOTIATION', sentAt: addDays(T, -3), validUntil: addDays(T, 4), notes: 'Negotiating bundle.' },
      { id: 'PROP003', leadId: 'L001', title: 'Kopi Nusa — Company Profile', service: 'Website Development', amount: 4500000, status: 'DRAFT', sentAt: '', validUntil: addDays(T, 7), notes: 'Draft after meeting.' }
    ],
    clients: [
      { id: 'C001', leadId: 'L001', company: 'Kopi Nusa', contact: 'Nadia (Owner)', phone: '0812-1000-0001', email: 'halo@kopinusa.id', industry: 'F&B', pic: 'U002', status: 'ACTIVE', notes: 'Priority client.' },
      { id: 'C002', leadId: '', company: 'ABC Company', contact: 'Pak Hendra', phone: '0812-2000-0002', email: 'ops@abccompany.id', industry: 'Services', pic: 'U002', status: 'ACTIVE', notes: 'Monthly maintenance.' },
      { id: 'C003', leadId: '', company: 'Skinnara Beauty', contact: 'Sarah', phone: '0812-1000-0003', email: 'team@skinnara.com', industry: 'Beauty', pic: 'U002', status: 'ACTIVE', notes: '' },
      { id: 'C004', leadId: 'L008', company: 'Property Amanah', contact: 'Bu Ratna', phone: '0812-1000-0008', email: 'ratna@amanahproperty.id', industry: 'Property', pic: 'U002', status: 'ACTIVE', notes: 'Converted from L008.' }
    ],
    projects: [
      { id: 'P001', clientId: 'C001', name: 'Kopi Nusa — Company Profile', service: 'Website Development', desc: 'Company profile + menu + WhatsApp order CTA.', value: 4500000, start: addDays(T, -12), deadline: addDays(T, 6), pm: 'U002', status: 'DEVELOPMENT', priority: 'HIGH', progress: 60, milestones: [{ t: 'Design approved', done: true }, { t: 'Homepage build', done: true }, { t: 'Menu + ordering', done: false }, { t: 'Go live', done: false }], notes: '', files: [] },
      { id: 'P002', clientId: 'C002', name: 'ABC — Maintenance Portal', service: 'Web App', desc: 'Internal portal + monthly care.', value: 6800000, start: addDays(T, -30), deadline: addDays(T, -2), pm: 'U002', status: 'REVIEW', priority: 'MEDIUM', progress: 85, milestones: [{ t: 'Scope', done: true }, { t: 'Build', done: true }, { t: 'UAT', done: false }], notes: 'Slightly overdue UAT.', files: [] },
      { id: 'P003', clientId: 'C003', name: 'Skinnara — Landing + Booking', service: 'UI/UX + Development', desc: 'Landing page with treatment booking.', value: 7500000, start: addDays(T, -6), deadline: addDays(T, 14), pm: 'U002', status: 'DESIGN', priority: 'HIGH', progress: 30, milestones: [{ t: 'Wireframe', done: true }, { t: 'Hi-fi', done: false }, { t: 'Build', done: false }], notes: '', files: [] },
      { id: 'P004', clientId: 'C004', name: 'Amanah — Property Catalog', service: 'Website Development', desc: 'Catalog + WA lead capture.', value: 12500000, start: T, deadline: addDays(T, 30), pm: 'U002', status: 'PLANNING', priority: 'MEDIUM', progress: 5, milestones: [{ t: 'Kickoff', done: false }, { t: 'Sitemap', done: false }], notes: '', files: [] }
    ],
    tasks: [
      { id: 'T001', type: 'PROJECT', projectId: 'P001', title: 'Implement responsive navbar', assignee: 'U004', status: 'IN_PROGRESS', priority: 'HIGH', deadline: addDays(T, 4), progress: 60, notes: 'Mobile menu pending.', createdBy: 'U002', createdAt: addDays(T, -5) },
      { id: 'T002', type: 'PROJECT', projectId: 'P001', title: 'Homepage design', assignee: 'U003', status: 'DONE', priority: 'HIGH', deadline: addDays(T, -2), progress: 100, notes: '', createdBy: 'U002', createdAt: addDays(T, -11) },
      { id: 'T003', type: 'PROJECT', projectId: 'P001', title: 'Menu + WA ordering section', assignee: 'U004', status: 'TODO', priority: 'MEDIUM', deadline: addDays(T, 5), progress: 0, notes: '', createdBy: 'U002', createdAt: addDays(T, -3) },
      { id: 'T004', type: 'PROJECT', projectId: 'P002', title: 'UAT fixes batch 2', assignee: 'U007', status: 'IN_REVIEW', priority: 'URGENT', deadline: addDays(T, -1), progress: 90, notes: 'Blocked: client asset.', createdBy: 'U002', createdAt: addDays(T, -8) },
      { id: 'T005', type: 'PROJECT', projectId: 'P003', title: 'Wireframe booking flow', assignee: 'U003', status: 'DONE', priority: 'MEDIUM', deadline: addDays(T, -1), progress: 100, notes: '', createdBy: 'U002', createdAt: addDays(T, -6) },
      { id: 'T006', type: 'PROJECT', projectId: 'P003', title: 'Hi-fi landing design', assignee: 'U003', status: 'IN_PROGRESS', priority: 'HIGH', deadline: addDays(T, 3), progress: 40, notes: '', createdBy: 'U002', createdAt: addDays(T, -2) },
      { id: 'T007', type: 'ROUTINE', projectId: '', title: 'Content planning (weekly)', assignee: 'U006', status: 'TODO', priority: 'MEDIUM', deadline: addDays(T, 0), progress: 0, notes: 'Auto-generated routine.', createdBy: 'system', createdAt: T },
      { id: 'T008', type: 'CONTENT', projectId: '', title: 'Design Instagram Reel cover', assignee: 'U003', status: 'IN_PROGRESS', priority: 'MEDIUM', deadline: addDays(T, 1), progress: 50, notes: '', createdBy: 'U002', createdAt: T },
      { id: 'T009', type: 'MAINTENANCE', projectId: '', title: 'ABC monthly update + backup', assignee: 'U004', status: 'TODO', priority: 'MEDIUM', deadline: addDays(T, 4), progress: 0, notes: 'Linked M001.', createdBy: 'system', createdAt: T, maintenanceId: 'M001' },
      { id: 'T010', type: 'SALES', projectId: '', title: 'Follow up Skinnara proposal', assignee: 'U002', status: 'TODO', priority: 'HIGH', deadline: addDays(T, 2), progress: 0, notes: '', createdBy: 'U002', createdAt: T, leadId: 'L003' },
      { id: 'T011', type: 'INTERNAL', projectId: '', title: 'Weekly report compilation', assignee: 'U006', status: 'TODO', priority: 'LOW', deadline: addDays(T, 5), progress: 0, notes: '', createdBy: 'U002', createdAt: T },
      { id: 'T012', type: 'PROJECT', projectId: 'P002', title: 'Deploy to production', assignee: 'U007', status: 'BLOCKED', priority: 'HIGH', deadline: addDays(T, 2), progress: 20, notes: 'Waiting DNS.', createdBy: 'U002', createdAt: addDays(T, -4) }
    ],
    content: [
      { id: 'CT001', title: 'IG Reel — Behind the build: Kopi Nusa', kind: 'Reel', platform: 'Instagram', publishDate: addDays(T, 4), status: 'EDITING', designer: 'U003', editor: 'U005', reviewer: 'U002', publisher: 'U006', deadline: addDays(T, 3), notes: 'Hook: 3s menu reveal.', taskId: 'T008' },
      { id: 'CT002', title: 'Carousel — 5 signs you need a new website', kind: 'Carousel', platform: 'Instagram', publishDate: addDays(T, 1), status: 'REVIEW', designer: 'U003', editor: 'U006', reviewer: 'U002', publisher: 'U006', deadline: addDays(T, 0), notes: '', taskId: '' },
      { id: 'CT003', title: 'TikTok — Day in Dignify studio', kind: 'Video', platform: 'TikTok', publishDate: addDays(T, 6), status: 'PLANNING', designer: 'U005', editor: 'U005', reviewer: 'U002', publisher: 'U006', deadline: addDays(T, 5), notes: '', taskId: '' }
    ],
    maintenance: [
      { id: 'M001', clientId: 'C002', service: 'Website Maintenance', plan: 'Monthly', start: addDays(T, -60), intervalDays: 30, nextDue: addDays(T, 4), pic: 'U004', status: 'SCHEDULED', fee: 750000, payStatus: 'UNPAID', desc: 'Updates, backup, uptime check.', history: [{ date: addDays(T, -26), note: 'Aug cycle completed.' }] },
      { id: 'M002', clientId: 'C001', service: 'Content + Care', plan: 'Monthly', start: addDays(T, -10), intervalDays: 30, nextDue: addDays(T, 20), pic: 'U007', status: 'SCHEDULED', fee: 500000, payStatus: 'UNPAID', desc: 'Post-launch care.', history: [] },
      { id: 'M003', clientId: 'C002', service: 'Security patch', plan: 'One-time', start: addDays(T, -3), intervalDays: 0, nextDue: addDays(T, -1), pic: 'U007', status: 'OVERDUE', fee: 350000, payStatus: 'UNPAID', desc: 'Urgent patch.', history: [] }
    ],
    invoices: [
      { id: 'INV001', no: 'INV-023', clientId: 'C001', projectId: 'P001', amount: 4500000, paid: 2250000, status: 'PARTIAL', due: addDays(T, 7), date: addDays(T, -12), note: 'DP 50% paid.' },
      { id: 'INV002', no: 'INV-024', clientId: 'C002', projectId: 'P002', amount: 6800000, paid: 6800000, status: 'PAID', due: addDays(T, -5), date: addDays(T, -30), note: '' },
      { id: 'INV003', no: 'INV-025', clientId: 'C004', projectId: 'P004', amount: 12500000, paid: 0, status: 'SENT', due: addDays(T, 3), date: addDays(T, -1), note: 'DP invoice sent.' }
    ],
    expenses: [
      { id: 'E001', title: 'Domain + hosting (quarterly)', amount: 850000, date: addDays(T, -9), by: 'U001', cat: 'Infra' },
      { id: 'E002', title: 'Freelance illustration', amount: 600000, date: addDays(T, -4), by: 'U002', cat: 'Production' }
    ],
    recurring: [
      { id: 'R001', name: 'Content Planning', weekday: 1, title: 'Content planning (weekly)', assignee: 'U006', type: 'ROUTINE', active: true },
      { id: 'R002', name: 'Content Design', weekday: 2, title: 'Content design batch', assignee: 'U003', type: 'CONTENT', active: true },
      { id: 'R003', name: 'Video Editing', weekday: 3, title: 'Video editing batch', assignee: 'U005', type: 'CONTENT', active: true },
      { id: 'R004', name: 'Review', weekday: 4, title: 'Content review', assignee: 'U002', type: 'ROUTINE', active: true },
      { id: 'R005', name: 'Publishing', weekday: 5, title: 'Publishing + scheduling', assignee: 'U006', type: 'ROUTINE', active: true }
    ],
    roadmap: [
      { id: 'RD1', goal: 'Get 10 projects/month', milestone: 'Generate 100 qualified leads', target: addDays(T, 30), owner: 'U002', progress: 42, status: 'IN_PROGRESS' },
      { id: 'RD2', goal: 'Get 10 projects/month', milestone: 'Ship portfolio v2 + rate card', target: addDays(T, 45), owner: 'U003', progress: 70, status: 'IN_PROGRESS' },
      { id: 'RD3', goal: 'Recurring revenue 10jt/mo', milestone: '10 active maintenance contracts', target: addDays(T, 60), owner: 'U001', progress: 30, status: 'IN_PROGRESS' }
    ],
    ratecard: [
      { id: 'RC1', service: 'Company Profile Website', scope: '5–8 pages, responsive, WA CTA', price: 3500000, unit: 'project' },
      { id: 'RC2', service: 'Landing Page + Copywriting', scope: '1 page, high-convert', price: 2500000, unit: 'project' },
      { id: 'RC3', service: 'UI/UX Design (per flow)', scope: 'Wireframe + hi-fi + prototype', price: 2800000, unit: 'flow' },
      { id: 'RC4', service: 'Monthly Maintenance', scope: 'Update, backup, uptime', price: 750000, unit: 'month' },
      { id: 'RC5', service: 'Automation Setup', scope: 'Sheets / WA / reporting automation', price: 1800000, unit: 'project' }
    ],
    activity: [
      { id: 'ACT010', at: new Date().toISOString(), by: 'U003', text: 'completed Homepage Design', entity: 'T002' },
      { id: 'ACT009', at: new Date(Date.now() - 36e5).toISOString(), by: 'U002', text: 'assigned Responsive Navbar → Bima', entity: 'T001' },
      { id: 'ACT008', at: new Date(Date.now() - 72e5).toISOString(), by: 'system', text: 'added new lead Kopi Nusa', entity: 'L001' },
      { id: 'ACT007', at: new Date(Date.now() - 108e5).toISOString(), by: 'U001', text: 'recorded payment INV-024 (Rp6.800.000)', entity: 'INV002' }
    ],
    notifications: [
      { id: 'N001', to: 'U004', title: 'New task assigned', msg: 'Implement responsive navbar — due in 4 days.', type: 'task', entity: 'T001', at: new Date().toISOString(), read: false },
      { id: 'N002', to: 'U007', title: 'Task overdue', msg: 'Security patch (M003) is overdue.', type: 'overdue', entity: 'M003', at: new Date().toISOString(), read: false },
      { id: 'N003', to: 'U002', title: 'Follow-up due', msg: 'Skinnara Beauty proposal follow-up today.', type: 'sales', entity: 'L003', at: new Date().toISOString(), read: false }
    ],
    settings: {
      businessName: 'Dignify', currency: 'IDR', workdays: [1, 2, 3, 4, 5],
      notifRules: { taskAssigned: true, deadlineSoonDays: 2, overdueDaily: true, maintenanceSoonDays: 5, paymentOverdue: true },
      gasUrl: '', driveFolder: ''
    }
  }
}
