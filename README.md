# CMR Weekly Digital Diary

Phase 1 (essential features): student login/registration against a pre-loaded
roster, weekly diary write/save/submit, previous entries, and an admin
dashboard for student management, submission monitoring, and CSV export.

Stack: React + Vite + TypeScript + shadcn/ui (frontend), Express (backend API),
Supabase (Postgres + Auth).

## 1. Apply the database schema

Supabase project: `ovncyabynsssugruoybd`. Migrations live in
`backend/database/`, applied in order.

1. Open the Supabase Dashboard → SQL Editor for this project.
2. Paste the contents of `backend/database/0001_init.sql` and run it.
   This creates `students`, `admins`, `diary_entries`, `course_settings`,
   and the RLS policies.
3. Paste and run `backend/database/0002_case_insensitive_email.sql` — makes
   email uniqueness case-insensitive, matching how the API looks accounts up.
4. By default `course_settings.course_start_date` is set to today with
   `total_weeks = 12`. Update it once via the admin API (see below) or
   directly in the table editor to match the actual course start date.
5. Paste and run `backend/database/0007_intakes.sql` and
   `backend/database/0008_applications.sql` — these add the admin-managed
   `intakes` table (landing page content) and the `applications` table
   (in-app applicant registration). See `SRS/intake-management.md`.
6. In the Supabase Dashboard, create a **private** Storage bucket named
   `application-documents` (Storage → New bucket → leave "Public bucket"
   unchecked). This is where uploaded degree documents and payment slips
   are stored; there is no SQL migration for it.
7. Paste and run `backend/database/0009_link_course_settings_to_intake.sql`
   — replaces the old free-text `course_settings.intake_label` with a real
   `intake_id` reference to the `intakes` table, so the diary's "current
   cohort" is the same intake row shown everywhere else, not a duplicate
   label an admin had to keep in sync by hand.
8. Paste and run `backend/database/0010_application_enrollment_link.sql` —
   adds `applications.enrolled_student_id`. Approving an application now
   automatically enrolls the applicant onto the `students` roster (or links
   an existing roster row with the same email) instead of requiring a
   separate manual "add student" step.
9. Optional: paste and run `backend/database/0011_seed_tshmp_intake.sql` to
   seed intake 3 with the real course content from
   https://med.cmb.ac.lk/academic-programs/tshmp/ (modules, objectives,
   eligibility, fee note) as a `closed`/unpublished historical record —
   useful as a starting point to duplicate from when creating the next
   intake in `/admin/intakes`, since fees and the exact commencing date
   weren't published on that page and are left blank for an admin to fill in.

New schema changes go in a new `backend/database/NNNN_description.sql` file,
numbered after the last one — there's no migration runner, each file is
pasted into the SQL Editor once and is safe to re-run (`if not exists` /
`if exists` guards throughout).

## 2. Backend setup

```bash
cd backend
cp .env.example .env   # already pre-filled with the Supabase URL/keys for this project
npm install
npm run dev             # http://localhost:4000
npm test                 # vitest — unit + route-level tests
npm run lint              # eslint
```

Provision the first admin account (creates both the Supabase Auth user and
the `admins` row):

```bash
npm run create-admin -- --email you@cmr.org --password "SomeStrongPassword123" --name "Your Name" --role admin
```

Load the student roster from a CSV (`studentNumber,name,email` header):

```bash
npm run import-students -- /path/to/roster.csv
```

(Students can also be added one at a time from the admin UI.)

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env   # already pre-filled with the Supabase URL/anon key
npm install
npm run dev             # http://localhost:5173
```

- `/` is a public landing page (marketing/overview); it redirects straight to
  `/dashboard` or `/admin` if you're already signed in.
- Admins log in at `/login` with the credentials from `create-admin` and are
  routed to `/admin`.
- Students self-register once at `/register` using the email + student ID an
  admin pre-loaded, then log in at `/login` and land on `/dashboard`.

## Notes on the setup

- **Auth**: Supabase Auth (email/password) is used directly from the
  frontend for sign-in; the Express API verifies the resulting JWT on every
  request via the service-role key. Nothing but Supabase Auth calls touch
  the anon key from the browser.
- **Roster gating**: a student can only create an account if their email +
  student ID match a row an admin already added — this is what "only
  registered course students can access" is built on.
- **Admins**: provisioned out-of-band via `npm run create-admin`, not
  through a signup form, since admin accounts are expected to be rare and
  manually vetted.
- **Editing after submission**: currently *not* allowed (submitted entries
  are read-only for students) to protect data integrity for research use.
  This was an explicit "decide later" item in the requirements — flip it by
  removing the `status === 'submitted'` guards in
  `backend/src/routes/diary.js` if you want to allow edits.
- **Confidentiality**: `diary_entries` and `students` both have RLS enabled
  (students can only see their own rows, admins can see everything via the
  `is_admin()` check) as defense-in-depth. In the current architecture the
  Express backend is the only thing that talks to these tables directly
  (with the service-role key, which bypasses RLS) — so the actual access
  control enforcement happens in `backend/src/middleware/auth.js` on every
  request.
- **Research opt-out / de-identified export**: `diary_entries` and
  `students` have a `research_opt_out` column, and `/api/admin/export.csv`
  accepts `?deidentified=true`, ahead of the Phase 3 research features.

## Production hardening

Beyond the Phase 1 feature set, the backend has:

- **Fail-fast config** (`backend/src/config/env.js`): validates all env vars
  with zod at startup (via `PORT`, `SUPABASE_URL`, etc.) instead of failing
  confusingly mid-request; refuses to boot in `NODE_ENV=production` without
  an explicit `CORS_ORIGIN`.
- **Centralized error handling**: every route throws `AppError` or lets a
  zod `ParseError` propagate; `express-async-errors` + one error-handling
  middleware (`middleware/errorHandler.js`) turns those into consistent
  `{ error, requestId }` JSON responses and logs unexpected ones. No route
  hand-rolls `try/catch` + `res.status(...).json(...)` anymore.
- **Input validation everywhere** (`src/schemas/*.schema.js`, zod): request
  bodies, query params, and route params are parsed and type-coerced before
  a handler runs.
- **Rate limiting** (`express-rate-limit`): a general API budget plus a
  tighter one on `/api/auth/register` (account creation shouldn't be
  hammerable).
- **Security headers** (`helmet`) and **response compression**
  (`compression`).
- **Structured logging** (`pino` / `pino-http`): every request gets a
  request ID (returned as `X-Request-Id` and in error bodies), pretty-printed
  in development, JSON in production.
- **Graceful shutdown**: `SIGTERM`/`SIGINT` drain in-flight requests before
  exiting; `uncaughtException`/`unhandledRejection` are logged instead of
  crashing silently.
- **Bounded queries**: `/api/admin/students` and `/api/admin/entries` accept
  `page`/`pageSize` and are capped, so an admin page never triggers an
  unbounded table scan as data accumulates across course offerings.
- **No filter-injection surface**: the admin student search used to
  interpolate the search term into a PostgREST `.or()` filter string; it now
  filters in application code, and any remaining `ilike` lookups escape
  `%`/`_` first.
- **Case-insensitive email uniqueness** (`0002_case_insensitive_email.sql`):
  the original unique constraints were case-sensitive, so `Jane@x.com` and
  `jane@x.com` could both be inserted.
- **Tests** (`backend/test/`, vitest + supertest): pure-function coverage
  for the week/word-count logic, plus route-level tests for auth guarding,
  validation, and the health check.
- **CI** (`.github/workflows/ci.yml`): lint + test the backend, lint +
  typecheck + build the frontend, on every push/PR to `main`.

The frontend has:

- **Route-level code splitting** (`React.lazy`): the initial bundle dropped
  from one 662 KB chunk to a ~280 KB main chunk plus small per-page chunks
  loaded on navigation.
- **A top-level error boundary** so a render error shows a recovery screen
  instead of a blank page.
- **Sensible React Query defaults**: no retries on 4xx (auth/validation
  errors won't succeed on retry), 30s stale time, no refetch storms on
  window focus.

None of this changes behavior for the 100-ish concurrent users this is
sized for — Supabase and a single Express instance handle that load
trivially. It's about not falling over on bad input, not leaking stack
traces, and not silently truncating data as it accumulates over semesters.

## What's not in this Phase 1 build

Per the priority table in the requirements: weekly reminders, meditation
log, mood check-in, gratitude journal (Phase 2); personal goals, meditation
statistics, pre/post assessments, research dashboard (Phase 3). The schema
was designed so these can be added as new columns/tables without reworking
what's here — e.g. a `meditation_logs` or `wellbeing_checkins` table keyed
on `(student_id, week_number)` alongside `diary_entries`.

Also now built: admin-managed course intakes and in-app applicant
registration, replacing the old hardcoded landing page content and the
external Google Form. Admins manage intakes at `/admin/intakes` and review
submitted applications (including uploaded documents and a CSV/Excel
export) at `/admin/applications`; prospective applicants apply at `/apply`.
See `SRS/intake-management.md` for the full design.

## Security note

The Supabase `service_role` key bypasses all row-level security and must
never reach the frontend or a public repo. It currently lives only in
`backend/.env`, which is gitignored. Since it was pasted in plaintext into
this chat session, consider rotating it from the Supabase Dashboard
(Settings → API) once you've finished initial setup, and generate a fresh
one for the running backend.
