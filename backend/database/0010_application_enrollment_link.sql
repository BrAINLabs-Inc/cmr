-- Approving an application now automatically enrolls the applicant onto the
-- student roster (backend/src/utils/enrollment.js) instead of requiring a
-- separate manual "add student" step. This column records which roster row
-- an application resulted in, so re-approving (or toggling status back and
-- forth) never creates a duplicate student.

alter table applications
  add column if not exists enrolled_student_id uuid references students (id);

create index if not exists idx_applications_enrolled_student on applications (enrolled_student_id);
