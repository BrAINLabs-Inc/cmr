# Features

## Public site

- Landing page — mission, about, collaborating partners, how-to-apply
- Course content, board members, research, services, and archives sections
- `/practice` — guided practice page
- `/apply` — prospective applicants submit an intake application, including
  uploaded degree documents and payment slips

## Students

- Roster-gated self-registration (`/register`) — an email + student ID an
  admin already added is required to create an account
- Weekly diary — write, save a draft, and submit an entry per course week;
  once submitted, an entry becomes read-only
- Previous entries — browse full diary history
- Weekly check-in — meditation minutes, mood, and gratitude
- Dashboard — current week, reflection streak, words written, check-in
  streak, submission rate, and a full-course week timeline
- Help page

## Admins

- Student roster management (add individually or bulk CSV import)
- Submission monitoring across all students and weeks, with CSV/Excel
  export (including a de-identified export mode for research use)
- Weekly check-in overview across the roster
- Course settings — start date, total weeks, current intake
- Intake management (`/admin/intakes`) — create and publish the course
  intakes shown on the public site, replacing the old hardcoded content
- Application review (`/admin/applications`) — review submitted
  applications and documents; approving one automatically enrolls the
  applicant onto the student roster

## Cross-cutting

- Supabase Auth–backed sign-in, forgot-password, and reset-password flows
- Role-based routing — student and admin areas are fully separated, with a
  shared sidebar/header shell (see [`architecture.md`](architecture.md))
- Research opt-out flag per student, respected by the de-identified export

See [`architecture.md`](architecture.md) for how these are implemented and
[`setup.md`](setup.md) to run the app locally.
