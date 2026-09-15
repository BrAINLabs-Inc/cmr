-- Two admin-controlled additions to the diary workflow:
--
-- 1. Diary start approval: previously the diary silently opened on
--    course_start_date. In practice that date (meant to line up with the
--    real-world start of Module 3) can slip, so week 1 must not open until
--    an admin explicitly confirms it. is_started gates this; started_at
--    records when. Any admin edit to the dates/intake resets is_started to
--    false so a new window always requires a fresh approval.
--
-- 2. Late diary access: admins can grant an individual student access to
--    write/submit one specific missed week (e.g. after the student emails
--    an excuse). Presence of an "allowed" row reopens that week for that
--    student only; admins can revoke it again.

alter table course_settings
  add column if not exists is_started boolean not null default false;

alter table course_settings
  add column if not exists started_at timestamptz;

create table if not exists diary_late_access (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  week_number int not null check (week_number > 0),
  allowed boolean not null default true,
  note text,
  granted_by uuid references admins (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, week_number)
);

create index if not exists idx_diary_late_access_student on diary_late_access (student_id);

drop trigger if exists trg_diary_late_access_updated_at on diary_late_access;
create trigger trg_diary_late_access_updated_at
  before update on diary_late_access
  for each row execute function set_updated_at();

alter table diary_late_access enable row level security;

create policy diary_late_access_admin_only on diary_late_access
  for all using (is_admin()) with check (is_admin());
