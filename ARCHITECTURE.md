# DIGNIFY OS — System Architecture

> Role-based internal Business Operating System. **Google Sheets = database, Apps Script = API + automation, this web app = interface.** Never expose raw sheets as UI.

## 1. Lifecycle

```
LEAD → OUTREACH → FOLLOW-UP → MEETING → PROPOSAL → NEGOTIATION → WON/LOST
  → CLIENT → PROJECT → TASK → DELIVERY → COMPLETED → MAINTENANCE → RENEWAL
  → INVOICE → PAYMENT → HISTORY → ANALYTICS
```

Business rules: Lead ≠ Client · Client ≠ Project · 1 client → N projects & N maintenance · PM assigns, staff executes · routines auto-generate · maintenance recurs · history is append-only · L→C preserves Lead ID · progress derives from tasks · RBAC enforced server-side.

## 2. Entity Relationship (IDs are keys, never names)

```
LEADS(01_LEADS: id L###) 1──N OUTREACH(02_OUTREACH.leadId)
LEADS 1──0/1 CLIENTS(01_CLIENTS.leadId)      [on WON → convert, keep link]
CLIENTS 1──N PROJECTS(02_PROJECTS.clientId)
PROJECTS 1──N TASKS(03_TASKS.projectId)      [type=PROJECT]
CLIENTS 1──N MAINTENANCE(04_MAINTENANCE.clientId) 1──N TASKS(maintenanceId)
CLIENTS/PROJECTS 1──N FINANCE_INV(clientId, projectId)
USERS(07_TEAM.id) 1──N TASKS(assignee) / PROJECTS(pm) / MAINTENANCE(pic)
* ──N ACTIVITY(08_ACTIVITY.entity) · NOTIFICATIONS(09_NOTIFICATIONS.to/entity)
RECURRING(10_RECURRING) ──generates──▶ TASKS(autoRule+date, idempotent)
CONTENT(11_CONTENT) ──links──▶ TASKS(taskId)
```

## 3. Role–Permission Matrix (mirrored in `src/lib/permissions.js` + `Code.gs`)

| Capability | ADMIN | PM | STAFF |
|---|---|---|---|
| Users / settings / notif rules | ✅ | — | — |
| Leads manage / convert, outreach | ✅ | ✅ | view own touches |
| Clients manage | ✅ | ✅ | view |
| Projects manage + assign tasks | ✅ | ✅ | view assigned |
| Tasks create/assign | ✅ | ✅ | — (update own status/progress/notes only) |
| Content / recurring manage | ✅ | ✅ | view + execute |
| Maintenance configure | ✅ full | view | execute assigned + complete |
| Finance view / manage | ✅/✅ | view/— | — |
| Roadmap manage | ✅ | ✅ | view |

## 4. Sheets Schema (header rows)

- `01_LEADS`: id,business,category,city,rating,reviews,phone,website,social,source,stage,score,owner,value,followUp,notes,updatedAt
- `02_OUTREACH`: id,leadId,date,channel,result,by,note
- `03_CLOSING`: leadId,clientId,value,at,by
- `01_CLIENTS`: id,leadId,company,contact,phone,email,industry,pic,status,notes
- `02_PROJECTS`: id,clientId,name,service,desc,value,start,deadline,pm,status,progress,priority,milestones(JSON),notes
- `03_TASKS`: id,type,projectId,maintenanceId,leadId,title,assignee,status,priority,deadline,progress,notes,createdBy,createdAt,autoRule
- `04_MAINTENANCE`: id,clientId,service,plan,start,intervalDays,nextDue,pic,status,fee,payStatus,desc,history(JSON)
- `05_FINANCE_INV`: id,no,clientId,projectId,amount,paid,status,due,date,note
- `06_FINANCE_EXP`: id,title,amount,date,by,cat
- `07_TEAM`: id,name,email,role,title,skills,active
- `08_ACTIVITY`: id,at,by,text,entity
- `09_NOTIFICATIONS`: id,to,title,msg,type,entity,at,read
- `10_RECURRING`: id,name,weekday,title,assignee,type,active
- `11_CONTENT`: id,title,kind,platform,publishDate,status,designer,editor,reviewer,publisher,deadline,notes,taskId
- `12_SETTINGS`: businessName,currency,deadlineSoonDays,maintenanceSoonDays,gasUrl
- `13_ROADMAP`: id,goal,milestone,target,owner,progress,status
- `14_RATECARD`: id,service,scope,price,unit

Task `type`: PROJECT|ROUTINE|CONTENT|MAINTENANCE|SALES|INTERNAL|ADMIN.
Project `status`: PLANNING|DESIGN|DEVELOPMENT|REVIEW|REVISION|DEPLOYMENT|COMPLETED|ON_HOLD|CANCELLED.
Lead `stage`: NEW|QUALIFIED|CONTACTED|RESPONDED|MEETING|PROPOSAL_SENT|NEGOTIATION|WON|LOST.

## 5. API Contract (Apps Script `doPost {token, action, payload}`)

`leads.list/save`, `leads.convert{leadId}`, `outreach.add`, `clients.save`, `projects.save`,
`tasks.assign`, `tasks.updateOwn` (staff-blocked unless own), `content.save`, `recurring.save`,
`maintenance.save` (admin), `maintenance.complete` (rolls next cycle), `invoices.save`,
`payments.record{invoiceId,amount}`, `users.save` (admin), `settings.save` (admin).
Every action: authenticate → role → `require_(perm)` → validate → `LockService` → mutate → `log_`/`notify_`.

## 6. Frontend Routes & Components

- Routes: `/login`, `/` (role dashboard), `/leads`, `/clients`, `/projects`, `/tasks`, `/content`, `/maintenance`, `/finance` (admin/PM), `/team`, `/activity`, `/calendar`, `/roadmap`, `/ratecard`, `/settings`.
- Components: `Layout` (sidebar/topbar/bottom-nav/global search), `ui` (Card/Badge/Modal/Table/Empty/Progress), pages per module, `lib/store` (local Sheets-mirror + RBAC + automation), `lib/seed` (demo data), Recharts for funnel/cash.
- Local adapter in `src/lib/store.jsx` implements the same contract as `Code.gs`; set `settings.gasUrl` and swap transport to go live (sheets stay source of truth).

## 7. Automation / Triggers

| Trigger | Job |
|---|---|
| Daily 07:00 `dailyGenerate_` | recurring weekday → tasks (idempotent rule+date) |
| Daily 08:00 `dailyCheck_` | overdue/soon tasks, maintenance due/overdue, follow-ups, payment overdue → notifications |
| On task DONE | `recalcProject_` → progress = done/total |
| On maintenance DONE | nextDue = today+interval → next task + notify PIC |
| On lead WON | create CLIENT linked by leadId + CLOSING row |
| “Run automation” button | runs the same checks against the local mirror |

## 8. PWA

`vite-plugin-pwa`: manifest (standalone, emerald theme), SVG icons 192/512 + maskable, Workbox cache-first for shell + fonts, auto-update service worker, safe-area bottom nav, installable on desktop/mobile.
