# Setup

## 1. Database

Supabase project: `ovncyabynsssugruoybd`. Migrations live in `backend/database/`
and are applied in order — there's no migration runner, so each file is
pasted into the Supabase Dashboard's SQL Editor once. They're all safe to
re-run (`if not exists` / `if exists` guards throughout).

1. Open the Supabase Dashboard → SQL Editor for this project.
2. Run `backend/database/0001_init.sql` — creates `students`, `admins`,
   `diary_entries`, `course_settings`, and the RLS policies.
3. Run every other file in `backend/database/` in numeric order.
4. Create a **private** Storage bucket named `application-documents`
   (Storage → New bucket → leave "Public bucket" unchecked). This holds
   uploaded degree documents and payment slips; there's no SQL migration
   for it.
5. By default `course_settings.course_start_date` is set to today with
   `total_weeks = 12`. Update it via `/admin/settings` once, to match the
   actual course start date.

New schema changes go in a new `backend/database/NNNN_description.sql`
file, numbered after the last one.

## 2. Backend

```bash
cd backend
cp .env.example .env   # already pre-filled with the Supabase URL/keys
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

Students can also be added one at a time from the admin UI.

## 3. Frontend

```bash
cd frontend
cp .env.example .env   # already pre-filled with the Supabase URL/anon key
npm install
npm run dev             # http://localhost:5173
```

- `/` is the public landing page; it redirects to `/dashboard` or `/admin`
  if you're already signed in.
- Admins log in at `/login` with the credentials from `create-admin` and
  land on `/admin`.
- Students self-register once at `/register` using the email + student ID
  an admin pre-loaded, then log in at `/login` and land on `/dashboard`.
- Prospective applicants apply at `/apply`; admins review applications at
  `/admin/applications` and manage course intakes at `/admin/intakes`.

## Key behaviors

- **Auth**: Supabase Auth (email/password) is called directly from the
  frontend for sign-in; the Express API verifies the resulting JWT on every
  request via the service-role key.
- **Roster gating**: a student can only register if their email + student
  ID match a row an admin already added.
- **Admins**: provisioned out-of-band via `npm run create-admin`, not a
  signup form — admin accounts are rare and manually vetted.
- **Submitted entries are read-only** for students, to protect data
  integrity for research use. Flip this by removing the
  `status === 'submitted'` guards in `backend/src/routes/diary.js`.
- **RLS as defense-in-depth**: `diary_entries` and `students` have RLS
  enabled, but in practice the Express backend (using the service-role key,
  which bypasses RLS) is the only thing that talks to these tables — actual
  access control is enforced in `backend/src/middleware/auth.js`.
- **De-identified export**: `/api/admin/export.csv` accepts
  `?deidentified=true`.

## Security note

The Supabase `service_role` key bypasses all row-level security and must
never reach the frontend or a public repo. It lives only in `backend/.env`,
which is gitignored. Rotate it from the Supabase Dashboard (Settings → API)
if it's ever exposed.
