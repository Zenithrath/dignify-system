// RBAC — single source of truth. Mirrored server-side in apps-script/Code.gs
// Roles: ADMIN, PM, STAFF
export const ROLES = ['ADMIN', 'PM', 'STAFF']

export const PERMISSIONS = {
  // users & system
  'users.manage': ['ADMIN'],
  'settings.manage': ['ADMIN'],
  'notif_rules.manage': ['ADMIN'],
  'activity.view_all': ['ADMIN', 'PM'],
  // sales
  'leads.view': ['ADMIN', 'PM', 'STAFF'],
  'leads.manage': ['ADMIN', 'PM'],
  'outreach.manage': ['ADMIN', 'PM'],
  'leads.convert': ['ADMIN', 'PM'],
  // business workflow — prospecting → leads → follow-ups → proposals → won → client
  'prospects.view': ['ADMIN', 'PM', 'STAFF'],
  'prospects.manage': ['ADMIN', 'PM'],
  'prospects.approach': ['ADMIN', 'PM'],
  'followups.view': ['ADMIN', 'PM', 'STAFF'],
  'followups.manage': ['ADMIN', 'PM'],
  'proposals.view': ['ADMIN', 'PM', 'STAFF'],
  'proposals.manage': ['ADMIN', 'PM'],
  // clients
  'clients.view': ['ADMIN', 'PM', 'STAFF'],
  'clients.manage': ['ADMIN', 'PM'],
  // projects
  'projects.view': ['ADMIN', 'PM', 'STAFF'],
  'projects.manage': ['ADMIN', 'PM'],
  'projects.assign': ['ADMIN', 'PM'],
  // tasks — staff may update own tasks, only PM/ADMIN create+assign
  'tasks.view_all': ['ADMIN', 'PM'],
  'tasks.create': ['ADMIN', 'PM'],
  'tasks.assign': ['ADMIN', 'PM'],
  'tasks.update_own': ['ADMIN', 'PM', 'STAFF'],
  // content & routine
  'content.view': ['ADMIN', 'PM', 'STAFF'],
  'content.manage': ['ADMIN', 'PM'],
  'recurring.manage': ['ADMIN', 'PM'],
  // maintenance — admin full control, PM view, staff execute assigned
  'maintenance.view': ['ADMIN', 'PM', 'STAFF'],
  'maintenance.manage': ['ADMIN'],
  'maintenance.execute': ['ADMIN', 'PM', 'STAFF'],
  // finance — staff sees only limited
  'finance.view': ['ADMIN', 'PM'],
  'finance.manage': ['ADMIN'],
  // team
  'team.view': ['ADMIN', 'PM', 'STAFF'],
  // roadmap / ratecard
  'roadmap.view': ['ADMIN', 'PM', 'STAFF'],
  'roadmap.manage': ['ADMIN', 'PM']
}

export const can = (role, perm) => (PERMISSIONS[perm] || []).includes(role)

// Navigation per role — workflow-driven, sidebar is for exploration only.
// HOME answers "What should I do today?", BUSINESS drives Prospecting → Won.
export const NAV = {
  ADMIN: [
    { to: '/', label: 'Home', icon: 'House' },
    { to: '/crm', label: 'CRM', icon: 'Target' },
    { section: 'BUSINESS' },
    { to: '/prospecting', label: 'Prospecting', icon: 'Radar' },
    { to: '/leads', label: 'Leads', icon: 'Magnet' },
    { to: '/follow-ups', label: 'Follow-ups', icon: 'PhoneCall' },
    { to: '/proposals', label: 'Proposals', icon: 'FileText' },
    { to: '/clients', label: 'Clients', icon: 'Building2' },
    { to: '/projects', label: 'Projects', icon: 'KanbanSquare' },
    { to: '/ratecard', label: 'Services', icon: 'BadgeDollarSign' },
    { to: '/content', label: 'Content', icon: 'Clapperboard' },
    { to: '/finance', label: 'Finance', icon: 'Wallet' },
    { section: 'MANAGEMENT' },
    { to: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
    { to: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
    { to: '/team', label: 'Team', icon: 'Users' },
    { to: '/activity', label: 'Activity', icon: 'History' },
    { to: '/calendar', label: 'Calendar', icon: 'CalendarDays' },
    { to: '/roadmap', label: 'Roadmap', icon: 'Target' },
    { to: '/settings', label: 'Settings', icon: 'Settings' }
  ],
  PM: [
    { to: '/', label: 'Home', icon: 'House' },
    { to: '/crm', label: 'CRM', icon: 'Target' },
    { section: 'BUSINESS' },
    { to: '/prospecting', label: 'Prospecting', icon: 'Radar' },
    { to: '/leads', label: 'Leads', icon: 'Magnet' },
    { to: '/follow-ups', label: 'Follow-ups', icon: 'PhoneCall' },
    { to: '/proposals', label: 'Proposals', icon: 'FileText' },
    { to: '/clients', label: 'Clients', icon: 'Building2' },
    { to: '/projects', label: 'Projects', icon: 'KanbanSquare' },
    { to: '/ratecard', label: 'Services', icon: 'BadgeDollarSign' },
    { to: '/content', label: 'Content', icon: 'Clapperboard' },
    { to: '/team', label: 'Team', icon: 'Users' },
    { to: '/activity', label: 'Activity', icon: 'History' },
    { section: 'MANAGEMENT' },
    { to: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
    { to: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
    { to: '/calendar', label: 'Calendar', icon: 'CalendarDays' },
    { to: '/roadmap', label: 'Roadmap', icon: 'Target' }
  ],
  STAFF: [
    { to: '/', label: 'Home', icon: 'House' },
    { to: '/follow-ups', label: 'Follow-ups', icon: 'PhoneCall' },
    { to: '/prospecting', label: 'Prospecting', icon: 'Radar' },
    { to: '/leads', label: 'Leads', icon: 'Magnet' },
    { to: '/proposals', label: 'Proposals', icon: 'FileText' },
    { to: '/projects', label: 'My Projects', icon: 'KanbanSquare' },
    { to: '/content', label: 'Content', icon: 'Clapperboard' },
    { to: '/maintenance', label: 'Maintenance', icon: 'Wrench' },
    { to: '/clients', label: 'Clients', icon: 'Building2' },
    { to: '/activity', label: 'Activity', icon: 'History' }
  ]
}
