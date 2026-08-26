-- CMR Weekly Digital Diary: initial schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- course_settings: singleton row controlling "current week" calculation
-- ---------------------------------------------------------------------------
create table if not exists course_settings (
  id int primary key default 1,
  course_start_date date not null,
  total_weeks int not null default 12,
  updated_at timestamptz not null default now(),
  constraint course_settings_singleton check (id = 1)
);

insert into course_settings (id, course_start_date, total_weeks)
values (1, current_date, 12)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- students: the pre-loaded roster. auth_user_id is filled in when the
-- student completes self-registration (matched by email).
-- ---------------------------------------------------------------------------
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_number text not null unique,
  name text not null,
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'inactive')),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  research_opt_out boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_students_email on students (lower(email));

-- ---------------------------------------------------------------------------
-- admins: allowlist of CMR administrators / research personnel.
-- role distinguishes full admin (student mgmt, export) from a lecturer/
-- coordinator role that could later be scoped down to read-only.
-- ---------------------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null default 'admin' check (role in ('admin', 'research')),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_admins_email on admins (lower(email));

-- ---------------------------------------------------------------------------
-- diary_entries: one row per student per week.
-- ---------------------------------------------------------------------------
create table if not exists diary_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  week_number int not null check (week_number > 0),
  entry_date date not null default current_date,
  content text not null default '',
  word_count int not null default 0,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  submitted_at timestamptz,
  research_opt_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, week_number)
);

create index if not exists idx_diary_entries_week on diary_entries (week_number);
create index if not exists idx_diary_entries_status on diary_entries (status);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_diary_entries_updated_at on diary_entries;
create trigger trg_diary_entries_updated_at
  before update on diary_entries
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- The Express backend talks to Supabase with the service_role key, which
-- bypasses RLS entirely. These policies are defense-in-depth in case the
-- anon/client key is ever used to query these tables directly (it currently
-- is not; the frontend only uses supabase-js for Auth).
-- ---------------------------------------------------------------------------
alter table students enable row level security;
alter table admins enable row level security;
alter table diary_entries enable row level security;
alter table course_settings enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admins a
    where a.auth_user_id = auth.uid()
  );
$$ language sql stable security definer;

create policy students_select_own on students
  for select using (auth_user_id = auth.uid() or is_admin());

create policy admins_select_own on admins
  for select using (auth_user_id = auth.uid() or is_admin());

create policy diary_entries_select_own on diary_entries
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
    or is_admin()
  );

create policy diary_entries_write_own on diary_entries
  for insert with check (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy diary_entries_update_own on diary_entries
  for update using (
    student_id in (select id from students where auth_user_id = auth.uid())
    or is_admin()
  );

create policy course_settings_select_all on course_settings
  for select using (true);
