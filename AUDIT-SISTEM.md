# AUDIT SISTEM — DIGNIFY OS

> Dokumen audit lengkap: gambaran sistem, teknologi, arsitektur, role, alur fitur end-to-end, skema data, API, otomasi, cara operasional, dan temuan penting.
> Terakhir diaudit: 11 September 2026 · Sumber: `package.json`, `ARCHITECTURE.md`, `README.md`, `src/`, `apps-script/Code.gs`.

---

## 1. Ringkasan Eksekutif

**DIGNIFY OS** adalah **Internal Business Operating System** untuk tim kreatif Dignify (agensi jasa website / konten / maintenance).

Satu aplikasi web menjadi pusat seluruh operasional:

```
LEAD → OUTREACH → FOLLOW-UP → MEETING → PROPOSAL → NEGOTIATION → WON/LOST
  → CLIENT → PROJECT → TASK → DELIVERY → COMPLETED → MAINTENANCE → RENEWAL
  → INVOICE → PAYMENT → HISTORY → ANALYTICS
```

Prinsip kunci yang dipegang sistem:
1. **Google Sheets = database, Apps Script = API + otomasi, web app = interface.** User tidak pernah buka sheet mentah.
2. **Lead ≠ Client ≠ Project.** Lead adalah prospek. Client lahir hanya dari Lead WON (konversi) atau input manual. Satu Client → N Project + N Maintenance.
3. **PM assign, Staff execute.** Staff tidak bisa buat/assign task, tidak bisa sentuh finance/settings.
4. **Progress project diturunkan otomatis** dari task DONE / total. History append-only (tidak ada yang di-overwrite).
5. **RBAC ditegakkan 3 lapis:** UI (`permissions.js`) + store lokal (`store.jsx` guard) + server (`Code.gs` `require_()`).

**Status saat ini:** frontend 100% fungsional dengan **local mirror** (`localStorage` key `dignify-os-v1`) + seed demo. Backend `Code.gs` baru mengimplementasikan **7 dari ~15 action** yang dibutuhkan frontend — artinya **belum siap production penuh** sebelum backend dilengkapi (lihat §11 Temuan).

---

## 2. Teknologi & Cara Menjalankan

| Lapisan | Teknologi | File kunci |
|---|---|---|
| Frontend | React 18.3.1, React Router 6.27, Recharts 2.13, Lucide icons | `src/App.jsx`, `src/pages/`, `src/components/` |
| Styling | Tailwind 3.4.14, PostCSS, font Inter + Plus Jakarta Sans | `tailwind.config.js`, `src/index.css` |
| Build/PWA | Vite 5.4.10, `vite-plugin-pwa` auto-update, Workbox cache-first | `vite.config.js`, `index.html`, `public/` |
| State/DB lokal | React Context + `localStorage` (mirror dari Sheets) | `src/lib/store.jsx`, `src/lib/seed.js` |
| RBAC | Satu source of truth di frontend | `src/lib/permissions.js` |
| Backend prod | Google Apps Script (`doPost {token, action, payload}`) | `apps-script/Code.gs` |
| DB prod | 2 Spreadsheet: `DATA PELANGGAN` + `MONITORING DIGNIFY` | lihat §8 |

Cara jalan (Laragon / Windows PowerShell):

```powershell
cd C:\laragon\www\dignify-system
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil ke dist/
npm run preview  # serve build, port 4173
```

Untuk Laragon/Apache: arahkan vhost ke `dist/` setelah `npm run build`.

### Akun Demo (password semua: `dignify123`)

| Email | Role | Melihat apa |
|---|---|---|
| `admin@dignify.id` | ADMIN | Full bisnis: sales → finance → team → settings |
| `pm@dignify.id` | PM (Djibril) | Operasional: projects, tasks, workload, clients |
| `ignas@dignify.id` | STAFF | Personal: my tasks, schedule, my projects |
| `bima@dignify.id`, `cinta@dignify.id`, `dian@dignify.id`, `eko@dignify.id` | STAFF | Sesuai title masing-masing |

Login ada di `/login` — ada 3 tombol one-click demo. Reset data demo: DevTools → Application → hapus key `dignify-os-v1` + `dignify-os-session`, atau `api.resetDemo()`.

---

## 3. Arsitektur Sistem

### 3.1 Tiga lapis

```
[ React PWA ]  ←→  [ Apps Script API ]  ←→  [ 2x Google Sheets ]
     ↕ (mode demo saat ini: localStorage, tanpa network)
[ localStorage dignify-os-v1 = mirror Sheets ]
```

- **Mode demo (aktif sekarang):** `src/lib/store.jsx` mengimplementasikan kontrak yang sama dengan `Code.gs`. Semua mutasi lewat `api.*` dengan guard `authenticate → authorize → validate → mutate → log/notify`. Setting `gasUrl` di Settings masih kosong — kalau diisi, transport tinggal diganti ke `fetch` token-based (nama action sudah sama).
- **Mode production (rencana):** Firebase Auth (email/password + Google) → `idToken` dikirim di setiap `doPost` → `auth_()` verifikasi via `oauth2.googleapis.com/tokeninfo` → cocokkan email ke sheet `07_TEAM` → `route_()` → `LockService` 15 detik → mutasi → `log_`/`notify_`.

### 3.2 Struktur folder

```
dignify-system/
├── apps-script/Code.gs        # backend production (264 baris, 7 actions)
├── src/
│   ├── App.jsx                # routing + Guard + toast
│   ├── main.jsx               # StoreProvider + Router mount
│   ├── components/
│   │   ├── Layout.jsx         # sidebar/topbar/bottom-nav/global search
│   │   └── ui.jsx             # Card/Badge/Avatar/Modal/Progress/Field
│   ├── lib/
│   │   ├── permissions.js     # RBAC + NAV per role
│   │   ├── store.jsx          # DB mirror + api + automation (340 baris)
│   │   ├── seed.js            # data demo (7 user, 10 lead, 4 client, dst)
│   │   └── format.js          # IDR, tanggal, uid, warna status
│   └── pages/                 # 14 halaman (lihat §6)
├── ARCHITECTURE.md            # ERD, matriks, skema, kontrak API
├── README.md                  # quick start
├── vite.config.js / tailwind.config.js / index.html
└── AUDIT-SISTEM.md            # file ini
```

### 3.3 Routing

Semua route di dalam `<Guard><Layout /></Guard>` kecuali `/login`. Belum login → redirect ke `/login`.

| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Dashboard | 3 varian role |
| `/leads` | Leads + Outreach | pipeline sales |
| `/clients` | Clients | master client |
| `/projects` | Projects | eksekusi |
| `/tasks` | Tasks | satu engine 7 tipe |
| `/content` | Content Schedule | jadwal konten mingguan |
| `/maintenance` | Maintenance | recurring service |
| `/finance` | Finance | invoice + expense (ADMIN/PM saja) |
| `/team` | Team + workload | kapasitas |
| `/activity` | Activity + Notifications | audit trail |
| `/calendar` | Calendar | agregator jadwal read-only |
| `/roadmap` | Roadmap 90 Hari | strategi |
| `/ratecard` | Rate Card | acuan harga |
| `/settings` | Settings | bisnis + otomasi + recurring |

---

## 4. Role & Hak Akses (RBAC)

Sumber kebenaran: `src/lib/permissions.js` (frontend) dicerminkan di `Code.gs` `PERMISSIONS` (backend). Helper: `can(role, perm)`, `canDo(perm)`.

| Kemampuan | ADMIN | PM | STAFF |
|---|---|---|---|
| Users / settings / notif rules | ✅ | — | — |
| Leads manage / convert, outreach | ✅ | ✅ | view saja (own touches) |
| Clients manage | ✅ | ✅ | view |
| Projects manage + assign tasks | ✅ | ✅ | view assigned saja |
| Tasks create / assign | ✅ | ✅ | — (hanya update status/progress/notes milik sendiri) |
| Content / recurring manage | ✅ | ✅ | view + execute |
| Maintenance configure | ✅ full | view | execute assigned + complete |
| Finance view / manage | ✅ / ✅ | view / — | — (halaman Restricted) |
| Roadmap manage | ✅ | ✅ | view |
| Activity view_all | ✅ | ✅ | hanya notif `to == me` |

Navigasi sidebar dibedakan per role (`NAV.ADMIN / NAV.PM / NAV.STAFF`):
- ADMIN: Dashboard, Tasks, Calendar, Leads, Clients, Projects, Content, Maintenance, Finance, Team, Activity, Roadmap 90 Hari, Rate Card, Settings.
- PM: sama minus Finance dan Settings (tapi tetap ada Leads, Team, Activity).
- STAFF: Dashboard, My Tasks, My Schedule, My Projects, Content, Maintenance, Clients, Activity.

Enforcement:
- UI: tombol/form disembunyikan + banner kuning (misal Maintenance non-admin) + halaman `Restricted`.
- Store: `guard(perm)` return error string → `api.*` batal.
- Server: `require_(user, perm)` throw `FORBIDDEN`.

---

## 5. Alur Bisnis End-to-End (Lifecycle)

### 5.1 Diagram

```
[LEAD NEW] → QUALIFIED → CONTACTED → RESPONDED → MEETING → PROPOSAL_SENT → NEGOTIATION → ┬→ WON → [CLIENT] → [PROJECT] → [TASK] → DELIVERY → COMPLETED ─┬→ [MAINTENANCE] → RENEWAL
                                                                                                └→ LOST (arsip, alasan)                              └→ [INVOICE] → PARTIAL → PAID
```

### 5.2 Langkah per tahap (siapa ngapain)

1. **Lead masuk** (ADMIN/PM): `Leads → + New lead` (wajib `business`). Field: category, city, rating, reviews, phone, website, social, source, score, owner, value (estimasi dari Rate Card), followUp, notes.
2. **Outreach / Follow-up** (ADMIN/PM): buka kartu lead → `AddOutreach` (channel: WhatsApp/Instagram/Email/Meeting, result, note). Setiap pindah stage otomatis nambah 1 baris outreach `channel: Status`. History append-only.
3. **Kualifikasi & Pipeline:** `setStage(leadId, stage)` + notifikasi ke owner saat `MEETING`/`PROPOSAL_SENT`. Follow-up date muncul di Calendar + Dashboard "Needs attention".
4. **Menang → Konversi** (ADMIN/PM): tombol `Convert to client` di lead WON. Sistem: `stage=WON`, buat Client `C###` (`company = business`, `industry = category`, link `leadId` dipertahankan), tulis baris `03_CLOSING {leadId, clientId, value, at, by}`, notify owner. Idempoten: kalau sudah ada client untuk leadId yang sama, tidak dobel. Kalah → `LOST` + alasan di notes.
5. **Client** (ADMIN/PM buat, semua view): satu client pegang N project + N maintenance + N invoice. Kartu client menampilkan count project, maintenance, total paid.
6. **Project** (ADMIN/PM buat): `+ New project` (wajib `name`; isi client, service, value, start/deadline, pm, desc). Status: `PLANNING → DESIGN → DEVELOPMENT → REVIEW → REVISION → DEPLOYMENT → COMPLETED` (+ `ON_HOLD`/`CANCELLED`). Ada checklist milestones. PM dapat notif `New project`.
7. **Task** (PM/ADMIN assign, STAFF kerjakan): `Tasks → + New task` → pilih type (lihat §6.5), project (kalau PROJECT), assignee, deadline, priority. STAFF: `TODO → IN_PROGRESS → IN_REVIEW → DONE` (atau `BLOCKED` + notes kendala). `quickStatus` dropdown inline. Setiap DONE → `recalcProject` → `progress = DONE/total`. PM dapat notif saat task DONE.
8. **Content** (jadwal mingguan Senin–Jumat, lihat §6.6): Planning → Design → Editing → Review → Publishing. Publish date masuk Calendar.
9. **Delivery & Invoice** (ADMIN buat invoice, PM view): `Finance → New invoice → Issue SENT` (`no, client, project, amount, due, date`). Status: `DRAFT → SENT → PARTIAL → PAID` via `Record payment` (bisa cicilan, `paid` di-cap maksimal `amount`).
10. **Maintenance** (ADMIN konfigurasi, semua bisa complete): `SCHEDULED → IN_PROGRESS → COMPLETED → auto next SCHEDULED` (`OVERDUE` otomatis jika lewat `nextDue`, `CANCELLED`). Complete → `history.unshift`, `nextDue = today + intervalDays`, generate task `MAINTENANCE` siklus berikutnya + notify PIC. `intervalDays = 0` = one-time → langsung `COMPLETED`.
11. **Notifikasi & Audit:** setiap mutasi append ke `08_ACTIVITY` (max 300, id `ACT###`) + `09_NOTIFICATIONS` (max 300, `to`, `read:false`). Bell di topbar hitung unread milik `me`. `Activity` page ada filter ALL/NOTIF/LOG + `Mark all read`.
12. **Otomasi harian** (tombol `Run automation` / trigger Apps Script): generate routine, cek overdue/soon, maintenance due, payment overdue — idempoten per hari (lihat §9).

Aturan bisnis yang tidak boleh dilanggar: Lead ID dipertahankan saat konversi · progress hanya dari task · maintenance recursif · history tidak boleh dihapus dari UI · ID adalah key (jangan join by nama) · staff tidak boleh ganti assignee/title orang lain.

---

## 6. Audit Per Fitur / Halaman

### 6.1 Dashboard (`src/pages/Dashboard.jsx`) — `/`

- **Tujuan:** overview bisnis (ADMIN/PM) vs workspace personal (STAFF).
- **ADMIN/PM:** KPI (total leads + won rate, active projects, revenue/outstanding, open maintenance), BarChart funnel `NEW→WON`, AreaChart cash `Paid vs Outstanding vs Expenses` (ADMIN saja), list Task overview, Project progress + bar, Needs attention (overdue tasks, overdue maintenance, open invoices), Recent activity. Aksi: `Run automation`, `+ New project`.
- **STAFF:** Due today / Overdue / Upcoming / Completed milik sendiri, Today's tasks, My projects, Recently completed.
- **Data:** `projects`, `tasks(+assignee)`, `leads(stage)`, `invoices(paid/amount)`, `expenses`, `maintenance(status/nextDue)`, `activity+users`.
- **Alur:** agregasi `useMemo` → deteksi `deadline < today` → link ke modul detail.

### 6.2 Leads + Outreach (`src/pages/Leads.jsx`) — `/leads`

- **Tujuan:** pipeline prospek. `Lead ≠ Client`.
- **Fitur:** search (`business+city+category+id`), filter chips `ALL + 9 stages`, kartu (`value IDR, score, owner, followUp, touches count`), modal detail (pindah stage, Convert to client, outreach history, AddOutreach), modal New/edit lead.
- **Akses:** `leads.manage`, `leads.convert`, `outreach.manage`. STAFF read-only.
- **Data:** `leads(owner→users)`, `outreach(leadId, by→users)` → konversi → `clients(leadId)`.
- **Alur:** `NEW → QUALIFIED → CONTACTED → RESPONDED → MEETING → PROPOSAL_SENT → NEGOTIATION → WON/LOST` → `api.convertLead()`.

### 6.3 Clients (`src/pages/Clients.jsx`) — `/clients`

- **Tujuan:** master client. Satu client → N project & N maintenance.
- **Fitur:** search (`company+id+contact`), kartu (project count, maintenance count, paid total), modal detail (link Projects, Maintenance, Payments), modal New client.
- **Akses:** `clients.manage` untuk tambah; view semua login.
- **Data:** `clients(leadId, pic→users)`, `projects(clientId)`, `maintenance(clientId)`, `invoices(clientId)`.

### 6.4 Projects (`src/pages/Projects.jsx`) — `/projects`

- **Tujuan:** eksekusi pesanan. Progress auto dari task.
- **Fitur:** search, kartu (client name, value, progress bar, deadline + overdue count, avatar stack assignee), modal detail (milestones checklist, task list, shortcut ganti status), modal New project.
- **Akses:** `projects.manage`. STAFF difilter `mineOnly` (hanya project yang punya task miliknya).
- **Data:** `projects(clientId→clients, pm→users)`, `tasks(projectId, assignee, deadline)`.

### 6.5 Tasks (`src/pages/Tasks.jsx`) — `/tasks` (engine terpenting)

- **Tujuan:** satu engine untuk 7 tipe: `PROJECT | ROUTINE | CONTENT | MAINTENANCE | SALES | INTERNAL | ADMIN`.
- **Fitur:** search + filter type, tabel (Task+project, Type, Assignee+Avatar, Due, Status, quickStatus inline), modal detail (title, status, progress%, assignee, deadline, notes), modal New task.
- **Akses:** `tasks.create`/`tasks.assign` (PM/ADMIN). STAFF hanya `assignee == me`, boleh ubah `status/progress/notes` milik sendiri (`staffLocked` untuk milik orang lain). `quickStatus` ditolak jika STAFF menyentuh task orang lain.
- **Aturan:** DONE otomatis `progress=100`. Ganti `assignee` → butuh `tasks.assign` + notify assignee baru. DONE → notify PM project.
- **Data:** `tasks(projectId→projects, assignee→users)` → update → `projects.progress`, `activity`, `notifications`.

### 6.6 Content Schedule (`src/pages/Content.jsx`) — `/content`

- **Tujuan:** jadwal konten Senin–Jumat: `Planning → Design → Editing → Review → Publishing`.
- **Fitur:** panel routine mingguan (dari `recurring weekday → tasks`), kartu konten (`kind/platform/publishDate`, Designer/Editor/Reviewer/Publisher, notes), aksi next-status, modal Schedule content.
- **Akses:** `content.manage` (ADMIN/PM). STAFF view + execute.
- **Data:** `content(...)`, `recurring(weekday, assignee)` → `tasks(type=CONTENT)`, `publishDate` → Calendar.
- **Alur status:** `PLANNING → DESIGN → EDITING → REVIEW → SCHEDULED → PUBLISHED`.

### 6.7 Maintenance (`src/pages/Maintenance.jsx`) — `/maintenance`

- **Tujuan:** service recurring pasca-project.
- **Fitur:** kartu (`service, plan/intervalDays, Next Due, PIC, fee+payStatus, desc, history[2]`), aksi `Mark completed → next cycle` (semua role yang punya `maintenance.execute`), `Reschedule/edit` (ADMIN saja, banner kuning untuk non-admin), modal ADMIN (client, service, intervalDays, nextDue, PIC, status, fee, payStatus).
- **Akses:** `maintenance.manage` = ADMIN; `maintenance.execute` = semua.
- **Alur:** `SCHEDULED/UPCOMING → IN_PROGRESS → COMPLETED → auto next SCHEDULED` (`OVERDUE`/`CANCELLED`).

### 6.8 Finance (`src/pages/Finance.jsx`) — `/finance`

- **Tujuan:** keuangan simpel agensi (bukan ERP).
- **Fitur:** KPI (Revenue paid, Outstanding = billed−paid, Expenses, Profit), tabel invoices (`no/date, client, amount, paid, due, status, Record`), list expenses, modal Record payment, modal New invoice → Issue SENT.
- **Akses:** `finance.view` = ADMIN+PM saja (lainnya `Restricted`); `finance.manage` = ADMIN saja (buat invoice + record payment).
- **Alur:** `DRAFT → SENT → PARTIAL → PAID` via `api.recordPayment/saveInvoice/saveExpense`.

### 6.9 Team + Workload (`src/pages/Team.jsx`) — `/team`

- **Tujuan:** kapasitas tim dari beban task nyata.
- **Fitur:** kartu member (Avatar, title/role, ACTIVE badge, workload bar, active/done count, skills), Edit member.
- **Akses:** `users.manage` (ADMIN) untuk +Member/Edit; PM pakai untuk cek sebelum assign.
- **Rumus workload:** `pct = min(100, activeTasks × 13)`.
- **Data:** `users(role, skills, active)` ← `tasks(assignee, status)`.

### 6.10 Activity + Notifications (`src/pages/Activity.jsx`) — `/activity`

- **Tujuan:** audit trail terpusat.
- **Fitur:** filter ALL/NOTIF/LOG, Mark all read, klik notif → markRead + highlight unread, activity log (`at, by, text, entity`, max 20/30 tampil).
- **Akses:** semua login; STAFF hanya `notifications.to == me`, PM/ADMIN lihat semua.
- **Alur:** setiap `api.*` append ke keduanya.

### 6.11 Calendar (`src/pages/Calendar.jsx`) — `/calendar`

- **Tujuan:** agregator jadwal lintas modul (grid bulanan Senin–Minggu). **Read-only.**
- **Fitur:** toggle MINE/All team (STAFF default MINE), prev/next bulan, cell (2 preview desktop / dot mobile, highlight today), drawer detail hari (Badge kind+status).
- **Sumber tanggal:** `tasks.deadline`, `projects.deadline`, `maintenance.nextDue`, `content.publishDate`, `leads.followUp`.
- **Filter MINE:** `tasks.assignee`, `maintenance.pic`, `leads.owner == me`; `projects` disembunyikan di MINE; `content` selalu all.

### 6.12 Roadmap + Rate Card (`src/pages/Roadmap.jsx`) — `/roadmap`, `/ratecard`

- **Tujuan:** strategi 90 hari + acuan harga tunggal. Tidak campur daily tasks.
- **Fitur Roadmap:** kartu (`goal, milestone+status, progress, owner, target`). **Fitur RateCard:** grid (`service, scope, price/unit IDR`).
- **Akses:** view semua role; **tidak ada cek `canDo`** (edit via seed/Settings). Rate card dipakai untuk estimasi `leads.value / projects.value / invoices.amount`.
- **Seed awal:** 5 item rate (Company Profile 3,5jt, Landing 2,5jt, UI/UX 2,8jt/flow, Maintenance 750rb/bln, Automation 1,8jt).

### 6.13 Settings (`src/pages/Settings.jsx`) — `/settings`

- **Tujuan:** konfigurasi bisnis + otomasi + recurring + rate card.
- **Fitur:** form Business name, GAS URL (`/exec` Apps Script), notif rules (`deadlineSoonDays` default 2, `maintenanceSoonDays` default 5), panel Automation (5 rules + `Run now`), Recurring Pause/Resume, Rate card list.
- **Akses:** `settings.manage` (ADMIN) untuk save; `recurring.manage` untuk pause/resume; lain read-only.

### 6.14 Login (`src/pages/Login.jsx`) — `/login`

- **Tujuan:** entry RBAC + demo cepat.
- **Fitur:** form email+password → `login()` → `/`, error box, 3 tombol demo, panel branding (stats + alur + note Sheets=DB).
- **Alur:** auth → `me` di store → seluruh `canDo()` + filter data mengikuti.

### 6.15 Layout & Komponen (`src/components/`)

- **`Layout.jsx`:** sidebar sticky (logo D + NAV per role + kartu help rate card), topbar (global search min 2 huruf → leads/clients/projects/tasks/invoices, tombol Today, bell unread, avatar menu Settings/Sign out), bottom-nav mobile (5 item pertama + safe-area), drawer mobile.
- **`ui.jsx`:** `Card, Badge, Avatar(initials), Empty, Field, Modal (bottom-sheet mobile), Progress (gradient brand), SearchInput`. Murni presentasional.
- **`format.js`:** `IDR()` (Rp id-ID), `fmtDate/fmtDateTime` (en-GB), `todayISO/nowISO/addDays/daysUntil`, `uid(prefix)`, `initials`, `STATUS_COLORS + badgeClass`.

---

## 7. Yang Perlu Diketahui Operator Harian

1. **Login sesuai role.** Jangan pakai akun ADMIN untuk kerja harian staff — notifikasi dan filter akan salah sasaran.
2. **Follow-up lead jangan kosong.** Calendar + Dashboard "Needs attention" hanya membaca `followUp`. Lead tanpa follow-up = invisible.
3. **Assign task harus jelas assignee + deadline.** Tanpa itu task tidak muncul di workload Team dan Calendar.
4. **Tutup task dengan DONE + notes, bukan hapus.** Tidak ada fitur hapus — progress project dan audit bergantung padanya.
5. **Maintenance wajib di-Complete, bukan dibiarkan OVERDUE.** Complete yang memicu siklus berikutnya + task otomatis.
6. **Invoice SENT dulu baru Record payment.** Jangan catat pembayaran di notes — Outstanding tidak akan berkurang.
7. **Jalankan `Run automation` tiap pagi** (sampai trigger Apps Script live). Ini yang generate routine harian + notifikasi overdue.
8. **Cari cepat lewat topbar** (min 2 huruf). Klik hasil langsung lompat ke modul asal.
9. **Bell merah = kerjaan kamu.** `Activity → Mark all read` setelah diproses.

---

## 8. Skema Data (Sheets / Seed)

Dua spreadsheet production (lihat `Code.gs` `ops_()/leads_()`), 17 sheet. Header lengkap versi rencana ada di `ARCHITECTURE.md §4`. Yang benar-benar dipakai kode backend saat ini:

| Sheet | Kolom dipakai kode | ID |
|---|---|---|
| `01_LEADS` | id, business, phone, category, owner, value, stage | `L###` |
| `02_OUTREACH` | id, leadId, date, channel, result, by, note | `O###` |
| `03_CLOSING` | leadId, clientId, value, at, by | — |
| `01_CLIENTS` | id, leadId, company, phone, industry, pic, status | `C###` |
| `02_PROJECTS` | id (+ `progress` untuk recalc) | `P###` |
| `03_TASKS` | id, title, assignee, projectId, type, deadline, status, progress, createdBy, createdAt, autoRule, maintenanceId | `T###` |
| `04_MAINTENANCE` | id, service, pic, status, nextDue, intervalDays, history(JSON) | `M###` |
| `05_FINANCE_INV` / `06_FINANCE_EXP` | dideklarasikan, **belum ada logic backend** | `INV###` / `E###` |
| `07_TEAM` | id, email, name, role, active | `U###` |
| `08_ACTIVITY` | id, at, by, text, entity | `ACT###` |
| `09_NOTIFICATIONS` | id, to, title, msg, type, entity, at, read | `NOTIF###` |
| `10_RECURRING` | id, name, weekday(0–6), title, assignee, type, active | `R###` |
| `11_CONTENT` | dideklarasikan, **belum ada logic backend** | `CT###` |
| `12_SETTINGS` | deadlineSoonDays (default 2) | — |
| `13_ROADMAP` / `14_RATECARD` | dideklarasikan, **belum ada logic backend** | `RD` / `RC` |

Enum penting:
- Lead stage: `NEW|QUALIFIED|CONTACTED|RESPONDED|MEETING|PROPOSAL_SENT|NEGOTIATION|WON|LOST`
- Project status: `PLANNING|DESIGN|DEVELOPMENT|REVIEW|REVISION|DEPLOYMENT|COMPLETED|ON_HOLD|CANCELLED`
- Task type: `PROJECT|ROUTINE|CONTENT|MAINTENANCE|SALES|INTERNAL|ADMIN`; status: `TODO|IN_PROGRESS|IN_REVIEW|DONE|BLOCKED`
- Maintenance: `SCHEDULED|UPCOMING|IN_PROGRESS|COMPLETED|OVERDUE|CANCELLED`
- Finance: `DRAFT|SENT|PARTIAL|PAID`, payStatus maintenance: `PAID|UNPAID`

Relasi (ID adalah key, jangan join by nama):
```
LEADS 1—N OUTREACH · LEADS 1—0/1 CLIENTS (leadId dipertahankan)
CLIENTS 1—N PROJECTS 1—N TASKS(type=PROJECT)
CLIENTS 1—N MAINTENANCE 1—N TASKS(maintenanceId)
CLIENTS/PROJECTS 1—N INVOICES · USERS 1—N TASKS/PROJECTS/MAINTENANCE
* —N ACTIVITY/NOTIFICATIONS · RECURRING —generates→ TASKS(autoRule+date)
```

---

## 9. API & Otomasi

### 9.1 Kontrak API (`doPost {token, action, payload}`)

Frontend (`store.jsx api.*`) vs Backend (`Code.gs ACTIONS`):

| Action frontend | Ada di backend? | Catatan |
|---|---|---|
| `saveLead / setStage` | ✅ `leads.save` (parsial, tanpa setStage khusus) | — |
| `addOutreach` | ✅ `outreach.add` | — |
| `convertLead` | ✅ `leads.convert` | + tulis `03_CLOSING` |
| `saveClient / saveProject` | ❌ belum ada | harus ditambah `clients.save`, `projects.save` |
| `saveTask / quickStatus` | ✅ `tasks.assign` + `tasks.updateOwn` | `updateOwn` tolak STAFF jika bukan miliknya |
| `saveContent / saveRecurring` | ❌ belum ada | harus ditambah |
| `saveMaintenance / completeMaintenance` | ✅ `maintenance.complete` saja | `save` (ADMIN) belum ada |
| `saveInvoice / recordPayment / saveExpense` | ❌ belum ada | harus ditambah `invoices.save`, `payments.record` |
| `saveUser / saveSettings` | ❌ belum ada | harus ditambah (ADMIN) |
| `leads.list` | ✅ | satu-satunya `list` — list lain belum ada |

Setiap action backend: `authenticate → role → require_(perm) → validate → LockService → mutate → log_/notify_`. `doGet` hanya healthcheck `{ok, app, actions}`.

### 9.2 Otomasi

| Trigger | Job | Implementasi ganda |
|---|---|---|
| Harian 07:00 `dailyGenerate_` | recurring weekday → tasks (idempoten `autoRule+date`) | `store.jsx runAutomation` + `Code.gs` |
| Harian 08:00 `dailyCheck_` | overdue/soon tasks, maintenance due/overdue, follow-up, payment overdue → notifications | sama |
| On task DONE | `recalcProject_` → progress = done/total | sama |
| On maintenance DONE | nextDue = today+interval → task baru + notify PIC | sama |
| On lead WON | buat CLIENT + CLOSING row | sama |
| Tombol `Run automation` / `Run now` | jalankan cek di atas terhadap mirror lokal | `store.jsx` |

Idempoten dijaga via key harian di activity (`overdue:T:id:date`, `soon:`, `maint:`, `pay:`) — tidak spam notif 2x di hari yang sama.

### 9.3 PWA

`vite-plugin-pwa`: manifest standalone tema emerald `#047857`, ikon SVG 192/512 + maskable, Workbox cache-first shell + fonts, service worker auto-update, bottom-nav safe-area, installable desktop/mobile.

---

## 10. Cara Go-Live ke Google Sheets (Checklist)

1. Buat 2 spreadsheet (`DATA PELANGGAN` + `MONITORING DIGNIFY`) dengan header dari `ARCHITECTURE.md §4`.
2. Paste `apps-script/Code.gs` → Extensions → Apps Script → set Script Properties `OPS_SPREADSHEET_ID`, `LEADS_SPREADSHEET_ID`, `FIREBASE_API_KEY` (+ `FIREBASE_PROJECT_ID`) → run `setupTriggers_()` → Deploy as Web App (`Execute as: Me`, akses `Anyone`).
3. Paste URL `/exec` ke Settings → Apps Script API URL (`gasUrl`).
4. Wire Firebase Auth (email/password + Google), ganti `login()` demo (password hardcoded `dignify123`) dengan token-based calls. Nama action sudah sama.
5. **Lengkapi dulu 8 action yang hilang** (lihat tabel §9.1) + `list` untuk clients/projects/tasks/invoices — tanpa ini Finance/Content/Team/Settings tidak bisa live.
6. Uji: konversi lead → project → task DONE → progress 100% → invoice PAID → maintenance rollover → cek `08_ACTIVITY` + trigger 07:00/08:00.

---

## 11. Temuan Audit & Rekomendasi (Penting)

| # | Temuan | Dampak | Rekomendasi |
|---|---|---|---|
| 1 | Backend hanya 7 actions, frontend butuh ~15. `clients.save`, `projects.save`, `invoices.save`, `payments.record`, `content.save`, `recurring.save`, `users.save`, `settings.save` belum ada | Go-live setengah jalan, data finance/client/project tidak tersimpan di Sheets | Lengkapi `Code.gs` sebelum klaim production |
| 2 | Auth demo hardcoded (`PASSWORD='dignify123'`, session = user id di localStorage) | Siapa pun bisa login sebagai siapa pun, tanpa verifikasi | Wajib Firebase `idToken` + verifikasi server seperti desain `auth_()` |
| 3 | `Code.gs auth_` panggil `tokeninfo` tapi variabel `identitytoolkit getAccountInfo` tidak dipakai; `CONFIG` tidak ada `FIREBASE_API_KEY` | Membingungkan, rawan salah config | Bersihkan dead code, samakan config |
| 4 | ID generation beda: frontend `uid()` random + counter max, backend `nextId_` scan max. `saveLead` frontend ada kode ID mati (`L00x` lalu ditimpa) | Risiko collision / ID tidak konsisten | Satukan strategi (server jadi penentu saat live) |
| 5 | Roadmap/RateCard tanpa cek RBAC di frontend, tanpa backend | Bisa diubah siapa pun via seed/settings | Tambah `roadmap.manage` guard + API |
| 6 | `recalcProject` frontend silent saat 100% (status tidak auto-COMPLETED, by design PM konfirmasi) tapi tidak ada pengingat | Project 100% menggantung di DEVELOPMENT | Tambah notif "ready for delivery review" saat 100% |
| 7 | Activity/notifications di-slice 300, tanpa pagination & tanpa hapus | Data lama hilang diam-diam | Arsip ke sheet / pagination + retensi jelas |
| 8 | Finance tanpa validasi amount > 0, tanpa nomor invoice unik server-side | Duplikat `INV-0xx`, amount nol | Validasi + `nextId_` untuk `no` |
| 9 | Calendar read-only tanpa deep-link (klik tanggal tidak lompat ke task) | Operator harus cari manual | Tambah navigasi ke modul asal via `entity` |
| 10 | Tidak ada test otomatis (`package.json` tanpa script test) | Regresi tidak ketahuan | Tambah Vitest minimal untuk `permissions`, `recalc`, `convert` |

Hal baik yang patut dipertahankan: guard 3 lapis, konversi tanpa re-typing, progress derivatif, maintenance rollover otomatis, idempoten automation, global search, bottom-nav mobile, design system `ui.jsx` konsisten.

---

## 12. Lampiran: File → Tanggung Jawab

| File | Isi / tanggung jawab |
|---|---|
| `src/App.jsx` | Routes + Guard + toast container |
| `src/lib/permissions.js` | `PERMISSIONS`, `can()`, `NAV` per role |
| `src/lib/store.jsx` | `load()`, `login/logout`, `guard()`, `log/notify`, `recalcProject`, `runAutomation`, `api.*` |
| `src/lib/seed.js` | `seedDB()` data demo realistis |
| `src/lib/format.js` | Format IDR/tanggal/uid/warna |
| `src/components/Layout.jsx` | Sidebar/topbar/search/bell/bottom-nav |
| `src/components/ui.jsx` | Atom UI |
| `src/pages/*.jsx` | 14 halaman (lihat §6) |
| `apps-script/Code.gs` | API + trigger production |
| `ARCHITECTURE.md` | ERD + skema + kontrak (acuan go-live) |
| `vite/tailwind/index.html` | Build + PWA + tema emerald |

> Jika ada yang tidak sesuai antara file ini dan kode, **kode adalah kebenaran** — perbarui file ini mengikuti kode.
