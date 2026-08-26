-- Weekly Check-in is its own feature, independent of the diary entry.
-- Students can log it (or not) regardless of whether they've written that
-- week's diary. A separate table instead of a column on diary_entries, so
-- the two are never coupled in the API or the UI.
--
-- checkin shape (all keys optional):
-- {
--   "meditation": { "practiced": true, "minutes": 85, "sessions": 5, "type": "Mindfulness", "reflection": "..." },
--   "mood": { "feeling": "good", "happiness": 4, "stress": 2, "calmness": 4, "sleepQuality": 3, "wellbeing": 4 },
--   "gratitude": ["...", "...", "..."],
--   "noticed": "...",
--   "goal": { "intention": "...", "outcome": "achieved" }
-- }

create table if not exists weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  week_number int not null check (week_number > 0),
  checkin jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, week_number)
);

create index if not exists idx_weekly_checkins_week on weekly_checkins (week_number);

drop trigger if exists trg_weekly_checkins_updated_at on weekly_checkins;
create trigger trg_weekly_checkins_updated_at
  before update on weekly_checkins
  for each row execute function set_updated_at();

alter table weekly_checkins enable row level security;

create policy weekly_checkins_select_own on weekly_checkins
  for select using (
    student_id in (select id from students where auth_user_id = auth.uid())
    or is_admin()
  );

create policy weekly_checkins_write_own on weekly_checkins
  for insert with check (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

create policy weekly_checkins_update_own on weekly_checkins
  for update using (
    student_id in (select id from students where auth_user_id = auth.uid())
  );

-- Undo the (never-deployed) diary_entries.checkin column from the previous
-- version of this migration. The check-in feature lives here instead.
alter table diary_entries drop column if exists checkin;
