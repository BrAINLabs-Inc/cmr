-- In-app applicant registration, replacing the external Google Form.
-- Documents (degree certificates, payment slip) are stored in the private
-- Supabase Storage bucket "application-documents" (create this bucket
-- manually in the Supabase Dashboard, unchecking "Public bucket" — there is
-- no SQL migration for storage buckets). See SRS/intake-management.md.

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references intakes (id),

  title text,
  full_name text not null,
  name_with_initials text not null,
  residential_address text not null,
  date_of_birth date not null,
  gender text not null check (gender in ('male', 'female', 'prefer_not_to_say')),
  nic_or_passport text not null,
  email text not null,
  phone_number text not null,
  whatsapp_number text,

  current_occupation text not null,
  education_qualification text not null
    check (education_qualification in ('undergraduate', 'bachelor', 'master', 'mphil', 'phd', 'other')),
  education_qualification_other text,
  degree_name text not null,
  degree_documents jsonb not null default '[]',
  reason_for_joining text,
  has_meditation_experience boolean,
  how_heard text not null check (how_heard in ('social_media', 'website', 'friends', 'other')),
  how_heard_other text,
  payment_slip jsonb not null,

  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'approved', 'rejected', 'waitlisted')),
  admin_notes text,
  reviewed_by uuid references admins (id),
  reviewed_at timestamptz,

  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_applications_intake on applications (intake_id);
create index if not exists idx_applications_status on applications (status);
create index if not exists idx_applications_email on applications (lower(email));

drop trigger if exists trg_applications_updated_at on applications;
create trigger trg_applications_updated_at
  before update on applications
  for each row execute function set_updated_at();

alter table applications enable row level security;

drop policy if exists applications_admin_all on applications;
create policy applications_admin_all on applications
  for all using (is_admin()) with check (is_admin());
