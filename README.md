# RecruitFlow — multi-tenant recruitment SaaS

Next.js 16 · Prisma · PostgreSQL · Better Auth (organizations) · Tailwind CSS 4.
Theme: **teal green** (actions, highlights) and **navy blue** (structure, text).

## What's included

| Area | Route | Notes |
| --- | --- | --- |
| Landing page | `/` | Marketing page with sign-up call to action |
| Auth | `/signup`, `/login` | Sign-up creates the user **and** their company (tenant) with a default pipeline |
| Dashboard | `/dashboard` | KPIs, pipeline overview, recent applicants, open jobs, careers link |
| Jobs | `/jobs`, `/jobs/new`, `/jobs/[id]`, `/jobs/[id]/edit` | Status filters, publish/close/reopen, delete (owner/admin), per-job applicants |
| Applicants | `/applicants`, `/applicants/new`, `/applicants/[id]` | Search, filter by job/stage, sort by match; add candidates manually |
| Candidate profile | `/applicants/[id]` | One-click stage moves, keyword match score, CV, team notes, activity trail, email with templates |
| Pipeline board | `/pipeline` | Drag-and-drop Kanban (plus arrow buttons for keyboard/touch), filter by job |
| Settings | `/settings` | Company name, modules, rename/reorder/add/delete pipeline stages, team list |
| Public careers site | `/apply/[company-slug]`, `/apply/[company-slug]/[jobId]` | Lists OPEN jobs; application form with spam honeypot and duplicate check |

### How the pieces fit
- **Tenancy:** every protected page and server action calls `requireRecruitment()` (`lib/tenant.ts`) and queries through `tenantDb(organizationId)` (`lib/tenant-db.ts`), which forces the organization filter on every query.
- **Roles:** `lib/permissions.ts`. Owners/admins manage jobs, settings and deletions; members can review, move and email candidates.
- **Audit trail:** every stage move writes a `StageHistory` row (who, from, to, when).
- **Screening:** `lib/screening.ts` scores each application by how many key terms from the job posting appear in the candidate's experience/CV, and lists what matched and what's missing. It runs on every new application and can be re-run from the profile. It's a drop-in point for an LLM later.
- **Email:** `lib/email.ts` sends through Resend's HTTP API when `RESEND_API_KEY` and `EMAIL_FROM` are set; otherwise it prints to the server console and logs the email as `LOGGED`. Templates live in `lib/email-templates.ts`.

## Theme

Colours are defined once in `app/globals.css`:

- `navy-50 … navy-950` — custom scale (sidebar `navy-900`, text `navy-900/500`)
- Tailwind's `teal-*` — buttons (`teal-600`), links (`teal-700`), highlights (`teal-300/400`), focus rings (`teal-500`)

Shared class strings and components (buttons, inputs, cards, badges, stage colours) are in `components/ui.tsx`, so changing the look in one place updates the whole app.

## Getting started

```bash
cp .env.example .env          # fill in DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET
npm install
npx prisma migrate deploy     # or: npx prisma migrate dev
npx prisma db seed            # creates the RECRUITMENT module (required)
npm run dev
```

Open http://localhost:3000, click **Start free**, create your company, post a job, set it to **Open**, then open your careers link from the dashboard and apply as a candidate to see the full flow.

No database migration is needed for this version — it uses the existing schema.

## Project structure

```
app/
  page.tsx                 landing page
  login/ signup/           auth (split-screen)
  (app)/                   signed-in area: layout with navy sidebar
    dashboard/ jobs/ applicants/ pipeline/ settings/
  apply/[slug]/            public careers site + application form
components/                ui kit, sidebar, header, shared forms
lib/                       auth, tenancy, permissions, screening, email, validation
prisma/                    schema, migrations, seed
```
