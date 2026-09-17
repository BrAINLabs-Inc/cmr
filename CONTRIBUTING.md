# Contributing & Professional Practices

This is a client engagement: Brain Labs is building the CMR Weekly Digital
Diary for the Centre for Meditation Research (CMR), Faculty of Medicine,
University of Colombo. This document sets the working practices for anyone
contributing to the repo, and the standards expected before work is
considered client-ready.

## 1. Contribution workflow

- **Branching**: work off `development`, branch per feature/fix
  (`feat/...`, `fix/...`, `docs/...`), and open PRs into `development`.
  Only release-ready work is merged from `development` into `master`.
- **Commits**: use a short, imperative subject line with a conventional
  prefix (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`), matching the
  existing history (see `git log`).
- **Pull requests**: every PR uses `.github/PULL_REQUEST_TEMPLATE.md` —
  fill in the summary, changes, database-migration checklist, and testing
  checklist. Do not merge with unchecked required boxes.
- **Reviews**: at least one other contributor reviews and approves non-trivial
  PRs before merge. Reviewers check correctness, scope creep, and that the
  checklist claims (tests run, no secrets) are actually true.
- **CI**: `.github/workflows/ci.yml` runs lint/test/build on every PR against
  `main`-style branches. A PR must be green before merge; do not bypass CI
  with `--no-verify` or force-merges.

## 2. Code & security standards

- **Lint/format**: run `npm run lint` in `backend/` and `frontend/` before
  pushing; fix warnings rather than suppressing them.
- **Tests**: run `npm test` in `backend/` for any change touching API
  behavior; add/update tests alongside the code they cover rather than after
  the fact.
- **Type safety**: `frontend/` is TypeScript — avoid `any` and unchecked
  casts; let `npm run build` catch type errors before opening a PR.
- **Secrets**: never commit `.env` files, API keys, Supabase service-role
  keys, or credentials. Double-check `git status`/`git diff` before staging,
  especially for new files.
- **Database changes**: schema changes are additive, numbered SQL migrations
  in `backend/database/` (see `README.md` for the current sequence) — never
  edit a migration that has already been applied to a shared environment.
- **Access control**: preserve existing authorization boundaries (e.g.
  diary-entry confidentiality, `requireAdmin`-gated routes) — any change
  touching auth or data visibility needs explicit review attention.

## 3. Client delivery practices

- **Requirements**: significant feature work should trace back to an
  agreed requirement (see `SRS/`); flag scope questions to the client contact
  before building rather than guessing.
- **Environments**: keep development, staging, and production configuration
  separate (`.env` per environment, distinct Supabase projects/keys) — never
  point local development at production data.
- **Documentation**: update `README.md` when setup steps, environment
  variables, or user-facing behavior change, so the client/next developer can
  reproduce the environment without asking Brain Labs directly.
- **Handover hygiene**: keep commit history and PRs legible (small, scoped
  changes with clear messages) since this codebase is expected to outlive any
  single contributor and may be handed off to the client or another team.
- **Communication**: raise blockers, ambiguous requirements, or timeline
  risks early with the project point of contact rather than silently
  reinterpreting scope.
