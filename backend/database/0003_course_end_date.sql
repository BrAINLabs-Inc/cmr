-- Weeks used to be driven by a manually-typed total_weeks count that could
-- drift out of sync with the real course calendar. Replace it with an
-- explicit course_end_date, and derive total_weeks from
-- (course_start_date, course_end_date) as a generated column so it can
-- never disagree with the dates admins actually set.

alter table course_settings
  add column if not exists course_end_date date;

-- Backfill existing rows: preserve today's effective total_weeks by placing
-- the end date at the close of the current final week.
update course_settings
  set course_end_date = course_start_date + ((total_weeks - 1) * 7 + 6)
  where course_end_date is null;

alter table course_settings
  alter column course_end_date set not null;

alter table course_settings
  drop column total_weeks;

alter table course_settings
  add column total_weeks int generated always as (
    floor((course_end_date - course_start_date) / 7.0)::int + 1
  ) stored;

alter table course_settings
  add constraint course_settings_end_after_start check (course_end_date >= course_start_date);

alter table course_settings
  add constraint course_settings_total_weeks_range check (total_weeks between 1 and 104);
