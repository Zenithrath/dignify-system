# DIGNIFY OS

Internal Business Operating System for the Dignify creative team.
**LEAD → SALES → CLIENT → PROJECT → TASK → DELIVERY → MAINTENANCE → PAYMENT → ANALYTICS**

Modern emerald SaaS UI · role dashboards (Admin / PM / Staff) · PWA installable · responsive + mobile bottom-nav.

## Quick start (Laragon / Windows)

```powershell
cd C:\laragon\www\dignify-system
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve production build
```

To serve via Laragon/Apache, point a vhost at `dist/` after `npm run build`, or drop `dist` contents into your web root.

## Demo accounts (password: `dignify123`)

| Email | Role | Sees |
|---|---|---|
| `admin@dignify.id` | ADMIN | full business: sales→finance→team→settings |
| `pm@dignify.id` | PM | operations: projects, tasks, workload, clients |
| `ignas@dignify.id` | STAFF | personal: my tasks, schedule, projects |

## What’s inside

- `src/lib/store.jsx` — local Sheets-mirror DB + **RBAC-enforced** mutations + automation engine (same contract as Apps Script)
- `src/lib/permissions.js` — single RBAC source of truth + role navigation
- `src/pages/` — Dashboard (3 role variants), Leads+Outreach, Clients, Projects, Tasks (one engine, 7 types), Content, Maintenance (auto-recurrence), Finance, Team+workload, Activity+Notifications, Calendar, Roadmap 90 Hari, Rate Card, Settings
- `apps-script/Code.gs` — production backend: Firebase-auth, per-action `require_()`, LockService, ID generation, activity log, `dailyGenerate_`/`dailyCheck_` triggers
- `ARCHITECTURE.md` — ERD, permission matrix, sheets schema, API contract, automation design

## Going live with Google Sheets

1. Create the two spreadsheets (DATA PELANGGAN + MONITORING DIGNIFY) with headers from `ARCHITECTURE.md` §4.
2. Paste `apps-script/Code.gs` into Extensions → Apps Script, set Script Properties `OPS_SPREADSHEET_ID`, `LEADS_SPREADSHEET_ID`, `FIREBASE_API_KEY`, run `setupTriggers_()`, Deploy as Web App.
3. Paste the `/exec` URL into Settings → Apps Script API URL.
4. Wire Firebase Auth (email/password + Google) and replace the demo `login()` transport with token-based calls — action names already match `Code.gs`.

## Notes

- Staff **cannot** assign tasks or touch finance/settings — blocked in UI *and* in `store.jsx` guards *and* in `Code.gs` `require_()`.
- Project progress derives from task completion; maintenance completion rolls the next cycle; lead WON converts without re-typing (Lead ID preserved).
- Reset demo data anytime from the avatar menu? No — clear `localStorage` key `dignify-os-v1` or use Settings → (admin) automation panel in future; simplest: DevTools → Application → Clear.
