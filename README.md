# CMR Weekly Digital Diary

A weekly reflection diary and admin console for the Centre for Meditation
Research's certificate course — student login, weekly diary entries,
weekly check-ins, and an admin dashboard for roster/submission management
and intake applications.

**Stack:** React + Vite + TypeScript + shadcn/ui (frontend), Express
(backend API), Supabase (Postgres + Auth + Storage).

## Docs

- [`docs/features.md`](docs/features.md) — what the app does, by role
- [`docs/setup.md`](docs/setup.md) — database migrations, backend and
  frontend setup, environment variables
- [`docs/architecture.md`](docs/architecture.md) — system diagram, request
  flow, and directory map
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branching, code standards, and
  client delivery practices

## Quick start

```bash
# 1. Apply database migrations — see docs/setup.md

# 2. Backend
cd backend && cp .env.example .env && npm install && npm run dev

# 3. Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

Frontend runs at `http://localhost:5173`, backend at
`http://localhost:4000`. Full setup details, including how to provision the
first admin account and load a student roster, are in
[`docs/setup.md`](docs/setup.md).

## License

Proprietary — see [`LICENSE`](LICENSE).
