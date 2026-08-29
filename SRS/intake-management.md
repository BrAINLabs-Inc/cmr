# SRS: Admin-Controlled Intake Management & Applicant Registration

**Status:** Planned — this revision supersedes the original "link out to a
Google Form" design. The reference Google Form
("Certificate Course on Translating the Science of Happiness and Meditation
into Practice — Application Form") has been retired in favor of an in-app
application built from this codebase, described below.

**Related code (as of this writing):** the course/intake details this
feature replaces are hardcoded in `frontend/src/pages/LandingPage.tsx`
(`MODULES`, `OBJECTIVES`, `FACTS`, `APPLY_STEPS`, `REGISTRATION_URL`, and the
intake badges in the hero section). The only existing intake concept in the
schema is `course_settings.intake_label`
(`backend/database/0004_course_intake_label.sql`), a single free-text label
on the singleton row that drives nothing but display — it is unrelated to
this feature and is left untouched.

## 1. Purpose

The public landing page (`/`) advertises the currently-open intake of the
Certificate Course — modules, objectives, eligibility, fees, dates — and,
until now, sent prospective applicants to an external Google Form to apply.
Every new intake required a code change/redeploy to update marketing content,
*and* a separate manual step (rebuilding the Google Form) to open
applications, with payment verification and applicant review done by hand
from the Form's response spreadsheet.

This feature moves both halves into CMR itself:

- **Intake CMS**: admins manage each intake's marketing content and
  application window from the database, through an admin UI.
- **Applicant registration**: prospective applicants fill out and submit
  their application (personal details, education documents, payment slip)
  directly in CMR, against whichever intake is currently open. Admins review
  submissions, verify payment/eligibility documents, change an applicant's
  status, and export the full applicant list to CSV/Excel — all in the admin
  UI, replacing manual work against a spreadsheet of Google Form responses.

## 2. Background

The course runs in intakes (the diary system currently serves the 03rd
intake). Each intake has its own:

- Intake number and status (upcoming / open / closed)
- Application closing date (which has already needed a one-off extension —
  see "Closing Date — EXTENDED" on the current landing page)
- Commencing date, duration, and mode
- Fee structure (course fee, application fee, registration fee — each with
  local/foreign variants) and payment instructions (bank details / online
  portal / a per-intake reference code, as seen on the reference form: "Pay
  through the UOC online payment portal, or at a People's Bank branch using
  application fee code `311150400001` as the reference")
- Module list and general objectives (these change more rarely, but do
  change between curriculum revisions)
- A pool of applications submitted against it

None of this is student diary data — it does not touch the existing
`students`, `admins`, or `diary_entries` tables, RLS policies, or the
roster-gated student self-registration flow at `/register`. It is a
separate, earlier stage: a person applies to an intake before they are ever
added to the student roster. Approving an application does not automatically
create a `students` row — an admin still does that deliberately (see §9),
keeping "who's allowed into the diary system" a single, auditable admin
action as it is today.

The weekly diary itself is one evaluative feature *of* a course intake, not
a parallel concept — it evaluates whichever intake's roster is currently
enrolled. `course_settings` (the singleton that drives the diary's week
timeline — see the root `README.md`) reflects that: instead of the old
free-text `course_settings.intake_label`, it carries `intake_id`, a real
foreign key into this feature's `intakes` table
(`backend/database/0009_link_course_settings_to_intake.sql`). An admin picks
which intake is being evaluated from the same list managed at
`/admin/intakes`, rather than typing a label that could drift out of sync
with the intake it was supposed to describe. This is intentionally *not* the
same as `is_published` — the intake open for new applications and the
intake currently running its diary are often different rows (e.g. intake 4
is published and accepting applications while intake 3's students are still
finishing their diary).

## 3. Goals

- CMR admins can create a new intake, edit an existing one, and control
  which intake (if any) is open for applications and shown on the public
  landing page, entirely through the admin UI.
- The public landing page renders the active intake's content from the
  database instead of hardcoded constants, and links to CMR's own `/apply`
  page instead of an external form.
- Prospective applicants submit their application — personal information,
  education background and qualification documents, and a payment slip —
  through `/apply`, without a Google account or leaving CMR.
- Admins can view every submitted application, open/download the uploaded
  documents to verify eligibility and payment, and mark each application's
  status (e.g. move it from submitted to under review to approved/rejected).
- Admins can export the full list of applications for an intake (or all
  intakes) to a CSV file that opens cleanly in Excel, for offline review,
  shortlisting meetings, or handover to the selection panel.
- Past intakes and their applications remain in the database as records
  rather than being overwritten, so there's a historical log of past cohorts,
  fees, and applicants.
- Non-technical staff can safely make routine changes (extend a deadline,
  fix a typo, close applications, review a submission) without a deploy.

## 4. Non-Goals

- Building a full CMS / rich-text editor. Structured fields are sufficient
  for intake content (this is a handful of well-known fields, not freeform
  marketing copy).
- Taking payment online. The applicant still pays externally (People's Bank
  branch or the university's own payment portal, per the intake's payment
  instructions) and uploads a slip as evidence; CMR never touches money.
- Multi-language content.
- Showing multiple concurrently-open intakes on the landing page/`/apply` in
  v1 — assume exactly zero or one "published + open" intake at a time,
  matching how the course actually runs today.
- A rich in-app document viewer/annotator. Uploaded documents (degree
  certificate, payment slip) are opened via a signed URL in a new tab —
  whatever the browser does with a PDF/image is sufficient for the admin's
  verification step.

## 5. Users

- **CMR admin** (existing `admins` role): can create/edit/publish intakes,
  and view/review/export applications. No new role is needed — this reuses
  the existing admin authentication and `requireAdmin` middleware
  (`backend/src/middleware/auth.js`).
- **Prospective applicant** (public, unauthenticated visitor to `/apply`):
  submits one application against the open intake; not a system user, has no
  login, and cannot view or edit their submission afterward (they keep their
  own payment slip / reference as their record — see Open Questions for a
  possible future confirmation-email/reference-lookup feature).

## 6. Functional Requirements

### 6A. Intake CMS

- **FR-1** An admin can create a new intake record with: intake number,
  course title, status, application closing date, commencing date,
  duration text, mode text, module list, objectives list, eligibility
  text, fee breakdown, payment instructions, and contact details.
- **FR-2** An admin can edit any field of an existing intake.
- **FR-3** An admin can mark exactly one intake as "published" (shown on
  the public landing page). Publishing one intake is exclusive — the
  UI/API makes it obvious only one can be active, enforced at the database
  level (partial unique index), matching the `course_settings` singleton
  pattern already used elsewhere in this schema.
- **FR-4** An admin can mark an intake's status as `upcoming`, `open`, or
  `closed` independent of publish state (e.g. keep it published but show a
  "closed" badge, and stop accepting new applications, once the deadline
  passes).
- **FR-5** The public landing page and `/apply` fetch the published intake
  from a public (unauthenticated) endpoint; if no intake is published, or
  the published intake's status is not `open`, both pages show a graceful
  "applications currently closed" state instead of erroring or rendering a
  broken form.
- **FR-6** An admin can view a list of past intakes (read-only history) and
  how many applications each received.
- **FR-7** Deleting an intake is disallowed once it has any applications
  attached (the foreign key from `applications.intake_id` naturally prevents
  this); an intake with zero applications may still be deleted by an admin
  for correcting a mis-created draft.

### 6B. Applicant Registration

- **FR-8** A prospective applicant can open `/apply`, see the currently open
  intake's summary (title, fees, payment instructions, closing date), and
  submit an application with:
  - Personal information: title, full name (for certificate), name with
    initials, residential address, date of birth, gender, NIC/passport
    number, email, phone number, WhatsApp number (optional — defaults to
    phone number if left blank).
  - Other information: current occupation, education qualification (one of
    Undergraduate / Bachelor's / Master's / MPhil / PhD / Other, with a
    free-text field when "Other" is chosen), the specific degree name
    (e.g. "Bachelor of Science"), up to 5 supporting documents (degree
    certificate / transcript / confirmation letter — PDF, common document,
    or image formats, 10 MB each), an optional free-text reason for
    joining, an optional yes/no on prior meditation practice, how they
    heard about the course (Social Media / Website / Friends / Other, with
    free text for "Other"), and exactly one payment slip upload (PDF,
    document, or image, 10 MB max).
- **FR-9** Required fields match the reference form (marked `*` on it):
  title, full name, name with initials, address, date of birth, gender,
  NIC/passport, email, phone, occupation, education qualification, degree
  name, at least one degree document, how-they-heard, and the payment slip.
  WhatsApp number, reason for joining, and prior meditation experience are
  optional, matching the reference form.
- **FR-10** On submit, the applicant sees a confirmation screen with a
  short application reference code (derived from the new row's id) to quote
  in any follow-up correspondence with CMR — there is no applicant login to
  check status against later (see Open Questions).
- **FR-11** The API rejects a submission if the target intake is not
  currently published and `open` (closing date passed, or admin closed it
  manually), with a clear error rather than silently accepting a late
  application.
- **FR-12** An admin can list all applications, filter by intake and by
  status, and search by name/email/NIC, paginated like every other admin
  list in this app (`AdminStudentsPage`/`AdminEntriesPage` pattern).
- **FR-13** An admin can open a single application and see every submitted
  field plus a way to open each uploaded document (degree documents, payment
  slip) in a new tab to verify it.
- **FR-14** An admin can change an application's status
  (`submitted` → `under_review` → `approved` / `rejected` / `waitlisted`)
  and attach an internal note; the system records who made the change and
  when.
- **FR-14a** Moving an application's status to `approved` automatically
  enrolls the applicant onto the `students` roster in the same request — the
  step that actually grants diary access is not a separate manual action.
  If a `students` row already matches the applicant's email (re-approval, or
  they were added another way), that row is reused rather than duplicated.
  Since the application doesn't collect a student number (it's an internal
  roster ID, not something an applicant would know), one is generated
  automatically as `INT{intake_number}-{sequence}` (e.g. `INT4-0007`).
- **FR-15** An admin can export applications — optionally filtered by
  intake and/or status — to a CSV file (opens directly in Excel) containing
  every structured field, for offline shortlisting/handover. Uploaded
  documents are not embedded in the CSV; the export includes a per-document
  count/reference instead, and the admin opens the actual files from the
  application detail view.

## 7. Proposed Data Model

Two new tables, additive only — no changes to existing `students`, `admins`,
or `diary_entries` tables/policies.

```sql
-- backend/database/0007_intakes.sql
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

  -- Payment instructions shown on /apply so the applicant can pay before
  -- uploading a slip (per-intake because the reference code changes).
  payment_online_portal_url text,     -- e.g. "https://pay.cmb.ac.lk/"
  payment_bank_name text,             -- e.g. "People's Bank"
  payment_account_holder_name text,   -- e.g. "University of Colombo"
  payment_reference_code text,        -- e.g. "311150400001" (used as the account/reference number)

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

alter table intakes enable row level security;

create policy intakes_admin_all on intakes
  for all using (is_admin()) with check (is_admin());
```

```sql
-- backend/database/0008_applications.sql
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references intakes (id),

  -- Personal information
  title text,
  full_name text not null,
  name_with_initials text not null,
  residential_address text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'prefer_not_to_say')),
  nic_or_passport text not null,
  email text not null,
  phone_number text not null,
  whatsapp_number text,

  -- Other information
  current_occupation text not null,
  education_qualification text not null
    check (education_qualification in ('undergraduate', 'bachelor', 'master', 'mphil', 'phd', 'other')),
  education_qualification_other text,
  degree_name text not null,
  degree_documents jsonb not null default '[]',  -- [{ path, filename, mimeType, sizeBytes }, ...]
  reason_for_joining text,
  has_meditation_experience boolean,
  how_heard text not null check (how_heard in ('social_media', 'website', 'friends', 'other')),
  how_heard_other text,
  payment_slip jsonb not null,   -- { path, filename, mimeType, sizeBytes }

  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'approved', 'rejected', 'waitlisted')),
  admin_notes text,
  reviewed_by uuid references admins (id),
  reviewed_at timestamptz,
  enrolled_student_id uuid references students (id),  -- set on approval, see FR-14a

  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applications_intake on applications (intake_id);
create index if not exists idx_applications_status on applications (status);
create index if not exists idx_applications_email on applications (lower(email));

drop trigger if exists trg_applications_updated_at on applications;
create trigger trg_applications_updated_at
  before update on applications
  for each row execute function set_updated_at();

alter table applications enable row level security;

create policy applications_admin_all on applications
  for all using (is_admin()) with check (is_admin());
```

Notes:

- No public RLS `select`/`insert` policy is added for either table. As with
  every other write in this app (see root `README.md`, "the Express backend
  is the only thing that talks to these tables directly"), `/apply`
  submissions go through the Express API using the service-role key, not
  directly from the browser via the anon key — so an admin-only policy is
  sufficient, consistent with how `students`/`diary_entries` are already
  guarded.
- `degree_documents`/`payment_slip` store *references* to files in Supabase
  Storage (bucket name, path, original filename, content type, size) — never
  the file bytes themselves, so this table stays small and query-friendly.
- `applications.intake_id` has no `on delete cascade`; an intake with
  applications cannot be deleted (FR-7), which is the desired history-
  preserving behavior.
- No uniqueness constraint on `(intake_id, nic_or_passport)` — a person
  could legitimately reapply after a rejection, or make a data-entry typo
  the first time. Duplicate detection, if wanted, is a UI hint for the admin
  (highlight matching NIC/email within the same intake), not a hard block —
  see Open Questions.

### Storage

- A new **private** Supabase Storage bucket, `application-documents`. Not
  publicly readable — only the backend's service-role key can read/write it,
  the same trust boundary as every other table in this schema. Created once
  via the Supabase Dashboard (Storage → New bucket → uncheck "Public
  bucket"), the same one-time-setup pattern the root `README.md` already
  uses for migrations.
- Object paths: `{application_id}/degree-{n}.{ext}` and
  `{application_id}/payment-slip.{ext}`, where `{application_id}` is
  generated by the backend (`crypto.randomUUID()`) *before* the row is
  inserted, so files can be uploaded first and the row inserted with that
  same id afterward. If the DB insert fails after files are uploaded, the
  backend best-effort deletes the just-uploaded objects so orphaned files
  don't accumulate.
- Admins never get a permanent public link — the backend calls
  `supabaseAdmin.storage.from('application-documents').createSignedUrl(path, ttl)`
  on demand (short TTL, e.g. 10 minutes) when an admin opens an application's
  detail view, and returns those signed URLs in that response.

## 8. Proposed API

Following the existing route structure (`backend/src/routes/`):

**Public (unauthenticated), `backend/src/routes/public.js`:**

- `GET /api/public/intake` — returns the published, currently relevant
  intake's public-safe fields (everything in §7 except `created_by`), or
  `{ intake: null }` if none is published. Used by the landing page and
  `/apply`.
- `POST /api/public/applications` — `multipart/form-data` body (structured
  fields + `degreeDocuments` (up to 5 files) + `paymentSlip` (1 file)).
  Validates the target intake is published and `status = 'open'`, validates
  every field with zod, validates each file's mime type/size, uploads files
  to Storage, inserts the `applications` row, and returns
  `{ applicationId, reference }`. Guarded by a dedicated rate limiter
  (stricter than the general API limiter, since it accepts uploads from
  anonymous callers) — see §11.

**Admin (`requireAuth` + `requireAdmin`), `backend/src/routes/intakes.js`:**

- `GET /api/admin/intakes` — list all intakes, newest first, with an
  application count per intake.
- `POST /api/admin/intakes` — create an intake.
- `GET /api/admin/intakes/:id` — fetch one.
- `PATCH /api/admin/intakes/:id` — update fields, including toggling
  `is_published`/`status`. Publishing one intake unpublishes whichever
  intake is currently published in the same request (read-then-two-writes
  is acceptable at this write volume; the partial unique index is the actual
  safety net against a race).
- `DELETE /api/admin/intakes/:id` — only allowed when the intake has zero
  applications (FR-7); otherwise a 409 with a clear message.

**Admin, `backend/src/routes/applications.js`:**

- `GET /api/admin/applications` — list, filterable by `intakeId`, `status`,
  and `q` (name/email/NIC search), paginated.
- `GET /api/admin/applications/:id` — full detail, including a signed URL
  for every uploaded document.
- `PATCH /api/admin/applications/:id` — update `status`/`adminNotes`; sets
  `reviewed_by`/`reviewed_at` server-side whenever `status` changes.
- `GET /api/admin/applications/export.csv` — CSV export (see FR-15),
  accepting the same `intakeId`/`status`/`q` filters as the list endpoint.

All admin routes reuse `requireAuth` + `requireAdmin`
(`backend/src/middleware/auth.js`) and zod validation
(`backend/src/middleware/validate.js`), consistent with every other admin
route in this codebase.

## 9. Admin UI

- New sidebar nav items, admin-only, added to `adminNav` in
  `frontend/src/components/layout/nav-config.ts`:
  - **Intakes** (`GraduationCap`) → `/admin/intakes`
  - **Applications** (`ClipboardList`) → `/admin/applications`
- `/admin/intakes` — table of intakes (number, status, published?, closing
  date, application count) with a "New Intake" action, matching the existing
  `AdminStudentsPage` table + dialog pattern. A "Publish" action per row,
  with a confirmation dialog explaining it will unpublish the current one.
- `/admin/applications` — table of applications (name, email, intake,
  submitted date, status badge) with filters for intake/status and a search
  box (matching `AdminEntriesPage`'s filter bar), pagination, and an
  **Export CSV** button (using the existing `downloadExport` helper in
  `frontend/src/lib/api.ts`, same pattern as the diary export).
  - Clicking a row opens a `Sheet` (side panel) with every field grouped as
    on the reference form (Personal Information / Other Information),
    "Open" links for each uploaded document (degree documents, payment
    slip) that open the signed URL in a new tab, a status `Select` +
    `Textarea` for admin notes, and a "Save" action — this is the
    view-and-verify step: the admin opens the payment slip to confirm
    payment, opens the degree documents to confirm eligibility, then moves
    the status forward.
  - Moving the status to `approved` and saving enrolls the applicant onto
    the roster in that same request (FR-14a); the panel then shows a
    confirmation with the generated student number instead of a separate
    "add student" step.

## 10. Public-Facing Apply Flow

- `/apply` (public route, added to `App.tsx` alongside `/login`/`/register`).
- Fetches `GET /api/public/intake`; if none published or not `open`, shows
  the same "Applications are currently closed" empty state as the landing
  page (FR-5) instead of a broken form.
- One page, sectioned like the reference form (Personal Information / Other
  Information / Payment), built with plain `useState` + `<form>` (matching
  this codebase's existing form style in `RegisterPage.tsx`/
  `AdminStudentsPage.tsx` — no new form library introduced), not a
  multi-step wizard:
  - A "Payment Instructions" card up top (online portal link, bank name,
    account holder, reference code from the intake) so applicants pay
    *before* filling in the rest and are reminded to keep the slip ready.
  - Personal Information fields.
  - Other Information fields, including the two file inputs (multiple for
    degree documents, single for the payment slip) with inline client-side
    validation (file count ≤ 5, each ≤ 10 MB, accepted types) before
    submission, so a rejected upload is caught before the network request.
  - Submits as `multipart/form-data` to `POST /api/public/applications` via
    a new `api.postForm` helper in `frontend/src/lib/api.ts` (parallel to
    the existing `api.post`, but sending a `FormData` body and letting the
    browser set the multipart `Content-Type`/boundary instead of forcing
    `application/json`).
  - On success, shows a confirmation state with the returned reference code
    instead of navigating away — mirrors the "Draft saved" / thank-you
    behavior of the original Google Form.

## 11. Landing Page Changes

`frontend/src/pages/LandingPage.tsx` changes from hardcoded constants
(`MODULES`, `OBJECTIVES`, `FACTS`, `APPLY_STEPS`, `REGISTRATION_URL`) to a
`useQuery` against `GET /api/public/intake`, with:

- A loading skeleton state (consistent with every other page in this app).
- A graceful empty state when no intake is published, or the published
  intake isn't `open` ("Applications are currently closed — check back
  soon"), instead of the hero section crashing or rendering blank.
- Every "Apply Now" / "Open Registration Form" call to action becomes an
  internal `<Link to="/apply">` instead of an external `<a>` to a Google
  Form.
- The QR code (`qrcode.react`, already implemented) now encodes CMR's own
  `/apply` URL (`${window.location.origin}/apply`) instead of an external
  Google Form link — it updates automatically per intake because the intake
  behind `/apply` is whatever's currently published, not a per-intake URL.

The "For enrolled students" section (diary portal explanation,
confidentiality note, sign-in CTAs) is intake-independent and stays as
static content.

## 12. Non-Functional Requirements

- **Validation:** dates must be valid; `intake_number` positive; URLs
  well-formed; file mime types restricted to
  `application/pdf, image/jpeg, image/png, image/webp, application/msword,
  application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
  each file ≤ 10 MB; ≤ 5 degree documents; exactly 1 payment slip — all via
  zod schemas and `multer` limits/`fileFilter`, same validation-at-the-
  boundary approach as every other route.
- **Authorization:** only `admins` rows can create/edit intakes or view/edit
  applications; the public intake endpoint never exposes unpublished
  intakes or the `created_by` field; the public application endpoint never
  echoes back other applicants' data.
- **Rate limiting:** `POST /api/public/applications` gets its own limiter
  (`applicationLimiter` in `backend/src/middleware/rateLimit.js`), tighter
  than the general API budget, since it's an anonymous endpoint that accepts
  file uploads and writes to storage.
- **File privacy:** the `application-documents` bucket is private; documents
  are only ever reachable via short-lived signed URLs generated for an
  authenticated admin request, never a permanent public link.
- **Auditability:** `created_by`/`updated_at` on `intakes`, and
  `reviewed_by`/`reviewed_at` on `applications`, are enough for this scale;
  a full history/audit log is not warranted for a handful of admin-edited
  rows per year and the applicant volume of a part-time certificate course.
- **No RLS regression:** both new tables are independent of `students` /
  `diary_entries`; nothing about diary confidentiality changes.

## 13. Rollout Plan

1. Add `backend/database/0007_intakes.sql` and
   `backend/database/0008_applications.sql` (schemas from §7), applied the
   same way as prior migrations (pasted into the Supabase SQL Editor — see
   the root `README.md`).
2. Create the `application-documents` private Storage bucket in the
   Supabase Dashboard (one-time manual step, like provisioning the first
   admin).
3. Backend: `src/utils/storage.js` (upload/signed-URL/delete helpers),
   `src/schemas/intakes.schema.js` + `src/schemas/applications.schema.js`,
   `src/routes/intakes.js`, `src/routes/applications.js`,
   `src/routes/public.js`, a new `applicationLimiter`, `multer` as a new
   dependency; wire everything into `src/app.js`.
4. Seed the current (03rd) intake's data — the content already written into
   `LandingPage.tsx` — as the first row via the new admin UI or a one-off
   SQL insert, and mark it published + `open`.
5. Frontend: build `/admin/intakes` (list + form) and `/admin/applications`
   (list + filters + detail `Sheet` + CSV export), then build the public
   `/apply` page, then switch `LandingPage.tsx` from constants to the
   `GET /api/public/intake` query and internal `/apply` links.
6. Remove the hardcoded constants and `REGISTRATION_URL` from
   `LandingPage.tsx` once the data-driven version is verified against the
   current intake's real content.
7. Add `backend/database/0009_link_course_settings_to_intake.sql` and update
   the Course Settings admin page to link `course_settings.intake_id` to a
   row in `intakes`, replacing the free-text `intake_label` it replaced.
8. Add `backend/database/0010_application_enrollment_link.sql` and
   `src/utils/enrollment.js` (FR-14a) so approving an application enrolls
   the applicant onto the `students` roster in the same request.

## 14. Open Questions

- Should an applicant be able to check their own application's status later
  (e.g. by looking up their reference code + email), or is "we'll contact
  you" sufficient, as it effectively was with the Google Form? Not needed
  for launch; the reference code from FR-10 leaves room to add a
  `GET /api/public/applications/lookup` endpoint later without a schema
  change.
- Should the admin UI flag likely-duplicate applications (same NIC/email
  within an intake) automatically, or is that left to the admin noticing
  during review? Deferred — no hard constraint added in §7 for this reason.
- The auto-generated student number (`INT{intake_number}-{sequence}`, FR-14a)
  is an internal roster ID the student learns from CMR after enrollment, not
  something they choose — fine for this course's scale, but revisit if CMR
  ever needs student numbers to match an external university ID scheme.
- Should there be an automated confirmation email to the applicant on
  submission? Out of scope here — no transactional email sending exists
  anywhere in this codebase yet; would need its own infrastructure decision
  (e.g. Supabase's email, or a provider like Resend) if CMR wants it.
