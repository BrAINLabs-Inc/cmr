-- The course runs as a sequence of intakes (03rd, 04th, ...). course_settings
-- only ever holds the *current* cohort's window, so when admins roll the
-- start/end dates forward to open the next intake, this label lets them
-- record which one is currently configured.

alter table course_settings
  add column if not exists intake_label text;
