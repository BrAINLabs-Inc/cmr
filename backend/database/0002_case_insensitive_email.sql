-- The API now normalizes and looks up emails case-insensitively (students
-- self-register with whatever casing they type). The original unique
-- constraints were case-sensitive, so two rows differing only by case could
-- have been inserted and silently bypassed the "one account per email"
-- guarantee. Replace them with unique indexes on lower(email).

drop index if exists idx_students_email;
alter table students drop constraint if exists students_email_key;
create unique index if not exists idx_students_email on students (lower(email));

drop index if exists idx_admins_email;
alter table admins drop constraint if exists admins_email_key;
create unique index if not exists idx_admins_email on admins (lower(email));
