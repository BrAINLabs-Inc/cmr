# SRS: Admin-Controlled Course Intake Management

**Status:** Planned — not yet implemented. This document specifies a future
feature; no code in this repository currently implements it.

**Related code (as of this writing):** the course/intake details this
feature would replace are hardcoded in
`frontend/src/pages/LandingPage.tsx` (`MODULES`, `OBJECTIVES`, `FACTS`,
`APPLY_STEPS`, and the intake badges in the hero section).

## 1. Purpose

The public landing page (`/`) advertises the currently-open intake of the
Certificate Course — modules, objectives, eligibility, fees, dates, and the
external application form link. All of this is presently hardcoded in the
frontend. Every new intake (04th, 05th, ...) currently requires a code
change and a redeploy to update: the intake number, closing date, module
list, fees, commencing date, and the Google Form link.

This feature moves that content into the database, with an admin UI to
manage it, so CMR staff can open a new intake, extend a closing date, or
correct a typo without involving a developer.

## 2. Background

The course is run in intakes (the diary system currently serves the 03rd
intake). Each intake has its own:

- Intake number and status (upcoming / open / closed)
- Application closing date (which has already needed a one-off extension —
  see "Closing Date — EXTENDED" on the current landing page)
- Commencing date, duration, and mode
- Fee structure (course fee, application fee, registration fee — each with
  local/foreign variants)
- Module list and general objectives (these change more rarely, but do
  change between curriculum revisions)
- External registration form URL (a new Google Form per intake)

None of this is student diary data — it's marketing/admissions content — so
it does not touch the existing `students`, `admins`, or `diary_entries`
tables or their RLS policies.

## 3. Goals

- CMR admins can create a new intake, edit an existing one, and control
  which intake (if any) is shown on the public landing page, entirely
  through the admin UI.
- The public landing page renders the active intake's content from the
  database instead of hardcoded constants.
- Past intakes remain in the database as records (not necessarily shown
  publicly) rather than being overwritten, so there's a historical log of
  past cohorts, fees, and closing dates.
- Non-technical staff can safely make routine changes (extend a deadline,
  fix a typo, swap the registration link) without a deploy.

## 4. Non-Goals

- Building a full CMS / rich-text editor. Structured fields are sufficient
  (this is a handful of well-known fields, not freeform marketing copy).
- Collecting applications directly (the Google Form stays external; this
  feature only manages the landing page's *description of* the intake and
  the link to that form).
- Multi-language content.
- Showing multiple concurrently-open intakes on the landing page in v1 —
  assume exactly zero or one "published" intake at a time, matching how the
  course actually runs today.

## 5. Users

- **CMR admin** (existing `admins` role): can create/edit/publish intakes.
  No new role is needed — this reuses the existing admin authentication and
  `requireAdmin` middleware described in `backend/src/middleware/auth.js`.
- **Prospective applicant** (public, unauthenticated visitor to `/`): reads
  the published intake's content; not a system user.

## 6. Functional Requirements

- **FR-1** An admin can create a new intake record with: intake number,
  course title, status, application closing date, commencing date,
  duration text, mode text, module list, objectives list, eligibility
  text, fee breakdown, registration form URL, and contact details.
- **FR-2** An admin can edit any field of an existing intake.
- **FR-3** An admin can mark exactly one intake as "published" (shown on
  the public landing page). Publishing one intake should be exclusive —
  the UI/API should make it obvious only one can be active, matching the
  `course_settings` singleton pattern already used elsewhere in this
  schema.
- **FR-4** An admin can mark an intake's status as `upcoming`, `open`, or
  `closed` independent of publish state (e.g. keep it published but show a
  "closed" badge instead of "now on" once the deadline passes).
- **FR-5** The public landing page fetches the published intake from a
  public (unauthenticated) endpoint and renders it; if no intake is
  published, the page falls back to a generic "applications currently
  closed" state rather than erroring.
- **FR-6** An admin can view a list of past intakes (read-only history).
- **FR-7** Deleting an intake is either disallowed or soft-delete only —
  once an intake has been published, its record is a historical fact
  (previous applicants may reference it) and shouldn't disappear outright.

## 7. Proposed Data Model

A new table, additive only — no changes to existing tables:

```sql
create table if not exists intakes (
  id uuid primary key default gen_random_uuid(),
  intake_number int not null,
  course_title text not null default 'Translating the Science of Happiness and Meditation into Practice',
  status text not null default 'upcoming' check (status in ('upcoming', 'open', 'closed')),
  is_published boolean not null default false,

  application_closing_date date,
  closing_date_note text,        -- e.g. "EXTENDED" — free text badge shown next to the date
  commencing_date date,
  duration_text text,            -- e.g. "08 Months, Part-time (July 2026 – March 2027)"
  mode_text text,                -- e.g. "Hybrid — primarily onsite with selected online sessions"
  lecture_schedule_text text,    -- e.g. "Saturdays, 9:00 am – 4:00 pm"

  modules jsonb not null default '[]',      -- ordered string array
  objectives jsonb not null default '[]',   -- ordered string array
  eligibility_text text,
  eligibility_special_category text,

  fee_course text,               -- e.g. "Free of Charge — LKR 50,000 sponsored by Rekhi Foundation"
  fee_application_local text,
  fee_application_foreign text,
  fee_registration_local text,
  fee_registration_foreign text,

  registration_form_url text,
  contact_email text,
  contact_website_url text,
  academic_programme_url text,
  funded_by text,                -- e.g. "Rekhi Foundation for Happiness"

  created_by uuid references admins (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_intakes_published
  on intakes ((true)) where is_published;
```

The `idx_intakes_published` partial unique index enforces "at most one
published intake" at the database level (a second `UPDATE ... SET
is_published = true` on another row will fail the constraint unless the
first is unpublished first), so the exclusivity in FR-3 doesn't rely on
application logic alone.

`modules`/`objectives` as `jsonb` string arrays keep this to one table; if
per-module structure grows (e.g. a module gets its own description or
instructor), split into an `intake_modules` child table at that point —
not needed for the fields listed above.

RLS: enable it, with a public `select` policy restricted to
`is_published = true` (so the anon key could serve this directly if ever
desired), and admin-only `insert`/`update`, mirroring the pattern already
used for `course_settings` and `is_admin()` in
`backend/database/0001_init.sql`.

## 8. Proposed API

Following the existing route structure (`backend/src/routes/`):

- `GET /api/public/intake` — **unauthenticated**. Returns the published
  intake, or `{ intake: null }` if none. Used by the landing page.
- `GET /api/admin/intakes` — list all intakes (admin only), newest first.
- `POST /api/admin/intakes` — create an intake (admin only).
- `PATCH /api/admin/intakes/:id` — update an intake, including toggling
  `is_published` / `status` (admin only). Publishing should unpublish any
  currently-published intake in the same transaction (or rely on the
  partial unique index and surface its conflict as a clear error).
- `GET /api/admin/intakes/:id` — fetch one (admin only).

All admin routes reuse `requireAuth` + `requireAdmin`
(`backend/src/middleware/auth.js`) and zod validation
(`backend/src/middleware/validate.js`), consistent with every other admin
route in this codebase.

## 9. Admin UI

- New sidebar nav item, admin-only: **Intakes** (icon: e.g. `Megaphone` or
  `GraduationCap`), added to `adminNav` in
  `frontend/src/components/layout/nav-config.ts`.
- `/admin/intakes` — table of intakes (number, status, published?, closing
  date) with a "New Intake" action, matching the existing
  `AdminStudentsPage`/`AdminEntriesPage` table + dialog pattern.
- `/admin/intakes/:id` (or a dialog/sheet) — a form with the fields from
  §7, grouped the same way the landing page groups them (Overview,
  Modules, Objectives, Eligibility, Duration & Mode, Fees, Application).
  Modules/objectives as a simple repeatable text-list input (add/remove
  row), not a rich text editor.
- A "Publish this intake" action that's clearly exclusive (e.g. a
  confirmation dialog explaining it will unpublish the currently active
  one).

## 10. Landing Page Changes

`frontend/src/pages/LandingPage.tsx` changes from hardcoded constants
(`MODULES`, `OBJECTIVES`, `FACTS`, `APPLY_STEPS`, the hero badges) to a
`useQuery` against `GET /api/public/intake`, with:

- A loading skeleton state (consistent with every other page in this app).
- A graceful empty state when no intake is published ("Applications are
  currently closed — check back soon" or similar), instead of the hero
  section crashing or rendering blank.
- The QR code (already implemented with `qrcode.react`) continues to
  encode whatever `registration_form_url` the active intake has, so it
  updates automatically per intake.

The "For enrolled students" section (diary portal explanation,
confidentiality note, sign-in CTAs) is intake-independent and stays as
static content.

## 11. Non-Functional Requirements

- **Validation:** dates must be valid; `intake_number` positive; URLs
  well-formed — via zod schemas, same as every other admin route.
- **Authorization:** only `admins` rows can create/edit intakes; the public
  endpoint never exposes unpublished intakes or the `created_by` field.
- **Auditability:** `created_by` + `updated_at` are enough for this scale;
  a full history/audit log is not warranted for a handful of admin-edited
  rows per year.
- **No RLS regression:** this table is independent of `students` /
  `diary_entries`; nothing about diary confidentiality changes.

## 12. Rollout Plan

1. Add `backend/database/000X_intakes.sql` (numbered after whatever the
   latest migration is at implementation time) with the schema from §7,
   applied the same way as prior migrations (pasted into the Supabase SQL
   Editor — see the root `README.md`).
2. Backend: `src/routes/intakes.js` (admin CRUD) +
   `src/routes/public.js` (or a `/api/public` prefix on a shared router)
   for the read-only endpoint; wire into `src/app.js`.
3. Seed the current (03rd) intake's data — the content already written
   into `LandingPage.tsx` — as the first row via the new admin UI or a
   one-off SQL insert, and mark it published.
4. Frontend: build `/admin/intakes` list + form, then switch
   `LandingPage.tsx` from constants to the `GET /api/public/intake` query.
5. Remove the hardcoded constants from `LandingPage.tsx` once the data-driven
   version is verified against the current intake's real content.

## 13. Open Questions

- Should closed/past intakes ever be publicly browsable (an "intake
  history" page), or admin-only? Not needed for launch; revisit if CMR
  asks for it.
- Does an intake ever need more than one registration link (e.g. separate
  local/foreign forms)? Current source material has one link for both —
  assume one unless told otherwise.
- Should publishing an intake trigger any notification (e.g. to a mailing
  list)? Out of scope here — CMR currently announces intakes through its
  own channels; this feature only controls what the landing page shows.
