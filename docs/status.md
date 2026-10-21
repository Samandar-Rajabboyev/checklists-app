# Status

_Last updated: 2026-10-21._

## Working (verified locally via `npm run smoke` + browser click-through)

- Google/GitHub OAuth login in production-shaped routing, logout, local dev login
- Goals CRUD, templates (software/study/business), categories, archive
- Keyboard-first goal editor: outliner keys, paste-a-list, drag reorder,
  draft autosave + restore, discard confirmation, target date
- Phases & tasks: add, edit, delete, toggle, priority, due dates, notes
- Reordering & cross-phase moves (keyboard + drag/drop) persisted via `PUT /order`
- Edits made in the goal modal (incl. phase/task changes) persisted
- Check-ins (default mode), JSON export/import, legacy localStorage import
- Plain mode (sidebar + terminal-style detail), color schemes, responsive layout

## History

- Oct 2026: migrated from localStorage-only + GitHub Pages to Cloudflare
  Workers + D1 with OAuth. Auth was broken in production because the SPA
  asset fallback swallowed `/api/*` navigations (fixed with
  `run_worker_first`, see docs/auth.md). Sync layer rewritten: client ids,
  goal-level diffing, bulk reorder endpoint, per-goal queue.

## Known gaps / next work (rough priority)

1. **Plain mode has no check-ins UI** (Detail has `Checkins`; PlainContent doesn't).
2. **No automated tests beyond the API smoke test** — candidates: unit tests
   for `lib/diffSync.js` (pure apart from `api`), Vitest + `@cloudflare/vitest-pool-workers`
   for routes.
3. **Chatty sync** — each phase/task op is its own request returning the
   whole goal. Fine at current scale; a batched `PATCH /goals/:id/tree`
   would cut it to one request per edit.
4. **Goal ordering on Home** — `goals.sort_order` exists in the API but the
   UI has no way to reorder goals.
5. **`status` paused/done** exist in the schema but the UI only uses active/archived.
6. **Account linking** — same email via Google + GitHub = two accounts.
7. **Session cleanup** — expired `sessions` rows are never deleted (cron trigger).
8. `Detail.jsx` / `PlainContent.jsx` duplicate tree logic; extract shared hooks.
