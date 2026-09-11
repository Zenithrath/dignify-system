/**
 * DIGNIFY OS — Apps Script backend (business logic / API layer).
 *
 * Spreadsheet model: TWO spreadsheets stay separate.
 *   DATA_PELANGGAN (sales DB): 01_LEADS, 02_OUTREACH, 03_CLOSING
 *   MONITORING DIGNIFY (ops DB): 01_CLIENTS, 02_PROJECTS, 03_TASKS, 04_MAINTENANCE,
 *     05_FINANCE_INV, 06_FINANCE_EXP, 07_TEAM, 08_ACTIVITY, 09_NOTIFICATIONS,
 *     10_RECURRING, 11_CONTENT, 12_SETTINGS, 13_ROADMAP, 14_RATECARD
 *
 * Security contract (mirrors frontend src/lib/permissions.js — frontend is NOT trusted):
 *   1. authenticate (Firebase ID token → email → TEAM row → role)
 *   2. authorize (PERMISSIONS matrix below)
 *   3. validate input  4. LockService  5. mutate  6. log activity
 *
 * Deploy: Deploy → New deployment → Web app → Execute as: Me,
 * Who has access: Anyone (validate Firebase token inside every call).
 */

// ============================== CONFIG ==============================
const CONFIG = {
  OPS_SPREADSHEET_ID: '',      // ← paste MONITORING DIGNIFY id (PropertiesService overrides)
  LEADS_SPREADSHEET_ID: '',    // ← paste DATA PELANGGAN id
  FIREBASE_PROJECT_ID: ''      // for ID-token verification
};

function cfg_(k) {
  const v = PropertiesService.getScriptProperties().getProperty(k);
  return v || CONFIG[k] || '';
}

// ============================== RBAC ==============================
const PERMISSIONS = {
  'users.manage': ['ADMIN'], 'settings.manage': ['ADMIN'], 'notif_rules.manage': ['ADMIN'],
  'activity.view_all': ['ADMIN', 'PM'],
  'leads.view': ['ADMIN', 'PM', 'STAFF'], 'leads.manage': ['ADMIN', 'PM'],
  'outreach.manage': ['ADMIN', 'PM'], 'leads.convert': ['ADMIN', 'PM'],
  'clients.view': ['ADMIN', 'PM', 'STAFF'], 'clients.manage': ['ADMIN', 'PM'],
  'projects.view': ['ADMIN', 'PM', 'STAFF'], 'projects.manage': ['ADMIN', 'PM'], 'projects.assign': ['ADMIN', 'PM'],
  'tasks.view_all': ['ADMIN', 'PM'], 'tasks.create': ['ADMIN', 'PM'], 'tasks.assign': ['ADMIN', 'PM'],
  'tasks.update_own': ['ADMIN', 'PM', 'STAFF'],
  'content.view': ['ADMIN', 'PM', 'STAFF'], 'content.manage': ['ADMIN', 'PM'],
  'recurring.manage': ['ADMIN', 'PM'],
  'maintenance.view': ['ADMIN', 'PM', 'STAFF'], 'maintenance.manage': ['ADMIN'], 'maintenance.execute': ['ADMIN', 'PM', 'STAFF'],
  'finance.view': ['ADMIN', 'PM'], 'finance.manage': ['ADMIN'],
  'team.view': ['ADMIN', 'PM', 'STAFF'],
  'roadmap.manage': ['ADMIN', 'PM']
};
function can_(role, perm) { return (PERMISSIONS[perm] || []).indexOf(role) !== -1; }

// ============================== AUTH ==============================
// Verifies a Firebase ID token via tokeninfo endpoint (simple, no lib needed).
// For Google Sign-In tokens use https://oauth2.googleapis.com/tokeninfo?id_token=
function auth_(idToken) {
  if (!idToken) throw new Error('UNAUTHENTICATED');
  const url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key='
    + encodeURIComponent(cfg_('FIREBASE_API_KEY') || '');
  // Fallback: accept tokeninfo email lookup for Google-issued tokens
  const info = JSON.parse(UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
    { muteHttpExceptions: true }).getContentText());
  if (!info.email) throw new Error('UNAUTHENTICATED: bad token');
  const team = sheet_('07_TEAM').getDataRange().getValues();
  const head = team[0];
  const eI = head.indexOf('email'), rI = head.indexOf('role'),
        nI = head.indexOf('name'), aI = head.indexOf('active'), iI = head.indexOf('id');
  for (let r = 1; r < team.length; r++) {
    if (String(team[r][eI]).toLowerCase() === String(info.email).toLowerCase()
        && String(team[r][aI]).toUpperCase() !== 'FALSE') {
      return { id: team[r][iI], email: info.email, name: team[r][nI], role: team[r][rI] };
    }
  }
  throw new Error('FORBIDDEN: user not in TEAM sheet');
}
function require_(user, perm) {
  if (!can_(user.role, perm)) throw new Error('FORBIDDEN: ' + perm + ' requires ' + (PERMISSIONS[perm] || []).join('/'));
}

// ============================== SHEET HELPERS ==============================
function ops_() { return SpreadsheetApp.openById(cfg_('OPS_SPREADSHEET_ID')); }
function leads_() { return SpreadsheetApp.openById(cfg_('LEADS_SPREADSHEET_ID')); }
function sheet_(name) {
  const ss = (/LEAD|OUTREACH|CLOSING/.test(name)) ? leads_() : ops_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}
function rows_(name) {
  const v = sheet_(name).getDataRange().getValues();
  if (v.length < 1) return { head: [], data: [] };
  const head = v[0].map(String);
  return { head, data: v.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]]))) };
}
function append_(name, obj) {
  const sh = sheet_(name);
  const head = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(String);
  sh.appendRow(head.map((h) => obj[h] !== undefined ? obj[h] : ''));
}
function nextId_(name, prefix, pad) {
  const { head, data } = rows_(name);
  let mx = 0;
  data.forEach((r) => { const n = parseInt(String(r.id || '').replace(/\D/g, ''), 10); if (n > mx) mx = n; });
  return prefix + String(mx + 1).padStart(pad || 3, '0');
}
function log_(by, text, entity) {
  append_('08_ACTIVITY', { id: nextId_('08_ACTIVITY', 'ACT', 3), at: new Date(), by, text, entity: entity || '' });
}
function notify_(to, title, msg, type, entity) {
  if (!to) return;
  append_('09_NOTIFICATIONS', { id: nextId_('09_NOTIFICATIONS', 'NOTIF', 3), to, title, msg, type, entity: entity || '', at: new Date(), read: false });
}

// ============================== WEB API ==============================
// Frontend calls: POST { token, action, payload }.
// Router enforces require_() per action — never trust the client role.
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const body = JSON.parse(e.postData.contents);
    const user = auth_(body.token);
    const out = route_(user, body.action, body.payload || {});
    return ContentService.createTextOutput(JSON.stringify({ ok: true, data: out }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err && err.message || err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally { try { lock.releaseLock(); } catch (_) {} }
}
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, app: 'DIGNIFY OS API', actions: Object.keys(ACTIONS) }))
    .setMimeType(ContentService.MimeType.JSON);
}

const ACTIONS = {};
function route_(user, action, p) {
  const fn = ACTIONS[action];
  if (!fn) throw new Error('Unknown action: ' + action);
  return fn(user, p);
}

// ---- sales ----
ACTIONS['leads.list'] = (u) => { require_(u, 'leads.view'); return rows_('01_LEADS'); };
ACTIONS['leads.save'] = (u, p) => {
  require_(u, 'leads.manage');
  if (!p.business) throw new Error('Business name required');
  if (p.id) { updateRow_('01_LEADS', p.id, p); log_(u.id, 'updated lead ' + p.business, p.id); }
  else { p.id = nextId_('01_LEADS', 'L', 3); append_('01_LEADS', p); log_(u.id, 'added new lead ' + p.business, p.id); }
  return p;
};
ACTIONS['leads.convert'] = (u, p) => {
  require_(u, 'leads.convert');
  updateRow_('01_LEADS', p.leadId, { stage: 'WON' });
  const cid = nextId_('01_CLIENTS', 'C', 3);
  const lead = rows_('01_LEADS').data.filter((r) => r.id === p.leadId)[0] || {};
  append_('01_CLIENTS', { id: cid, leadId: p.leadId, company: lead.business, phone: lead.phone || '', industry: lead.category || '', pic: lead.owner || u.id, status: 'ACTIVE' });
  append_('03_CLOSING', { leadId: p.leadId, clientId: cid, value: lead.value || '', at: new Date(), by: u.id });
  log_(u.id, 'converted lead ' + lead.business + ' → client ' + cid, cid);
  return { clientId: cid };
};
ACTIONS['outreach.add'] = (u, p) => {
  require_(u, 'outreach.manage');
  const o = { id: nextId_('02_OUTREACH', 'O', 3), leadId: p.leadId, date: p.date || new Date(), channel: p.channel, result: p.result, by: u.id, note: p.note || '' };
  append_('02_OUTREACH', o); log_(u.id, 'logged outreach on ' + p.leadId, p.leadId);
  return o;
};

// ---- tasks (assignment locked to PM/ADMIN; staff → own tasks only) ----
ACTIONS['tasks.assign'] = (u, p) => {
  require_(u, 'tasks.assign');
  const t = { id: nextId_('03_TASKS', 'T', 3), createdBy: u.id, createdAt: new Date(), progress: 0, status: 'TODO', ...p };
  append_('03_TASKS', t);
  notify_(t.assignee, 'New task assigned', t.title, 'task', t.id);
  log_(u.id, 'assigned task ' + t.title, t.id);
  recalcProject_(t.projectId);
  return t;
};
ACTIONS['tasks.updateOwn'] = (u, p) => {
  const all = rows_('03_TASKS').data;
  const cur = all.filter((r) => r.id === p.id)[0];
  if (!cur) throw new Error('Not found');
  if (u.role === 'STAFF' && String(cur.assignee) !== String(u.id)) throw new Error('FORBIDDEN: not your task');
  require_(u, 'tasks.update_own');
  if (p.assignee && p.assignee !== cur.assignee) require_(u, 'tasks.assign');
  updateRow_('03_TASKS', p.id, p);
  if (p.status === 'DONE') recalcProject_(cur.projectId);
  log_(u.id, 'updated task ' + cur.title + ' → ' + (p.status || cur.status), p.id);
  return { ok: true };
};

// ---- maintenance (admin config; anyone executes assigned) ----
ACTIONS['maintenance.complete'] = (u, p) => {
  require_(u, 'maintenance.execute');
  const m = rows_('04_MAINTENANCE').data.filter((r) => r.id === p.id)[0];
  if (!m) throw new Error('Not found');
  const hist = JSON.parse(m.history || '[]'); hist.unshift({ date: new Date(), note: 'Completed by ' + u.name });
  if (Number(m.intervalDays) > 0) {
    const next = new Date(); next.setDate(next.getDate() + Number(m.intervalDays));
    updateRow_('04_MAINTENANCE', m.id, { status: 'SCHEDULED', nextDue: next, history: JSON.stringify(hist) });
    append_('03_TASKS', { id: nextId_('03_TASKS', 'T', 3), type: 'MAINTENANCE', title: m.service + ' — next cycle', assignee: m.pic, status: 'TODO', deadline: next, createdBy: 'system', maintenanceId: m.id });
    notify_(m.pic, 'Next maintenance scheduled', m.service + ' due ' + next.toDateString(), 'maintenance', m.id);
  } else updateRow_('04_MAINTENANCE', m.id, { status: 'COMPLETED', history: JSON.stringify(hist) });
  log_(u.id, 'completed maintenance ' + m.id, m.id);
  return { ok: true };
};

function updateRow_(name, id, patch) {
  const sh = sheet_(name);
  const v = sh.getDataRange().getValues();
  const head = v[0].map(String);
  const idI = head.indexOf('id');
  for (let r = 1; r < v.length; r++) {
    if (String(v[r][idI]) === String(id)) {
      Object.keys(patch).forEach((k) => { const c = head.indexOf(k); if (c !== -1) sh.getRange(r + 1, c + 1).setValue(patch[k]); });
      return;
    }
  }
  throw new Error('Row not found: ' + id);
}
function recalcProject_(projectId) {
  if (!projectId) return;
  const tasks = rows_('03_TASKS').data.filter((t) => String(t.projectId) === String(projectId) && String(t.type) === 'PROJECT');
  if (!tasks.length) return;
  const done = tasks.filter((t) => String(t.status) === 'DONE').length;
  updateRow_('02_PROJECTS', projectId, { progress: Math.round((done / tasks.length) * 100) });
}

// ============================== AUTOMATION TRIGGERS ==============================
// Install once: setupTriggers_() → daily 08:00 dailyCheck_() + dailyGenerate_().
function setupTriggers_() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyCheck_').timeBased().everyDays(1).atHour(8).create();
  ScriptApp.newTrigger('dailyGenerate_').timeBased().everyDays(1).atHour(7).create();
}
function dailyGenerate_() {
  // create today's recurring tasks (idempotent on rule+date)
  const rules = rows_('10_RECURRING').data.filter((r) => String(r.active).toUpperCase() !== 'FALSE' && Number(r.weekday) === new Date().getDay());
  const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const tasks = rows_('03_TASKS').data;
  rules.forEach((r) => {
    const exists = tasks.some((t) => String(t.autoRule) === String(r.id) && String(t.deadline).slice(0, 10) === today);
    if (!exists) {
      const t = { id: nextId_('03_TASKS', 'T', 3), type: r.type, title: r.title, assignee: r.assignee, status: 'TODO', deadline: today, createdBy: 'system', autoRule: r.id };
      append_('03_TASKS', t);
      notify_(r.assignee, 'Routine task generated', r.title + ' — due today.', 'task', t.id);
    }
  });
}
function dailyCheck_() {
  // overdue / due-soon tasks, maintenance, follow-ups, payments → notifications
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const soon = Number((rows_('12_SETTINGS').data[0] || {}).deadlineSoonDays || 2);
  rows_('03_TASKS').data.forEach((t) => {
    if (String(t.status) === 'DONE' || !t.deadline) return;
    const d = new Date(t.deadline); const diff = Math.round((d - today) / 864e5);
    if (diff < 0) notify_(t.assignee, 'Task overdue', t.title + ' — ' + (-diff) + 'd overdue.', 'overdue', t.id);
    else if (diff <= soon) notify_(t.assignee, 'Deadline approaching', t.title + ' — due in ' + diff + 'd.', 'task', t.id);
  });
  rows_('04_MAINTENANCE').data.forEach((x) => {
    if (/COMPLETED|CANCELLED/.test(String(x.status))) return;
    const diff = Math.round((new Date(x.nextDue) - today) / 864e5);
    if (diff < 0) { updateRow_('04_MAINTENANCE', x.id, { status: 'OVERDUE' }); notify_(x.pic, 'Maintenance overdue', x.service, 'maintenance', x.id); }
    else if (diff <= 5) notify_(x.pic, 'Maintenance due soon', x.service + ' — due in ' + diff + 'd.', 'maintenance', x.id);
  });
}
