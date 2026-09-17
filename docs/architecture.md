# Architecture

Three pieces: a React SPA, an Express API, and Supabase (Postgres + Auth +
Storage). The frontend talks to Supabase Auth directly for sign-in/sign-up;
everything else goes through the Express API, which is the only thing that
holds the Supabase service-role key.

```mermaid
flowchart TD
    subgraph Frontend["Frontend — React + Vite + TypeScript"]
        Landing["Public site<br/>/ · /apply · /practice"]
        AuthPages["Auth pages<br/>/login · /register · /reset-password"]
        StudentApp["Student app<br/>/dashboard · /diary/:week · /checkin"]
        AdminApp["Admin console<br/>/admin/*"]
    end

    subgraph Backend["Backend — Express API (:4000)"]
        AuthMw["auth middleware<br/>verifies Supabase JWT"]
        RateLimit["rate limiting · helmet · pino"]
        Routes["Routes<br/>diary · checkin · public · admin/*"]
    end

    subgraph Supabase["Supabase"]
        SupaAuth[("Auth<br/>email + password")]
        DB[("Postgres<br/>students · admins · diary_entries<br/>intakes · applications")]
        Storage[("Storage<br/>application-documents")]
    end

    AuthPages -- "sign in / sign up" --> SupaAuth
    SupaAuth -. "JWT" .-> StudentApp
    SupaAuth -. "JWT" .-> AdminApp

    Landing --> Routes
    StudentApp -- "Authorization: Bearer JWT" --> AuthMw
    AdminApp -- "Authorization: Bearer JWT" --> AuthMw
    AuthMw --> RateLimit --> Routes

    Routes -- "service-role key<br/>(bypasses RLS)" --> DB
    Routes -- "signed URLs" --> Storage

    classDef box fill:#f8fafc,stroke:#94a3b8,color:#0f172a;
    class Landing,AuthPages,StudentApp,AdminApp,AuthMw,RateLimit,Routes box;
```

## Why it's shaped this way

- **Supabase Auth is called directly from the browser** for sign-in, so
  password handling never touches our own server. The resulting JWT is
  then sent as a bearer token on every API request.
- **The Express API is the only service-role client.** Postgres has RLS
  enabled on `diary_entries` and `students` as defense-in-depth, but since
  the backend uses the service-role key (which bypasses RLS), the real
  access control is `backend/src/middleware/auth.js` checking the JWT and
  role on every request — not the database policies.
- **Roster gating replaces open signup.** A student can only self-register
  if their email + student ID already exist as a row an admin added.
  Admins are provisioned out-of-band via `npm run create-admin`, never
  through a form.
- **No migration runner.** Schema changes are numbered SQL files in
  `backend/database/`, pasted into the Supabase SQL Editor by hand — simple
  enough for this project's scale, and every file is idempotent.

## Request flow (student submitting a diary entry)

1. Browser calls `supabase.auth.signInWithPassword()` → Supabase Auth
   returns a JWT, stored client-side by the Supabase JS client.
2. The SPA calls `POST /api/diary/:week` with `Authorization: Bearer <jwt>`.
3. `middleware/auth.js` verifies the JWT against Supabase, loads the
   matching `students` row, and attaches it to the request.
4. The route handler validates the body with a zod schema
   (`src/schemas/*.schema.js`), then reads/writes `diary_entries` using the
   service-role Supabase client.
5. A submitted entry becomes read-only — resubmission is blocked in the
   route handler, not just in the UI.

## Directory map

| Path | What's there |
| --- | --- |
| `frontend/src/pages/landing/` | Public marketing site |
| `frontend/src/pages/student/`, `pages/admin/` | Authenticated app screens |
| `frontend/src/components/layout/` | Sidebar + shell shared by student/admin |
| `backend/src/routes/` | Express routes (`admin/` for admin-only ones) |
| `backend/src/middleware/` | JWT auth, error handling |
| `backend/src/schemas/` | zod request validation |
| `backend/database/` | Numbered SQL migrations |
| `docs/` | This documentation |
