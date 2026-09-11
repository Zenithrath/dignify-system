import { addDays, todayISO } from '../lib/format'

const T = todayISO()

export const CRM_STAGES = [
  { key: 'DISCOVERED', label: 'Discovered', icon: 'Radar' },
  { key: 'CONTACTED', label: 'Contacted', icon: 'Phone' },
  { key: 'RESPONDED', label: 'Responded', icon: 'MessageCircle' },
  { key: 'FOLLOW_UP', label: 'Follow Up', icon: 'PhoneCall' },
  { key: 'BRIEF', label: 'Brief', icon: 'FileText' },
  { key: 'ANALYSIS', label: 'Analysis', icon: 'Search' },
  { key: 'SOLUTION', label: 'Solution', icon: 'Lightbulb' },
  { key: 'PROPOSAL', label: 'Proposal', icon: 'Send' },
  { key: 'NEGOTIATION', label: 'Negotiation', icon: 'Handshake' },
  { key: 'WON', label: 'Won', icon: 'Trophy' },
  { key: 'REJECTED', label: 'Rejected', icon: 'XCircle' }
]

export const STAGE_IDX = Object.fromEntries(CRM_STAGES.map((s, i) => [s.key, i]))

export function stageInfo(key) {
  return CRM_STAGES.find((s) => s.key === key) || CRM_STAGES[0]
}

export function nextStageKey(current) {
  const order = ['DISCOVERED', 'CONTACTED', 'RESPONDED', 'FOLLOW_UP', 'BRIEF', 'ANALYSIS', 'SOLUTION', 'PROPOSAL', 'NEGOTIATION', 'WON']
  const idx = order.indexOf(current)
  return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null
}

const SEED = [
  {
    id: 'OPP001', business: 'Kedai ABC', category: 'Restaurant', city: 'Malang', description: 'Kedai kopi & makanan ringan. Tempat nongkrong favorit anak muda Malang.',
    contact: { name: 'Budi Santoso', position: 'Owner', phone: '0812-3456-7890', email: 'budi@kedaiabc.id', instagram: '@kedaiabc' },
    industry: 'F&B', existingSystem: 'Manual ordering via WhatsApp', location: 'Jl. Merdeka No. 42, Malang',
    service: 'Website Company Profile', estimatedValue: 5000000, priority: 'HIGH', stage: 'BRIEF',
    owner: 'U002', pic: 'U002',
    contactDate: addDays(T, -12), respondedDate: addDays(T, -8), followUpDate: addDays(T, 1),
    nextAction: 'Brief meeting — discuss website structure', nextActionDate: addDays(T, 1), nextActionType: 'meeting',
    brief: {
      status: 'IN_PROGRESS',
      goals: 'Ingin website company profile yang menampilkan menu, cerita brand, dan reservasi online.',
      currentCondition: 'Belum punya website. Order via WhatsApp. Info bisnis hanya di Instagram.',
      problems: ['Tidak punya online presence selain IG', 'Order manual susah di-scale', 'Informasi bisnis tersebar'],
      requirements: 'Company profile 5 halaman, menu interaktif, WhatsApp CTA, responsive mobile',
      references: 'kedainusantara.com, kopitiam.co',
      budget: 'Rp 4.000.000 – 6.000.000', deadline: 'Akhir Oktober 2026',
      meetingDate: addDays(T, 1), meetingTime: '10:00', meetingMethod: 'Google Meet',
      notes: 'Budi ingin warna earthy tone. Website harus aksesibel dari mobile karena pelanggan mostly dari Instagram.'
    },
    analysis: null,
    proposals: [],
    activities: [
      { id: 'A001', type: 'PROSPECT', at: addDays(T, -15), by: 'U002', title: 'Prospect discovered', detail: 'Found via Google Maps — high rating, no website.' },
      { id: 'A002', type: 'CONTACT', at: addDays(T, -12), by: 'U002', title: 'Initial contact', detail: 'WhatsApp sent with portfolio link.', channel: 'WhatsApp' },
      { id: 'A003', type: 'RESPONSE', at: addDays(T, -8), by: 'U002', title: 'Client responded', detail: 'Interested in company profile. Asked about pricing.', channel: 'WhatsApp' },
      { id: 'A004', type: 'MEETING', at: addDays(T, -5), by: 'U002', title: 'Discovery call', detail: 'Discussed goals, menu system, brand story.' },
      { id: 'A005', type: 'BRIEF', at: addDays(T, -2), by: 'U002', title: 'Brief meeting scheduled', detail: 'Meeting set for brief discussion on website structure.' }
    ],
    notes: [
      { id: 'N001', text: 'Budi prefers earthy tones. Mentioned competitor site kedainusantara.com as reference.', by: 'U002', at: addDays(T, -5) }
    ],
    team: [{ userId: 'U002', role: 'PIC' }],
    tags: ['Restaurant', 'Website', 'Malang', 'Priority High'],
    files: []
  },
  {
    id: 'OPP002', business: 'Studio XYZ', category: 'Creative Studio', city: 'Surabaya', description: 'Boutique creative studio — branding, desain grafis, dan video production.',
    contact: { name: 'Andi Pratama', position: 'Creative Director', phone: '0856-1234-5678', email: 'andi@studioxyz.co', instagram: '@studioxyz' },
    industry: 'Creative', existingSystem: 'Website lama ( WordPress, belum update 2 tahun)', location: 'Jl. Raya Darmo No. 88, Surabaya',
    service: 'Website Portfolio + Booking System', estimatedValue: 8000000, priority: 'HIGH', stage: 'ANALYSIS',
    owner: 'U002', pic: 'U002',
    contactDate: addDays(T, -20), respondedDate: addDays(T, -16), followUpDate: addDays(T, -3),
    nextAction: 'Send analysis for approval', nextActionDate: addDays(T, 0), nextActionType: 'approval',
    brief: {
      status: 'COMPLETE',
      goals: 'Portfolio modern yang bisa menerima booking project dari klien baru.',
      currentCondition: 'Website WordPress lama, tidak mobile-friendly, susah update.',
      problems: ['Website tidak update', 'Tidak ada booking system', 'Portfolio susah diakses'],
      requirements: 'Portfolio gallery, project showcase, booking form, CMS untuk update',
      references: 'behance.net, dribbble.com',
      budget: 'Rp 7.000.000 – 9.000.000', deadline: 'November 2026',
      meetingDate: addDays(T, -10), meetingTime: '14:00', meetingMethod: 'On-site',
      notes: 'Andi want dark theme with bold typography. Portfolio should show video reels.'
    },
    analysis: {
      status: 'DRAFT',
      problemsIdentified: ['Website tidak mobile-friendly', 'Tidak ada sistem booking', 'CMS sudah usang'],
      solution: 'Portfolio website modern dengan booking system. Next.js + headless CMS.',
      scope: ['Design & branding refresh', 'Portfolio gallery with video', 'Booking system', 'CMS integration', 'Mobile responsive', 'SEO optimization'],
      deliverables: ['Figma design files', 'Production website', 'Admin CMS', 'Documentation'],
      timeline: '6–8 weeks', price: 8000000,
      paymentTerms: 'DP 50%, Pelunasan saat UAT',
      risks: 'Video files besar — perlu CDN. Client harus provide aset tepat waktu.',
      preparedBy: 'U002'
    },
    proposals: [],
    activities: [
      { id: 'A006', type: 'PROSPECT', at: addDays(T, -25), by: 'U002', title: 'Prospect discovered', detail: 'Referral from existing network.' },
      { id: 'A007', type: 'CONTACT', at: addDays(T, -20), by: 'U002', title: 'Initial contact', detail: 'Email sent with portfolio.', channel: 'Email' },
      { id: 'A008', type: 'RESPONSE', at: addDays(T, -16), by: 'U002', title: 'Client responded', detail: 'Very interested. Wants to discuss.', channel: 'Email' },
      { id: 'A009', type: 'MEETING', at: addDays(T, -10), by: 'U002', title: 'On-site meeting', detail: 'Full brief discussion. Client ready to proceed.' },
      { id: 'A010', type: 'BRIEF', at: addDays(T, -7), by: 'U002', title: 'Brief completed', detail: 'All requirements captured.' },
      { id: 'A011', type: 'ANALYSIS', at: addDays(T, -2), by: 'U002', title: 'Analysis draft created', detail: 'Scope, timeline, and pricing prepared.' }
    ],
    notes: [],
    team: [{ userId: 'U002', role: 'PIC' }, { userId: 'U003', role: 'Designer' }],
    tags: ['Creative', 'Surabaya', 'High Value'],
    files: []
  },
  {
    id: 'OPP003', business: 'Toko Sinar', category: 'Retail', city: 'Malang', description: 'Toko retail aksesoris gadget & elektronik.',
    contact: { name: 'Rina Wulandari', position: 'Manager', phone: '0878-9012-3456', email: 'rina@tokosinar.id', instagram: '@tokosinar' },
    industry: 'Retail', existingSystem: 'Toko fisik, belum ada online presence', location: 'Jl. Basuki Rahmat No. 15, Malang',
    service: 'E-commerce Landing Page', estimatedValue: 4500000, priority: 'MEDIUM', stage: 'PROPOSAL',
    owner: 'U006', pic: 'U002',
    contactDate: addDays(T, -25), respondedDate: addDays(T, -20), followUpDate: addDays(T, 0),
    nextAction: 'Follow up proposal sent', nextActionDate: addDays(T, 0), nextActionType: 'followup',
    brief: { status: 'COMPLETE', goals: 'Jualan online via landing page dengan WhatsApp order.', currentCondition: 'Toko fisik ramai, tapi belum ada online.', problems: ['Belum ada penjualan online', 'Kompetitor sudah mulai online'], requirements: 'Landing page katalog + WA order', references: 'tokopedia, shopee', budget: 'Rp 4.000.000 – 5.000.000', deadline: 'Oktober 2026', meetingDate: addDays(T, -15), meetingTime: '09:00', meetingMethod: 'WhatsApp Call', notes: 'Rina wants something simple. Focus on product showcase + direct WhatsApp.' },
    analysis: { status: 'APPROVED', problemsIdentified: ['No online sales channel', 'Competitor already online'], solution: 'Product catalog landing page with direct WhatsApp ordering.', scope: ['Product catalog', 'WhatsApp CTA', 'Mobile responsive', 'SEO'], deliverables: ['Figma design', 'Production landing page', 'Analytics setup'], timeline: '3–4 weeks', price: 4500000, paymentTerms: 'DP 50%, Pelunasan saat go live', risks: 'Client harus foto produk sendiri.', preparedBy: 'U002' },
    proposals: [
      { id: 'PROP001', version: 1, title: 'Toko Sinar — E-commerce Landing', status: 'SENT', amount: 4500000, sentAt: addDays(T, -1), validUntil: addDays(T, 13), template: 'standard', createdAt: addDays(T, -1), createdBy: 'U002', notes: 'Sent via email + WhatsApp.' }
    ],
    activities: [
      { id: 'A012', type: 'PROSPECT', at: addDays(T, -30), by: 'U006', title: 'Prospect discovered', detail: 'Google Maps scraping.' },
      { id: 'A013', type: 'CONTACT', at: addDays(T, -25), by: 'U006', title: 'Initial contact', detail: 'Instagram DM.', channel: 'Instagram' },
      { id: 'A014', type: 'RESPONSE', at: addDays(T, -20), by: 'U006', title: 'Client responded', detail: 'Interested, wants pricing.', channel: 'Instagram' },
      { id: 'A015', type: 'MEETING', at: addDays(T, -15), by: 'U002', title: 'Discovery call', detail: 'Discussed needs and budget.', channel: 'WhatsApp' },
      { id: 'A016', type: 'BRIEF', at: addDays(T, -10), by: 'U002', title: 'Brief completed', detail: 'Requirements documented.' },
      { id: 'A017', type: 'ANALYSIS', at: addDays(T, -6), by: 'U002', title: 'Analysis approved', detail: 'Internal approval received.' },
      { id: 'A018', type: 'PROPOSAL', at: addDays(T, -1), by: 'U002', title: 'Proposal sent', detail: 'Proposal v1 sent via email.', channel: 'Email' }
    ],
    notes: [
      { id: 'N002', text: 'Rina prefers WhatsApp communication. Avoid calling.', by: 'U006', at: addDays(T, -20) }
    ],
    team: [{ userId: 'U002', role: 'PIC' }, { userId: 'U006', role: 'Researcher' }],
    tags: ['Retail', 'Malang', 'Landing Page'],
    files: []
  },
  {
    id: 'OPP004', business: 'Klinik Sehat', category: 'Healthcare', city: 'Malang', description: 'Klinik umum & gigi. Sudah berjalan 10 tahun.',
    contact: { name: 'dr. Agus Pratono', position: 'Director', phone: '0813-6789-0123', email: 'agus@kliniksehat.co', instagram: '@kliniksehat' },
    industry: 'Healthcare', existingSystem: 'Website sederhana (one page, tidak update)', location: 'Jl. Soekarno Hatta No. 30, Malang',
    service: 'Website + Booking System', estimatedValue: 12000000, priority: 'HIGH', stage: 'RESPONDED',
    owner: 'U002', pic: 'U002',
    contactDate: addDays(T, -8), respondedDate: addDays(T, -4), followUpDate: addDays(T, 2),
    nextAction: 'Schedule discovery meeting', nextActionDate: addDays(T, 2), nextActionType: 'meeting',
    brief: null, analysis: null, proposals: [],
    activities: [
      { id: 'A019', type: 'PROSPECT', at: addDays(T, -12), by: 'U002', title: 'Prospect discovered', detail: 'Referred by existing client.' },
      { id: 'A020', type: 'CONTACT', at: addDays(T, -8), by: 'U002', title: 'Initial contact', detail: 'WhatsApp sent.', channel: 'WhatsApp' },
      { id: 'A021', type: 'RESPONSE', at: addDays(T, -4), by: 'U002', title: 'Client responded', detail: 'Very interested. Wants to meet.', channel: 'WhatsApp' }
    ],
    notes: [],
    team: [{ userId: 'U002', role: 'PIC' }],
    tags: ['Healthcare', 'Malang', 'High Value', 'Booking'],
    files: []
  },
  {
    id: 'OPP005', business: 'Ruang Tumbuh', category: 'Education', city: 'Batu', description: 'Lembaga bimbingan belajar & kursus kreatif untuk anak.',
    contact: { name: 'Sari Dewi', position: 'Founder', phone: '0821-4567-8901', email: 'sari@ruangtumbuh.id', instagram: '@ruangtumbuh' },
    industry: 'Education', existingSystem: 'Manual registration via Google Forms', location: 'Jl. Sultan Agung No. 12, Batu',
    service: 'Landing Page + Sistem Pendaftaran', estimatedValue: 7500000, priority: 'MEDIUM', stage: 'FOLLOW_UP',
    owner: 'U006', pic: 'U002',
    contactDate: addDays(T, -18), respondedDate: addDays(T, -12), followUpDate: addDays(T, 0),
    nextAction: 'Follow up after initial call', nextActionDate: T, nextActionType: 'followup',
    brief: null, analysis: null, proposals: [],
    activities: [
      { id: 'A022', type: 'PROSPECT', at: addDays(T, -22), by: 'U006', title: 'Prospect discovered', detail: 'Instagram ad lead.' },
      { id: 'A023', type: 'CONTACT', at: addDays(T, -18), by: 'U006', title: 'Initial contact', detail: 'Instagram DM.', channel: 'Instagram' },
      { id: 'A024', type: 'RESPONSE', at: addDays(T, -12), by: 'U006', title: 'Client responded', detail: 'Wants landing page + registration system.', channel: 'Instagram' }
    ],
    notes: [
      { id: 'N003', text: 'Sari mentioned budget is flexible if the system saves time on registration.', by: 'U006', at: addDays(T, -12) }
    ],
    team: [{ userId: 'U006', role: 'PIC' }],
    tags: ['Education', 'Batu', 'Landing Page'],
    files: []
  },
  {
    id: 'OPP006', business: 'PT Maju Bersama', category: 'Manufacturing', city: 'Surabaya', description: 'Perusahaan manufaktur suku cadang otomotif. 200+ karyawan.',
    contact: { name: 'Pak Hendra Wijaya', position: 'Operations Director', phone: '0815-6789-0123', email: 'hendra@ptmaju.co.id', instagram: '' },
    industry: 'Manufacturing', existingSystem: 'ERP custom, website profile usang', location: 'Jl. Rungkut Industri No. 5, Surabaya',
    service: 'Corporate Website Redesign', estimatedValue: 15000000, priority: 'URGENT', stage: 'NEGOTIATION',
    owner: 'U002', pic: 'U002',
    contactDate: addDays(T, -35), respondedDate: addDays(T, -28), followUpDate: addDays(T, 0),
    nextAction: 'Negotiate final terms — close this week', nextActionDate: T, nextActionType: 'negotiation',
    brief: { status: 'COMPLETE', goals: 'Corporate website profesional untuk B2B. Showcase products, certifications, and factory tour.', currentCondition: 'Website usang, tidak mencerminkan skala bisnis.', problems: ['Website tidak profesional', 'B2B clients can\'t find product catalog', 'Outdated certifications display'], requirements: 'Corporate website, product catalog, PDF download, multilingual', references: 'toyota.co.id, astramotor.co.id', budget: 'Rp 13.000.000 – 17.000.000', deadline: 'Desember 2026', meetingDate: addDays(T, -20), meetingTime: '13:00', meetingMethod: 'On-site', notes: 'Hendra is very detail-oriented. Need to show certifications prominently.' },
    analysis: { status: 'APPROVED', problemsIdentified: ['Website outdated', 'No product catalog', 'No B2B features'], solution: 'Modern corporate website with product catalog and document download.', scope: ['Corporate website redesign', 'Product catalog system', 'Certification showcase', 'Factory tour gallery', 'Contact/inquiry form', 'Multilingual support'], deliverables: ['Design system', 'Production website', 'Admin CMS', 'Product upload training'], timeline: '10–12 weeks', price: 15000000, paymentTerms: 'DP 30%, Milestone 30%, UAT 20%, Go-live 20%', risks: 'Client procurement process slow. Need internal approval.', preparedBy: 'U002' },
    proposals: [
      { id: 'PROP002', version: 1, title: 'PT Maju — Corporate Website v1', status: 'REJECTED', amount: 14000000, sentAt: addDays(T, -12), validUntil: addDays(T, -5), template: 'enterprise', createdAt: addDays(T, -12), createdBy: 'U002', notes: 'First proposal — budget too high.' },
      { id: 'PROP003', version: 2, title: 'PT Maju — Corporate Website v2', status: 'NEGOTIATION', amount: 15000000, sentAt: addDays(T, -3), validUntil: addDays(T, 10), template: 'enterprise', createdAt: addDays(T, -3), createdBy: 'U002', notes: 'Revised scope. Client reviewing.' }
    ],
    activities: [
      { id: 'A025', type: 'PROSPECT', at: addDays(T, -40), by: 'U002', title: 'Prospect discovered', detail: 'Corporate referral from PT Sejahtera.' },
      { id: 'A026', type: 'CONTACT', at: addDays(T, -35), by: 'U002', title: 'Initial contact', detail: 'Email to Operations Director.', channel: 'Email' },
      { id: 'A027', type: 'RESPONSE', at: addDays(T, -28), by: 'U002', title: 'Client responded', detail: 'Interested. Scheduled on-site meeting.', channel: 'Email' },
      { id: 'A028', type: 'MEETING', at: addDays(T, -20), by: 'U002', title: 'On-site meeting', detail: 'Full brief + factory tour. Very detailed requirements.' },
      { id: 'A029', type: 'BRIEF', at: addDays(T, -15), by: 'U002', title: 'Brief completed', detail: 'Comprehensive brief documented.' },
      { id: 'A030', type: 'ANALYSIS', at: addDays(T, -10), by: 'U002', title: 'Analysis approved', detail: 'Internal approval received. Pricing locked.' },
      { id: 'A031', type: 'PROPOSAL', at: addDays(T, -12), by: 'U002', title: 'Proposal v1 sent', detail: 'First proposal sent via email.', channel: 'Email' },
      { id: 'A032', type: 'PROPOSAL', at: addDays(T, -5), by: 'U002', title: 'Proposal v1 rejected', detail: 'Client says budget too high.' },
      { id: 'A033', type: 'PROPOSAL', at: addDays(T, -3), by: 'U002', title: 'Proposal v2 sent', detail: 'Revised proposal with adjusted scope.', channel: 'Email' }
    ],
    notes: [
      { id: 'N004', text: 'Hendra is very detail-oriented. He will compare us with 2 other agencies. Need to be thorough.', by: 'U002', at: addDays(T, -20) },
      { id: 'N005', text: 'Client procurement requires 3 proposals from different vendors. We are one of them.', by: 'U002', at: addDays(T, -10) }
    ],
    team: [{ userId: 'U002', role: 'PIC' }],
    tags: ['Manufacturing', 'Surabaya', 'Enterprise', 'Urgent'],
    files: []
  },
  {
    id: 'OPP007', business: 'Bloom Coffee', category: 'Cafe', city: 'Malang', description: 'Specialty coffee shop. Third wave coffee di Malang.',
    contact: { name: 'Fajar Nugroho', position: 'Owner', phone: '0857-2345-6789', email: 'fajar@bloomcoffee.id', instagram: '@bloomcoffee' },
    industry: 'F&B', existingSystem: 'Website dari template, tidak dikelola', location: 'Jl. Ijen No. 7, Malang',
    service: 'Website + Menu System', estimatedValue: 6000000, priority: 'LOW', stage: 'REJECTED',
    owner: 'U002', pic: 'U002',
    contactDate: addDays(T, -45), respondedDate: addDays(T, -38), followUpDate: addDays(T, 30),
    nextAction: 'Reopen in 1 month — budget currently allocated elsewhere', nextActionDate: addDays(T, 30), nextActionType: 'followup',
    brief: { status: 'COMPLETE', goals: 'Website untuk menu, events, dan reservasi area.', currentCondition: 'Template website, tidak update.', problems: ['Website tidak menunjukkan brand', 'Menu tidak bisa di-update'], requirements: 'Menu system, event page, reservation', references: '', budget: 'Rp 5.000.000 – 7.000.000', deadline: '', meetingDate: addDays(T, -30), meetingTime: '11:00', meetingMethod: 'WhatsApp Call', notes: '' },
    analysis: { status: 'APPROVED', problemsIdentified: ['Template website outdated', 'Menu not manageable'], solution: 'Custom website with menu CMS.', scope: ['Website redesign', 'Menu system', 'Event page', 'Reservation form'], deliverables: ['Design', 'Website', 'CMS'], timeline: '4–5 weeks', price: 6000000, paymentTerms: 'DP 50%', risks: '', preparedBy: 'U002' },
    proposals: [
      { id: 'PROP004', version: 1, title: 'Bloom Coffee — Website + Menu', status: 'REJECTED', amount: 6000000, sentAt: addDays(T, -8), validUntil: addDays(T, -1), template: 'standard', createdAt: addDays(T, -8), createdBy: 'U002', notes: 'Client says budget allocated to equipment purchase.' }
    ],
    activities: [
      { id: 'A034', type: 'PROSPECT', at: addDays(T, -50), by: 'U002', title: 'Prospect discovered', detail: 'Instagram visit.' },
      { id: 'A035', type: 'CONTACT', at: addDays(T, -45), by: 'U002', title: 'Initial contact', detail: 'Instagram DM.', channel: 'Instagram' },
      { id: 'A036', type: 'RESPONSE', at: addDays(T, -38), by: 'U002', title: 'Client responded', detail: 'Interested but tight timeline.', channel: 'Instagram' },
      { id: 'A037', type: 'MEETING', at: addDays(T, -30), by: 'U002', title: 'Phone call', detail: 'Full discussion about needs.', channel: 'WhatsApp' },
      { id: 'A038', type: 'BRIEF', at: addDays(T, -20), by: 'U002', title: 'Brief completed', detail: 'All requirements captured.' },
      { id: 'A039', type: 'ANALYSIS', at: addDays(T, -12), by: 'U002', title: 'Analysis approved', detail: 'Ready to propose.' },
      { id: 'A040', type: 'PROPOSAL', at: addDays(T, -8), by: 'U002', title: 'Proposal sent', detail: 'Sent via email.', channel: 'Email' },
      { id: 'A041', type: 'REJECTION', at: addDays(T, -1), by: 'U002', title: 'Proposal rejected', detail: 'Budget allocated to equipment. May revisit next quarter.' }
    ],
    notes: [
      { id: 'N006', text: 'Fajar said they will revisit in Q1 2027 after equipment purchase.', by: 'U002', at: addDays(T, -1) }
    ],
    team: [{ userId: 'U002', role: 'PIC' }],
    tags: ['Cafe', 'Malang', 'Rejected — Budget'],
    files: []
  },
  {
    id: 'OPP008', business: 'Cahaya Edu', category: 'Education', city: 'Malang', description: 'Lembaga kursus persiapan SNBT & SBMPTN.',
    contact: { name: 'Dimas Aditya', position: 'Director', phone: '0819-8765-4321', email: 'dimas@cayahaidu.com', instagram: '@cahayaedu' },
    industry: 'Education', existingSystem: 'Instagram + WhatsApp groups', location: 'Jl. Tlogo Indah No. 20, Malang',
    service: 'Landing Page + Registration System', estimatedValue: 4000000, priority: 'MEDIUM', stage: 'RESPONDED',
    owner: 'U006', pic: 'U006',
    contactDate: addDays(T, -10), respondedDate: addDays(T, -6), followUpDate: addDays(T, 3),
    nextAction: 'Schedule meeting to discuss registration flow', nextActionDate: addDays(T, 3), nextActionType: 'meeting',
    brief: null, analysis: null, proposals: [],
    activities: [
      { id: 'A042', type: 'PROSPECT', at: addDays(T, -14), by: 'U006', title: 'Prospect discovered', detail: 'Google Maps scraping.' },
      { id: 'A043', type: 'CONTACT', at: addDays(T, -10), by: 'U006', title: 'Initial contact', detail: 'WhatsApp.', channel: 'WhatsApp' },
      { id: 'A044', type: 'RESPONSE', at: addDays(T, -6), by: 'U006', title: 'Client responded', detail: 'Very interested. Wants online registration.', channel: 'WhatsApp' }
    ],
    notes: [],
    team: [{ userId: 'U006', role: 'PIC' }],
    tags: ['Education', 'Malang', 'Landing Page'],
    files: []
  },
  {
    id: 'OPP009', business: 'Dapur Nenek', category: 'F&B', city: 'Malang', description: 'Rumah makan tradisional Jawa. Resep turun-temurun.',
    contact: { name: 'Ibu Kartini', position: 'Owner', phone: '0852-3456-7890', email: 'kartini@dapurnenek.id', instagram: '@dapurnenek' },
    industry: 'F&B', existingSystem: 'Belum ada digital presence', location: 'Jl. Kahuripan No. 8, Malang',
    service: 'Instagram Content + Simple Website', estimatedValue: 3500000, priority: 'LOW', stage: 'CONTACTED',
    owner: 'U006', pic: 'U006',
    contactDate: addDays(T, -5), respondedDate: '', followUpDate: addDays(T, 1),
    nextAction: 'Follow up — no response yet', nextActionDate: addDays(T, 1), nextActionType: 'followup',
    brief: null, analysis: null, proposals: [],
    activities: [
      { id: 'A045', type: 'PROSPECT', at: addDays(T, -8), by: 'U006', title: 'Prospect discovered', detail: 'Google Maps scraping.' },
      { id: 'A046', type: 'CONTACT', at: addDays(T, -5), by: 'U006', title: 'Initial contact', detail: 'WhatsApp sent.', channel: 'WhatsApp' }
    ],
    notes: [
      { id: 'N007', text: 'Ibu Kartini不太懂 teknologi. Communication via WhatsApp with simple language.', by: 'U006', at: addDays(T, -5) }
    ],
    team: [{ userId: 'U006', role: 'PIC' }],
    tags: ['F&B', 'Malang', 'Instagram'],
    files: []
  },
  {
    id: 'OPP010', business: 'Resto Santai', category: 'Restaurant', city: 'Batu', description: 'Restoran keluarga dengan view pegunungan.',
    contact: { name: 'Rudi Hermawan', position: 'Owner', phone: '0818-7654-3210', email: 'rudi@restosantai.com', instagram: '@restosantai' },
    industry: 'F&B', existingSystem: 'Website dari 2019, tidak diupdate', location: 'Jl. Arumdalu No. 3, Batu',
    service: 'Website + Reservasi System', estimatedValue: 6000000, priority: 'MEDIUM', stage: 'ANALYSIS',
    owner: 'U002', pic: 'U002',
    contactDate: addDays(T, -22), respondedDate: addDays(T, -16), followUpDate: addDays(T, 4),
    nextAction: 'Complete analysis draft', nextActionDate: addDays(T, 4), nextActionType: 'analysis',
    brief: { status: 'COMPLETE', goals: 'Website modern dengan sistem reservasi online.', currentCondition: 'Website usang dari 2019. Tidak mobile-friendly.', problems: ['Website tidak responsive', 'Reservasi masih via telepon', 'Menu tidak bisa di-update'], requirements: 'Menu, reservation, gallery, WhatsApp integration', references: 'ondergren.com, café-xyz.com', budget: 'Rp 5.000.000 – 7.000.000', deadline: 'November 2026', meetingDate: addDays(T, -12), meetingTime: '15:00', meetingMethod: 'On-site', notes: 'View pegunungan adalah selling point utama. Photo gallery harus bagus.' },
    analysis: null, proposals: [],
    activities: [
      { id: 'A047', type: 'PROSPECT', at: addDays(T, -28), by: 'U002', title: 'Prospect discovered', detail: 'Client referral.' },
      { id: 'A048', type: 'CONTACT', at: addDays(T, -22), by: 'U002', title: 'Initial contact', detail: 'WhatsApp.', channel: 'WhatsApp' },
      { id: 'A049', type: 'RESPONSE', at: addDays(T, -16), by: 'U002', title: 'Client responded', detail: 'Very interested. Wants to meet.', channel: 'WhatsApp' },
      { id: 'A050', type: 'MEETING', at: addDays(T, -12), by: 'U002', title: 'On-site meeting', detail: 'Full brief at restaurant. Beautiful view.' },
      { id: 'A051', type: 'BRIEF', at: addDays(T, -8), by: 'U002', title: 'Brief completed', detail: 'All requirements captured.' },
      { id: 'A052', type: 'ANALYSIS', at: addDays(T, -2), by: 'U002', title: 'Analysis in progress', detail: 'Working on scope and pricing.' }
    ],
    notes: [
      { id: 'N008', text: 'Rudi wants the website to feel as warm as the restaurant. Earthy tones, lots of photos.', by: 'U002', at: addDays(T, -12) }
    ],
    team: [{ userId: 'U002', role: 'PIC' }, { userId: 'U003', role: 'Designer' }],
    tags: ['Restaurant', 'Batu', 'Reservation', 'Gallery'],
    files: []
  }
]

export const PROSPECT_STATUSES = [
  { key: 'NEW', label: 'New', color: 'slate' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'blue' },
  { key: 'READY', label: 'Ready to Contact', color: 'cyan' },
  { key: 'CONTACTED', label: 'Contacted', color: 'amber' },
  { key: 'RESPONDED', label: 'Responded', color: 'emerald' },
  { key: 'CONVERTED', label: 'Converted', color: 'green' },
  { key: 'NOT_RELEVANT', label: 'Not Relevant', color: 'gray' },
  { key: 'DO_NOT_CONTACT', label: 'Do Not Contact', color: 'red' }
]

export const PROSPECT_SOURCES = ['Scraped', 'Manual', 'Imported', 'Inbound', 'Referral']

export const CLIENT_STATUSES = [
  { key: 'ACTIVE', label: 'Active', color: 'emerald' },
  { key: 'INACTIVE', label: 'Inactive', color: 'gray' },
  { key: 'MAINTENANCE', label: 'Maintenance', color: 'amber' },
  { key: 'COMPLETED', label: 'Completed', color: 'blue' }
]

const PROSPECT_SEED = [
  {
    id: 'PR001', business: 'Kedai ABC', category: 'Restaurant', city: 'Malang', industry: 'F&B',
    location: 'Jl. Merdeka No. 42, Malang',
    contact: { name: 'Budi Santoso', position: 'Owner', phone: '0812-3456-7890', email: 'budi@kedaiabc.id', instagram: '@kedaiabc' },
    website: '', instagram: '@kedaiabc', tiktok: '', whatsapp: '0812-3456-7890',
    source: 'Scraped', status: 'CONVERTED', potential: 85, owner: 'U002',
    whyApproach: ['No website detected', 'Active Instagram account', 'Strong review count', 'F&B category fits DIGNIFY services'],
    recommendedService: 'Website Company Profile',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -12),
    activities: [
      { id: 'PA001', type: 'DISCOVERY', at: addDays(T, -20), by: 'U002', title: 'Prospect discovered', detail: 'Google Maps scraping — high rating, no website.' },
      { id: 'PA002', type: 'QUALIFIED', at: addDays(T, -18), by: 'U002', title: 'Qualified', detail: 'Instagram active, review count strong, no website.' },
      { id: 'PA003', type: 'CONVERTED', at: addDays(T, -12), by: 'U002', title: 'Converted to opportunity', detail: 'Created OPP001.' }
    ],
    notes: [{ id: 'PN001', text: 'Good potential. Active Instagram with 2k+ followers.', by: 'U002', at: addDays(T, -18) }],
    tags: ['F&B', 'Malang', 'Website'], createdAt: addDays(T, -20)
  },
  {
    id: 'PR002', business: 'Studio XYZ', category: 'Creative Studio', city: 'Surabaya', industry: 'Creative',
    location: 'Jl. Raya Darmo No. 88, Surabaya',
    contact: { name: 'Andi Pratama', position: 'Creative Director', phone: '0856-1234-5678', email: 'andi@studioxyz.co', instagram: '@studioxyz' },
    website: 'studioxyz.co (WordPress, outdated)', instagram: '@studioxyz', tiktok: '', whatsapp: '0856-1234-5678',
    source: 'Referral', status: 'CONVERTED', potential: 90, owner: 'U002',
    whyApproach: ['Existing website outdated', 'Active portfolio needs modern showcase', 'Referral from network'],
    recommendedService: 'Website Portfolio + Booking System',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -20),
    activities: [
      { id: 'PA004', type: 'DISCOVERY', at: addDays(T, -30), by: 'U002', title: 'Prospect discovered', detail: 'Referral from existing network.' },
      { id: 'PA005', type: 'QUALIFIED', at: addDays(T, -28), by: 'U002', title: 'Qualified', detail: 'Website outdated, needs modern portfolio.' },
      { id: 'PA006', type: 'CONVERTED', at: addDays(T, -20), by: 'U002', title: 'Converted to opportunity', detail: 'Created OPP002.' }
    ],
    notes: [], tags: ['Creative', 'Surabaya', 'High Value'], createdAt: addDays(T, -30)
  },
  {
    id: 'PR003', business: 'Toko Sinar', category: 'Retail', city: 'Malang', industry: 'Retail',
    location: 'Jl. Basuki Rahmat No. 15, Malang',
    contact: { name: 'Rina Wulandari', position: 'Manager', phone: '0878-9012-3456', email: 'rina@tokosinar.id', instagram: '@tokosinar' },
    website: '', instagram: '@tokosinar', tiktok: '@tokosinar', whatsapp: '0878-9012-3456',
    source: 'Scraped', status: 'CONVERTED', potential: 70, owner: 'U006',
    whyApproach: ['No website', 'Active Instagram + TikTok', 'Retail category needs online presence'],
    recommendedService: 'E-commerce Landing Page',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -25),
    activities: [
      { id: 'PA007', type: 'DISCOVERY', at: addDays(T, -35), by: 'U006', title: 'Prospect discovered', detail: 'Google Maps scraping.' },
      { id: 'PA008', type: 'QUALIFIED', at: addDays(T, -33), by: 'U006', title: 'Qualified', detail: 'No website, active social media.' },
      { id: 'PA009', type: 'CONVERTED', at: addDays(T, -25), by: 'U006', title: 'Converted to opportunity', detail: 'Created OPP003.' }
    ],
    notes: [], tags: ['Retail', 'Malang', 'TikTok'], createdAt: addDays(T, -35)
  },
  {
    id: 'PR004', business: 'Klinik Sehat', category: 'Healthcare', city: 'Malang', industry: 'Healthcare',
    location: 'Jl. Soekarno Hatta No. 30, Malang',
    contact: { name: 'dr. Agus Pratono', position: 'Director', phone: '0813-6789-0123', email: 'agus@kliniksehat.co', instagram: '@kliniksehat' },
    website: 'kliniksehat.co (one page, outdated)', instagram: '@kliniksehat', tiktok: '', whatsapp: '0813-6789-0123',
    source: 'Referral', status: 'CONVERTED', potential: 88, owner: 'U002',
    whyApproach: ['Outdated website', 'Healthcare needs booking system', 'High-value client'],
    recommendedService: 'Website + Booking System',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -8),
    activities: [
      { id: 'PA010', type: 'DISCOVERY', at: addDays(T, -15), by: 'U002', title: 'Prospect discovered', detail: 'Referred by existing client.' },
      { id: 'PA011', type: 'QUALIFIED', at: addDays(T, -13), by: 'U002', title: 'Qualified', detail: 'Outdated website, needs booking system.' },
      { id: 'PA012', type: 'CONVERTED', at: addDays(T, -8), by: 'U002', title: 'Converted to opportunity', detail: 'Created OPP004.' }
    ],
    notes: [], tags: ['Healthcare', 'Malang', 'Booking'], createdAt: addDays(T, -15)
  },
  {
    id: 'PR005', business: 'Ruang Tumbuh', category: 'Education', city: 'Batu', industry: 'Education',
    location: 'Jl. Sultan Agung No. 12, Batu',
    contact: { name: 'Sari Dewi', position: 'Founder', phone: '0821-4567-8901', email: 'sari@ruangtumbuh.id', instagram: '@ruangtumbuh' },
    website: '', instagram: '@ruangtumbuh', tiktok: '@ruangtumbuh', whatsapp: '0821-4567-8901',
    source: 'Inbound', status: 'CONVERTED', potential: 75, owner: 'U006',
    whyApproach: ['No website', 'Active social media', 'Education sector needs registration system'],
    recommendedService: 'Landing Page + Sistem Pendaftaran',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -18),
    activities: [
      { id: 'PA013', type: 'DISCOVERY', at: addDays(T, -25), by: 'U006', title: 'Prospect discovered', detail: 'Instagram ad lead.' },
      { id: 'PA014', type: 'QUALIFIED', at: addDays(T, -23), by: 'U006', title: 'Qualified', detail: 'No website, needs registration system.' },
      { id: 'PA015', type: 'CONVERTED', at: addDays(T, -18), by: 'U006', title: 'Converted to opportunity', detail: 'Created OPP005.' }
    ],
    notes: [], tags: ['Education', 'Batu', 'Landing Page'], createdAt: addDays(T, -25)
  },
  {
    id: 'PR006', business: 'PT Maju Bersama', category: 'Manufacturing', city: 'Surabaya', industry: 'Manufacturing',
    location: 'Jl. Rungkut Industri No. 5, Surabaya',
    contact: { name: 'Pak Hendra Wijaya', position: 'Operations Director', phone: '0815-6789-0123', email: 'hendra@ptmaju.co.id', instagram: '' },
    website: 'ptmaju.co.id (outdated)', instagram: '', tiktok: '', whatsapp: '0815-6789-0123',
    source: 'Referral', status: 'CONVERTED', potential: 95, owner: 'U002',
    whyApproach: ['Outdated corporate website', 'Large enterprise (200+ employees)', 'High project value'],
    recommendedService: 'Corporate Website Redesign',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -35),
    activities: [
      { id: 'PA016', type: 'DISCOVERY', at: addDays(T, -45), by: 'U002', title: 'Prospect discovered', detail: 'Corporate referral from PT Sejahtera.' },
      { id: 'PA017', type: 'QUALIFIED', at: addDays(T, -42), by: 'U002', title: 'Qualified', detail: 'Enterprise client, high value potential.' },
      { id: 'PA018', type: 'CONVERTED', at: addDays(T, -35), by: 'U002', title: 'Converted to opportunity', detail: 'Created OPP006.' }
    ],
    notes: [], tags: ['Manufacturing', 'Surabaya', 'Enterprise'], createdAt: addDays(T, -45)
  },
  {
    id: 'PR007', business: 'Bloom Coffee', category: 'Cafe', city: 'Malang', industry: 'F&B',
    location: 'Jl. Ijen No. 7, Malang',
    contact: { name: 'Fajar Nugroho', position: 'Owner', phone: '0857-2345-6789', email: 'fajar@bloomcoffee.id', instagram: '@bloomcoffee' },
    website: 'bloomcoffee.id (template, not managed)', instagram: '@bloomcoffee', tiktok: '', whatsapp: '0857-2345-6789',
    source: 'Scraped', status: 'CONVERTED', potential: 65, owner: 'U002',
    whyApproach: ['Template website not maintained', 'Active Instagram', 'Specialty coffee niche'],
    recommendedService: 'Website + Menu System',
    nextAction: 'Converted then Rejected', nextActionDate: addDays(T, -45),
    activities: [
      { id: 'PA019', type: 'DISCOVERY', at: addDays(T, -55), by: 'U002', title: 'Prospect discovered', detail: 'Instagram visit.' },
      { id: 'PA020', type: 'QUALIFIED', at: addDays(T, -52), by: 'U002', title: 'Qualified', detail: 'Template website, needs custom solution.' },
      { id: 'PA021', type: 'CONVERTED', at: addDays(T, -45), by: 'U002', title: 'Converted to opportunity', detail: 'Created OPP007.' }
    ],
    notes: [], tags: ['Cafe', 'Malang', 'F&B'], createdAt: addDays(T, -55)
  },
  {
    id: 'PR008', business: 'Cahaya Edu', category: 'Education', city: 'Malang', industry: 'Education',
    location: 'Jl. Tlogo Indah No. 20, Malang',
    contact: { name: 'Dimas Aditya', position: 'Director', phone: '0819-8765-4321', email: 'dimas@cayahaidu.com', instagram: '@cahayaedu' },
    website: '', instagram: '@cahayaedu', tiktok: '@cahayaedu', whatsapp: '0819-8765-4321',
    source: 'Scraped', status: 'CONVERTED', potential: 72, owner: 'U006',
    whyApproach: ['No website', 'Active Instagram + TikTok', 'Education needs online registration'],
    recommendedService: 'Landing Page + Registration System',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -10),
    activities: [
      { id: 'PA022', type: 'DISCOVERY', at: addDays(T, -18), by: 'U006', title: 'Prospect discovered', detail: 'Google Maps scraping.' },
      { id: 'PA023', type: 'QUALIFIED', at: addDays(T, -16), by: 'U006', title: 'Qualified', detail: 'No website, needs registration system.' },
      { id: 'PA024', type: 'CONVERTED', at: addDays(T, -10), by: 'U006', title: 'Converted to opportunity', detail: 'Created OPP008.' }
    ],
    notes: [], tags: ['Education', 'Malang', 'Registration'], createdAt: addDays(T, -18)
  },
  {
    id: 'PR009', business: 'Dapur Nenek', category: 'F&B', city: 'Malang', industry: 'F&B',
    location: 'Jl. Kahuripan No. 8, Malang',
    contact: { name: 'Ibu Kartini', position: 'Owner', phone: '0852-3456-7890', email: 'kartini@dapurnenek.id', instagram: '@dapurnenek' },
    website: '', instagram: '@dapurnenek', tiktok: '', whatsapp: '0852-3456-7890',
    source: 'Scraped', status: 'CONTACTED', potential: 60, owner: 'U006',
    whyApproach: ['No digital presence', 'Traditional business with story', 'F&B fits DIGNIFY services'],
    recommendedService: 'Instagram Content + Simple Website',
    nextAction: 'Follow up — no response yet', nextActionDate: addDays(T, 1),
    activities: [
      { id: 'PA025', type: 'DISCOVERY', at: addDays(T, -8), by: 'U006', title: 'Prospect discovered', detail: 'Google Maps scraping.' },
      { id: 'PA026', type: 'CONTACTED', at: addDays(T, -5), by: 'U006', title: 'Initial contact', detail: 'WhatsApp sent.' }
    ],
    notes: [{ id: 'PN002', text: 'Ibu Kartini不太懂 teknologi. Communication via WhatsApp.', by: 'U006', at: addDays(T, -5) }],
    tags: ['F&B', 'Malang', 'Instagram'], createdAt: addDays(T, -8)
  },
  {
    id: 'PR010', business: 'Resto Santai', category: 'Restaurant', city: 'Batu', industry: 'F&B',
    location: 'Jl. Arumdalu No. 3, Batu',
    contact: { name: 'Rudi Hermawan', position: 'Owner', phone: '0818-7654-3210', email: 'rudi@restosantai.com', instagram: '@restosantai' },
    website: 'restosantai.com (from 2019, not updated)', instagram: '@restosantai', tiktok: '', whatsapp: '0818-7654-3210',
    source: 'Referral', status: 'CONVERTED', potential: 78, owner: 'U002',
    whyApproach: ['Outdated website', 'Beautiful location needs gallery', 'Reservation system needed'],
    recommendedService: 'Website + Reservasi System',
    nextAction: 'Converted to Opportunity', nextActionDate: addDays(T, -22),
    activities: [
      { id: 'PA027', type: 'DISCOVERY', at: addDays(T, -30), by: 'U002', title: 'Prospect discovered', detail: 'Client referral.' },
      { id: 'PA028', type: 'QUALIFIED', at: addDays(T, -28), by: 'U002', title: 'Qualified', detail: 'Outdated website, needs modern solution.' },
      { id: 'PA029', type: 'CONVERTED', at: addDays(T, -22), by: 'U002', title: 'Converted to opportunity', detail: 'Created OPP010.' }
    ],
    notes: [], tags: ['Restaurant', 'Batu', 'Reservation'], createdAt: addDays(T, -30)
  }
]

const CLIENT_SEED = [
  {
    id: 'CLI001', opportunityId: 'OPP001', business: 'Kedai ABC', contact: { name: 'Budi Santoso', position: 'Owner', phone: '0812-3456-7890', email: 'budi@kedaiabc.id', instagram: '@kedaiabc' },
    industry: 'F&B', city: 'Malang', location: 'Jl. Merdeka No. 42, Malang',
    service: 'Website Company Profile', value: 5000000, paid: 2500000, outstanding: 2500000,
    status: 'ACTIVE', paymentStatus: 'PARTIAL', maintenance: false,
    projects: [{ name: 'Website Company Profile', value: 5000000, status: 'In Development', progress: 45 }],
    createdAt: addDays(T, -12), lastActivity: addDays(T, -2)
  },
  {
    id: 'CLI002', opportunityId: 'OPP003', business: 'Toko Sinar', contact: { name: 'Rina Wulandari', position: 'Manager', phone: '0878-9012-3456', email: 'rina@tokosinar.id', instagram: '@tokosinar' },
    industry: 'Retail', city: 'Malang', location: 'Jl. Basuki Rahmat No. 15, Malang',
    service: 'E-commerce Landing Page', value: 4500000, paid: 4500000, outstanding: 0,
    status: 'ACTIVE', paymentStatus: 'PAID', maintenance: false,
    projects: [{ name: 'E-commerce Landing Page', value: 4500000, status: 'Completed', progress: 100 }],
    createdAt: addDays(T, -25), lastActivity: addDays(T, -1)
  },
  {
    id: 'CLI003', opportunityId: 'OPP006', business: 'PT Maju Bersama', contact: { name: 'Pak Hendra Wijaya', position: 'Operations Director', phone: '0815-6789-0123', email: 'hendra@ptmaju.co.id', instagram: '' },
    industry: 'Manufacturing', city: 'Surabaya', location: 'Jl. Rungkut Industri No. 5, Surabaya',
    service: 'Corporate Website Redesign', value: 15000000, paid: 4500000, outstanding: 10500000,
    status: 'ACTIVE', paymentStatus: 'PARTIAL', maintenance: false,
    projects: [{ name: 'Corporate Website Redesign', value: 15000000, status: 'In Development', progress: 30 }],
    createdAt: addDays(T, -35), lastActivity: addDays(T, -3)
  }
]

const ACTIVITY_SEED = [
  { id: 'ACT001', type: 'WhatsApp', entity: 'Dapur Nenek', entityId: 'OPP009', entityType: 'opportunity', by: 'U002', at: addDays(T, 0) + 'T10:32:00', title: 'Follow-up sent regarding website proposal', detail: 'Client hasn\'t responded to initial outreach.', channel: 'WhatsApp', nextAction: addDays(T, 1) },
  { id: 'ACT002', type: 'Meeting', entity: 'Klinik Sehat', entityId: 'OPP004', entityType: 'opportunity', by: 'U002', at: addDays(T, 0) + 'T09:15:00', title: 'Discovery meeting completed', detail: 'Discussed booking system requirements. Client very interested.', channel: 'On-site', nextAction: '' },
  { id: 'ACT003', type: 'Proposal Sent', entity: 'Toko Sinar', entityId: 'OPP003', entityType: 'opportunity', by: 'U002', at: addDays(T, -1) + 'T16:40:00', title: 'Proposal v1 sent', detail: 'E-commerce landing page proposal. Value Rp4.500.000.', channel: 'Email', nextAction: addDays(T, 0) },
  { id: 'ACT004', type: 'WhatsApp', entity: 'Kedai ABC', entityId: 'OPP001', entityType: 'opportunity', by: 'U002', at: addDays(T, -1) + 'T14:20:00', title: 'Brief meeting confirmed', detail: 'Meeting set for tomorrow 10:00 via Google Meet.', channel: 'WhatsApp', nextAction: addDays(T, 1) },
  { id: 'ACT005', type: 'Email', entity: 'PT Maju Bersama', entityId: 'OPP006', entityType: 'opportunity', by: 'U002', at: addDays(T, -2) + 'T11:00:00', title: 'Proposal v2 sent', detail: 'Revised proposal with adjusted scope. Awaiting client review.', channel: 'Email', nextAction: addDays(T, 0) },
  { id: 'ACT006', type: 'Follow-up', entity: 'Ruang Tumbuh', entityId: 'OPP005', entityType: 'opportunity', by: 'U006', at: addDays(T, -2) + 'T15:30:00', title: 'Follow-up call', detail: 'Sari confirmed interest. Will discuss with partner.', channel: 'Phone', nextAction: addDays(T, 0) },
  { id: 'ACT007', type: 'Meeting', entity: 'Resto Santai', entityId: 'OPP010', entityType: 'opportunity', by: 'U002', at: addDays(T, -3) + 'T10:00:00', title: 'On-site meeting at restaurant', detail: 'Full brief discussion. Beautiful mountain view. Client wants earthy tones.', channel: 'On-site', nextAction: addDays(T, 4) },
  { id: 'ACT008', type: 'WhatsApp', entity: 'Cahaya Edu', entityId: 'OPP008', entityType: 'opportunity', by: 'U006', at: addDays(T, -3) + 'T09:00:00', title: 'Initial contact sent', detail: 'WhatsApp with portfolio link.', channel: 'WhatsApp', nextAction: addDays(T, 3) },
  { id: 'ACT009', type: 'Instagram', entity: 'Bloom Coffee', entityId: 'OPP007', entityType: 'opportunity', by: 'U002', at: addDays(T, -5) + 'T13:00:00', title: 'Instagram DM follow-up', detail: 'Checking in on proposal status. Client says budget allocated elsewhere.', channel: 'Instagram', nextAction: addDays(T, 30) },
  { id: 'ACT010', type: 'Note', entity: 'Kedai ABC', entityId: 'CLI001', entityType: 'client', by: 'U002', at: addDays(T, -5) + 'T16:00:00', title: 'Client note added', detail: 'Budi prefers earthy tones. Mentioned competitor site as reference.', channel: '', nextAction: '' },
  { id: 'ACT011', type: 'Proposal Updated', entity: 'PT Maju Bersama', entityId: 'OPP006', entityType: 'opportunity', by: 'U002', at: addDays(T, -5) + 'T14:00:00', title: 'Proposal v1 rejected — budget too high', detail: 'Client says budget allocated to equipment. Need to revise scope.', channel: '', nextAction: addDays(T, -3) },
  { id: 'ACT012', type: 'WhatsApp', entity: 'Studio XYZ', entityId: 'OPP002', entityType: 'opportunity', by: 'U002', at: addDays(T, -7) + 'T10:30:00', title: 'Brief completed', detail: 'All requirements captured. Moving to analysis phase.', channel: 'WhatsApp', nextAction: addDays(T, 0) }
]

export function seedCRM() {
  return {
    opportunities: SEED.map((o) => ({ ...o })),
    prospects: PROSPECT_SEED.map((p) => ({ ...p })),
    clients: CLIENT_SEED.map((c) => ({ ...c })),
    activities: ACTIVITY_SEED.map((a) => ({ ...a })),
    users: []
  }
}
