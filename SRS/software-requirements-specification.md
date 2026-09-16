# Software Requirements Specification (SRS)

## CMR — Weekly Digital Diary & Course Management Platform

**Document status:** Living document, reflects the system as implemented on
the `development` branch. Where a feature has its own detailed design
document, this SRS summarizes it and links out (see §9).

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements of
CMR ("Centre for Mindfulness Research" digital platform) — a web
application supporting a part-time Certificate Course. It covers the full
system: the public marketing site, prospective-applicant registration, the
student weekly-diary portal, and the admin back office that runs both the
course and its intake/application pipeline.

### 1.2 Scope

CMR replaces what was previously a mix of a static informational page and
an external Google Form with a single application that:

- Presents the course to the public and accepts applications for the
  currently open intake.
- Gates diary access to a pre-approved/admin-enrolled student roster.
- Lets enrolled students keep a structured weekly reflective diary and a
  weekly wellbeing check-in (meditation, mood, gratitude) for the duration
  of the course.
- Gives admin staff a back office to manage students, review and export
  diary/check-in data, manage course intakes and marketing content, and
  review/approve applicant submissions — without needing a code deploy for
  routine operations.

### 1.3 Definitions

| Term | Meaning |
|---|---|
| **Intake** | One offering/cohort of the course (e.g. "03rd intake"), with its own dates, fees, and content. |
| **Application** | A submission from a prospective applicant against one intake, prior to being added to the student roster. |
| **Student** | A roster member with diary-portal access, created by an admin (directly, via CSV import, or via application approval). |
| **Admin** | Staff account with access to `/admin/*`, able to manage students, content, and review data. |
| **Diary entry** | One student's structured weekly reflection for a given week number. |
| **Check-in** | One student's weekly wellbeing self-report (meditation, mood, gratitude, goal) for a given week number. |
| **Course settings** | The singleton record driving the diary's week timeline (start date, total weeks, started/paused state, which intake is being run). |

### 1.4 Technology Stack

- **Frontend:** React + Vite + TypeScript, shadcn/ui, TanStack Query, React
  Router (`frontend/`).
- **Backend:** Node.js/Express REST API (`backend/`).
- **Data & Auth:** Supabase (PostgreSQL with row-level security, Supabase
  Auth for email/password sign-in, Supabase Storage for uploaded documents).
- **Hardening already in place:** zod validation at every route boundary,
  centralized error handling, rate limiting, helmet security headers,
  structured (pino) logging with request IDs, and CI (lint/test/build) on
  every push.

---

## 2. Overall Description

### 2.1 Product Perspective

CMR is a single deployable unit: one Express API and one SPA. The Express
backend is the sole writer to the database (using the Supabase service-role
key), so all authorization is enforced in backend middleware rather than
relying solely on database row-level security. RLS is kept as
defense-in-depth.

### 2.2 User Classes and Characteristics

| User class | Access | Description |
|---|---|---|
| **Public visitor** | Unauthenticated | Browses the marketing site, views the currently open intake, submits an application. |
| **Student** | Authenticated (`role: student`) | A roster member; can only see and edit their own diary/check-in data. |
| **Admin** | Authenticated (`role: admin`) | Full back-office access: roster, submissions, intakes, applications, course settings, exports. Provisioned out-of-band (`npm run create-admin`), not via public signup. |

### 2.3 Constraints

- No online payment processing — applicants pay externally and upload a
  slip as evidence (see §9, Intake & Applicant Registration).
- Single active ("published") intake at a time on the public site.
- No rich-text/CMS authoring — intake marketing content is structured
  fields, not freeform HTML.
- Sized for course-scale usage (roughly 100 concurrent users), not
  internet-scale traffic.

### 2.4 Assumptions

- Each student has one email address, unique (case-insensitively) across
  the roster.
- A course runs one diary timeline at a time, driven by one `course_settings`
  singleton row linked to the intake currently being evaluated.

---

## 3. External Interface Requirements

### 3.1 User Interfaces

- **Public site** (`/`, `/apply`, `/practice`, `/login`, `/register`,
  `/forgot-password`, `/reset-password`): responsive marketing/informational
  pages plus the public application flow.
- **Student portal** (`/dashboard`, `/diary/:week`, `/previous`, `/checkin`,
  `/help`): authenticated, role-gated via `ProtectedRoute`.
- **Admin console** (`/admin`, `/admin/students`, `/admin/entries`,
  `/admin/checkins`, `/admin/intakes`, `/admin/applications`,
  `/admin/settings`): authenticated, admin-only, shared sidebar shell.

### 3.2 API

REST JSON API under `/api`, mounted as:

- `/api/auth` — registration and session identity.
- `/api/diary` — student diary CRUD/submit/export (`requireAuth` +
  `requireStudent`).
- `/api/checkin` — student weekly check-in CRUD/stats (`requireAuth` +
  `requireStudent`).
- `/api/admin/*` — all admin resources (`requireAuth` + `requireAdmin`).
- `/api/public/*` — unauthenticated public reads/writes (published intake,
  application submission).

### 3.3 Hardware/Software Interfaces

- Runs against a Supabase-hosted PostgreSQL instance and Supabase Storage
  bucket; no other external system integrations.

---

## 4. System Features — Public Site

### 4.1 Marketing / Informational Pages

- **FR-P1** The landing page (`/`) presents the course overview, the
  currently published intake's modules/objectives/fees/dates (data-driven,
  see §9), and calls to action to apply or sign in.
- **FR-P2** A signed-in user hitting `/` is redirected straight to
  `/dashboard` (student) or `/admin` (admin) instead of seeing the marketing
  page again.
- **FR-P3** A "Practice" page (`/practice`) provides supporting content
  (e.g. guided practice/meditation material) independent of any intake.
- **FR-P4** Several informational sections (Board Members, Research,
  Services, Archives, Contact) currently link out to the parent
  organization's site (`https://med.cmb.ac.lk/cmr/`) rather than being
  served in-app.

### 4.2 Authentication

- **FR-A1** A student can self-register at `/register` using the email and
  student number an admin has already pre-loaded into the roster — an
  account can only be created if both match an existing `students` row
  (roster gating).
- **FR-A2** Both students and admins log in at `/login` with email/password
  (Supabase Auth), and are routed to `/dashboard` or `/admin` respectively
  based on their role.
- **FR-A3** A user can request a password reset (`/forgot-password`) and
  complete it (`/reset-password`).
- **FR-A4** `GET /api/auth/me` returns the authenticated caller's identity
  and role for client-side routing/guarding.
- **FR-A5** Admin accounts are never created via a public form — only via
  the `create-admin` script, keeping admin provisioning a deliberate,
  out-of-band action.

### 4.3 Prospective Applicant Registration

Full detail in `SRS/intake-management.md`; summarized here:

- **FR-AP1** A visitor can view the currently open intake's summary and
  apply at `/apply` without creating an account, submitting personal
  details, education background/documents, and a payment slip.
- **FR-AP2** If no intake is published or open, `/apply` and the landing
  page show a graceful "applications closed" state rather than a broken
  form.
- **FR-AP3** On submit, the applicant receives a reference code to quote in
  correspondence; there is no applicant login or status lookup in v1.

---

## 5. System Features — Student Portal

All student routes require an authenticated session with `role: student`
and operate only on the signed-in student's own data.

### 5.1 Dashboard

- **FR-S1** The dashboard shows the student's overall progress: which week
  is current, per-week status (not started / draft / submitted / locked),
  due dates, and whether late access has been granted for a past week.

### 5.2 Weekly Diary

- **FR-S2** A student can open the current week's diary entry
  (`/diary/:week`), write structured rich-text content, and save it as a
  draft repeatedly (`PUT /api/diary/:week`) without submitting.
- **FR-S3** A student can submit a week's entry (`POST /api/diary/:week/submit`);
  submission is blocked if the content is empty.
- **FR-S4** Once submitted, an entry becomes read-only — it cannot be
  edited or deleted (`assertNotSubmitted`), protecting data integrity for
  research use. This is a deliberate default and can be relaxed later by
  removing the guard in `backend/src/routes/diary.js` if required.
- **FR-S5** A student can only write/submit the week that is currently open
  (`assertWeekIsOpen`); a future week is not yet open, and a past week is
  locked once its deadline passes — unless an admin has explicitly granted
  late access for that specific student/week.
- **FR-S6** The diary only becomes usable once an admin has started it
  (`course_settings.is_started`); before that, the student sees a "not
  started yet" state instead of an error.
- **FR-S7** A student can view all of their own previous entries
  (`/previous`), grouped by week with status and submission date.
- **FR-S8** A student can export their own diary history to CSV
  (`GET /api/diary/export/csv`) for personal record-keeping.
- **FR-S9** A student can delete an entry only while it is still a draft
  (not yet submitted) and only for the currently open week.

### 5.3 Weekly Check-in

- **FR-S10** A student can record a weekly wellbeing check-in
  (`/checkin`) covering meditation practice (practiced yes/no, sessions,
  minutes), mood, gratitude entries, a free-text "noticed" reflection, and
  a goal/intention — matching the current week only (`isEditable` only when
  `week === currentWeek`).
- **FR-S11** A student can view their check-in history across weeks and
  personal stats: total meditation sessions/minutes, average weekly
  minutes, current meditation streak, and current check-in streak.

### 5.4 Help

- **FR-S12** A static Help & Guidelines page (`/help`) explains how to use
  the diary/check-in features and what's expected week to week.

---

## 6. System Features — Admin Console

All admin routes require an authenticated session with `role: admin`
(`requireAuth` + `requireAdmin`), applied once centrally for every admin
sub-router.

### 6.1 Dashboard & Analytics

- **FR-D1** An admin dashboard (`/admin`) surfaces overview statistics:
  submission rates per week (`GET /api/admin/stats/weekly`), an aggregate
  overview (`GET /api/admin/stats/overview`), and check-in participation
  (`GET /api/admin/stats/checkins`).

### 6.2 Student Management (`/admin/students`)

- **FR-D2** An admin can list students with search/pagination
  (`GET /api/admin/students`).
- **FR-D3** An admin can add a student individually
  (`POST /api/admin/students`) or in bulk via CSV import
  (`POST /api/admin/students/bulk`, also available as the
  `npm run import-students` CLI script).
- **FR-D4** An admin can edit a student's roster details
  (`PATCH /api/admin/students/:id`).
- **FR-D5** An admin can view one student's check-in history
  (`GET /api/admin/students/:id/checkins`) and pending/missed weeks
  (`GET /api/admin/students/:id/pending-weeks`).
- **FR-D6** An admin can view and grant/revoke a student's late-access
  exceptions per week (`GET`/`PUT /api/admin/students/:id/late-access`),
  allowing a specific student to edit or submit a past, otherwise-locked
  week (e.g. for a documented extenuating circumstance).

### 6.3 Diary Entry Oversight (`/admin/entries`)

- **FR-D7** An admin can list all diary entries with filters and pagination
  (`GET /api/admin/entries`).
- **FR-D8** An admin can list students who have missed a given week's entry
  (`GET /api/admin/entries/missed`), including whether late access has
  already been granted, to identify who needs follow-up.
- **FR-D9** An admin can open a single entry's full content
  (`GET /api/admin/entries/:id`).
- **FR-D10** An admin can export the full/filtered entry set to CSV
  (`GET /api/admin/export.csv`), with an optional `?deidentified=true` mode
  that strips identifying fields for research use, honoring each student's
  `research_opt_out` flag.

### 6.4 Check-in Oversight (`/admin/checkins`)

- **FR-D11** An admin can list all students' weekly check-ins with filters
  (`GET /api/admin/checkins`), to monitor wellbeing engagement across the
  cohort.

### 6.5 Course Settings (`/admin/settings`)

- **FR-D12** An admin can view and edit the course's singleton settings
  (`GET`/`PATCH /api/admin/course-settings`): course start date, total
  number of weeks, and which intake this run of the diary belongs to
  (`intake_id`).
- **FR-D13** An admin can start the diary (`POST /api/admin/course-settings/start`),
  which is what unlocks week 1 for all students, and pause it
  (`POST /api/admin/course-settings/pause`).

### 6.6 Intake Management (`/admin/intakes`)

Full detail in `SRS/intake-management.md`; summarized here:

- **FR-D14** An admin can list, create, view, edit, and (if it has zero
  applications) delete intakes (`GET`/`POST`/`GET :id`/`PATCH :id`/`DELETE :id`
  under `/api/admin/intakes`).
- **FR-D15** An admin can publish exactly one intake at a time to the
  public site, and set its status (`upcoming`/`open`/`closed`)
  independently of publish state.

### 6.7 Applicant Review (`/admin/applications`)

Full detail in `SRS/intake-management.md`; summarized here:

- **FR-D16** An admin can list applications filtered by intake/status/search,
  view full detail including signed URLs to uploaded documents, and update
  an application's status and internal notes (`GET`/`GET :id`/`PATCH :id`
  under `/api/admin/applications`).
- **FR-D17** Approving an application automatically enrolls the applicant
  onto the student roster in the same action, generating a roster student
  number (`INT{intake_number}-{sequence}`).
- **FR-D18** An admin can export applications to CSV, Excel (`.xlsx`), or
  PDF (`GET /api/admin/applications/export.csv` / `.xlsx` / `.pdf`),
  optionally filtered, for offline shortlisting or handover to a selection
  panel.

---

## 7. Data Model (summary)

Core tables (see `backend/database/*.sql` for authoritative schema and
migration order):

- `students` — roster identity, opt-out flag, linkage to Supabase Auth user.
- `admins` — admin identity, linkage to Supabase Auth user, role.
- `diary_entries` — one row per `(student_id, week_number)`, structured
  JSON content, word count, status, submission timestamp.
- `diary_late_access` — per-student, per-week override allowing edit of an
  otherwise-locked past week.
- `weekly_checkins` — one row per `(student_id, week_number)`, structured
  JSON check-in payload.
- `course_settings` — singleton driving the active diary timeline
  (`course_start_date`, `total_weeks`, `is_started`, `intake_id`).
- `intakes` — one row per course offering (marketing content, dates, fees,
  publish/status state).
- `applications` — one row per applicant submission against an intake,
  including document references and review status; may link to an
  `enrolled_student_id` once approved.

All tables have row-level security enabled; the Express backend (via the
Supabase service-role key) is the sole direct writer, with authorization
enforced in `backend/src/middleware/auth.js` on every request.

---

## 8. Non-Functional Requirements

- **NFR-1 Security & Authorization:** Every route validates its caller's
  role (`requireAuth`, `requireStudent`/`requireAdmin`) before touching
  data; students can only ever read/write their own rows. Admin accounts
  are provisioned out-of-band, never via public signup.
- **NFR-2 Confidentiality:** `diary_entries` and `students` support a
  `research_opt_out` flag honored by de-identified export; RLS is enabled
  on every table as defense-in-depth even though the Express backend is
  the only direct table client today.
- **NFR-3 Validation:** All request bodies/query/params are validated with
  zod schemas (`backend/src/schemas/*.schema.js`) before a handler runs;
  file uploads are constrained by MIME type, count, and size (`multer`).
- **NFR-4 Rate limiting:** A general API-wide limiter plus dedicated,
  stricter limiters on sensitive anonymous endpoints (`/api/auth/register`,
  `POST /api/public/applications`).
- **NFR-5 Reliability:** Centralized error handling
  (`AppError`/`errorHandler`) returns consistent `{ error, requestId }`
  responses; unexpected errors are logged, not exposed. Graceful shutdown
  drains in-flight requests on `SIGTERM`/`SIGINT`.
- **NFR-6 Observability:** Structured (pino) request logging with a
  request ID surfaced both in logs and in error responses
  (`X-Request-Id`).
- **NFR-7 Performance:** Paginated, bounded queries on all admin list
  endpoints (students, entries, applications) so listing pages don't
  degrade as data accumulates across course offerings; route-level code
  splitting keeps the initial frontend bundle small.
- **NFR-8 Data integrity:** Submitted diary entries are immutable
  (read-only once submitted); deleting an intake with any applications
  attached is disallowed at the database level (foreign key).
- **NFR-9 File privacy:** Uploaded applicant documents live in a private
  Supabase Storage bucket, never publicly reachable; admins access them via
  short-lived signed URLs generated on demand.
- **NFR-10 Auditability:** Key mutation-worthy actions record who/when
  (`reviewed_by`/`reviewed_at` on applications, `created_by`/`updated_at`
  on intakes), sized to this app's actual admin-edit volume rather than a
  full audit log.
- **NFR-11 Testing & CI:** Backend unit + route-level tests (vitest +
  supertest); CI lints/tests the backend and lints/typechecks/builds the
  frontend on every push/PR to `main`.

---

## 9. Related / Detailed Design Documents

- `SRS/intake-management.md` — full requirements, data model, and API
  design for admin-controlled intake content management and the in-app
  applicant registration/review/export flow (referenced throughout §4.3,
  §6.6, §6.7 above).

---

## 10. Out of Scope (current phase)

Per the product's phased roadmap (see root `README.md`):

- **Phase 2:** weekly reminders, meditation log, mood check-in, gratitude
  journal as dedicated features (a lightweight version of meditation/mood/
  gratitude already exists inside the weekly check-in, §5.3).
- **Phase 3:** personal goals tracking, meditation statistics beyond what's
  in §5.3/§6.1, pre/post assessments, a dedicated research dashboard.
- Online payment processing (applicants pay externally and upload proof).
- Multi-language content.
- Multiple concurrently open/published intakes.
- A rich in-app document viewer/annotator for uploaded applicant documents.
- Automated confirmation emails (no transactional email infrastructure
  exists yet).
- Applicant self-service status lookup after submission.
