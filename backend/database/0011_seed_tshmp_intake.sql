-- One-off seed of real content from the Certificate Course's actual page
-- (https://med.cmb.ac.lk/academic-programs/tshmp/), so the Intakes admin UI
-- starts from accurate copy instead of empty fields. This is intake 3 (the
-- round that closed 05 June 2026 and led to the July 2026 inauguration per
-- the CMR archives) -- seeded as closed/unpublished since it's already
-- history by the time this migration runs. When the next intake opens,
-- create a new row from the admin UI (duplicate this content as a
-- starting point) and publish that one instead of this historical record.
--
-- Fields left null below (application/registration fees, exact commencing
-- date) were not published on the source page -- fill them in via the admin
-- UI if you have the real figures, rather than guessing here.
--
-- Uses dollar-quoted strings ($txt$...$txt$ / $json$...$json$) instead of
-- '...' throughout: some SQL editors "smart-quote" a pasted apostrophe into
-- a curly quote, which silently breaks a '...' string mid-sentence and
-- makes Postgres parse the rest of the sentence as bare SQL tokens (this is
-- what caused "relation ... does not exist" if you hit that on the first
-- version of this file). Dollar-quoting doesn't use the apostrophe
-- character at all, so that substitution can't happen.

insert into intakes (
  intake_number,
  course_title,
  status,
  is_published,
  application_closing_date,
  duration_text,
  mode_text,
  lecture_schedule_text,
  modules,
  objectives,
  eligibility_text,
  fee_course,
  funded_by,
  contact_email,
  contact_website_url,
  academic_programme_url
)
select
  3,
  $txt$Translating the Science of Happiness and Meditation into Practice$txt$,
  $txt$closed$txt$,
  false,
  date $txt$2026-06-05$txt$,
  $txt$6 months -- 150 hours direct teaching + 450 hours guided self-learning (12 credits)$txt$,
  $txt$Hybrid -- onsite direct instruction with guided self-learning$txt$,
  $txt$Saturdays, 9:00 am - 4:00 pm$txt$,
  $json$[
    "Emotions and emotionally driven actions",
    "Happiness",
    "Meditation",
    "Creativity, art and drama in happiness",
    "Translating science to daily living",
    "Wisdom, morality and wellbeing"
  ]$json$::jsonb,
  $json$[
    "Become disseminators of the knowledge of the science of happiness and meditation.",
    "Become practitioners of the skills taught in the course.",
    "Become leaders introducing these skills to workplaces and society."
  ]$json$::jsonb,
  $txt$Candidates should have a degree from a recognized university in Sri Lanka or abroad. Open to administrators, professionals, academics, postgraduate students, and school teachers.$txt$,
  $txt$Free of Charge -- funded by the Rekhi Foundation for Happiness$txt$,
  $txt$Rekhi Foundation for Happiness$txt$,
  $txt$cmr@med.cmb.ac.lk$txt$,
  $txt$https://med.cmb.ac.lk/cmr/$txt$,
  $txt$https://med.cmb.ac.lk/academic-programs/tshmp/$txt$
where not exists (select 1 from intakes where intake_number = 3);
