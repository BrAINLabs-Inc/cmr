-- Admin-managed course intakes: replaces the hardcoded marketing content in
-- LandingPage.tsx with database-driven, admin-editable rows. See
-- SRS/intake-management.md.

create table if not exists intakes (
  id uuid primary key default gen_random_uuid(),
  intake_number int not null,
  course_title text not null default 'Translating the Science of Happiness and Meditation into Practice',
  status text not null default 'upcoming' check (status in ('upcoming', 'open', 'closed')),
  is_published boolean not null default false,

  application_closing_date date,
  closing_date_note text,
  commencing_date date,
  duration_text text,
  mode_text text,
  lecture_schedule_text text,

  modules jsonb not null default '[]',
  objectives jsonb not null default '[]',
  eligibility_text text,
  eligibility_special_category text,

  fee_course text,
  fee_application_local text,
  fee_application_foreign text,
  fee_registration_local text,
  fee_registration_foreign text,

  payment_online_portal_url text,
  payment_bank_name text,
  payment_account_holder_name text,
  payment_reference_code text,

  contact_email text,
  contact_website_url text,
  academic_programme_url text,
  funded_by text,

  created_by uuid references admins (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_intakes_published
  on intakes ((true)) where is_published;

drop trigger if exists trg_intakes_updated_at on intakes;
create trigger trg_intakes_updated_at
  before update on intakes
  for each row execute function set_updated_at();

alter table intakes enable row level security;

drop policy if exists intakes_admin_all on intakes;
create policy intakes_admin_all on intakes
  for all using (is_admin()) with check (is_admin());
