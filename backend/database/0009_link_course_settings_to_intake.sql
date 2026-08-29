-- course_settings drives the weekly diary timeline for whichever intake's
-- students are currently being evaluated. Now that intakes are real rows
-- (0007_intakes.sql) rather than hardcoded landing-page copy, replace the
-- free-text "intake_label" with a proper reference to the intake it
-- belongs to — one source of truth for an intake's identity instead of two.

alter table course_settings
  add column if not exists intake_id uuid references intakes (id);

alter table course_settings
  drop column if exists intake_label;
