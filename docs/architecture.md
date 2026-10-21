# Architecture

```
browser ──► Cloudflare Worker "todo" (worker/src/index.ts, Hono)
              ├─ /api/*  → Hono routes (auth, goals, import) → D1 "todo-db"
              └─ else    → ASSETS binding (./dist, SPA fallback to index.html)
```

One Worker serves both the built SPA and the API on the same origin
(`todo.samandar.dev`), so the session cookie is first-party and no CORS is
needed. `wrangler.toml` sets `run_worker_first = ["/api/*"]` so API requests
— including browser navigations like the OAuth redirects — always reach the
Worker instead of the SPA fallback.

## Repo layout

```
src/                     React SPA (plain JS/JSX)
  App.jsx                Root: auth gate → AuthedApp (view routing, theme, mode)
  hooks/useAuth.js       GET /api/auth/me, logout
  hooks/useGoals.js      All goal state + the queued save/sync engine
  lib/api.js             fetch wrapper + response normalization
  lib/diffSync.js        Diffs two goal versions → minimal API calls
  lib/storage.js         localStorage prefs (theme, view, mode), uid(), getProgress()
  components/            Home, Detail, Modal, PlainApp/PlainContent, Login, …
  styles/                CSS-in-JS strings: classic.js (default), plain.js
  constants.js           Color schemes (CSS variables), accent colors
worker/
  src/index.ts           Hono app, error handler, asset fallthrough
  src/routes/auth.ts     OAuth start/callback, me, logout, dev login
  src/routes/goals.ts    Goals/phases/tasks/check-ins CRUD + bulk reorder
  src/routes/import.ts   Bulk import (legacy localStorage data / exported JSON)
  src/auth.ts            OAuth exchange, users, sessions, cookies
  src/id.ts              newId(), pickId() (accepts client ids), randomToken()
  migrations/            D1 SQL migrations (apply in order)
scripts/smoke-test.mjs   End-to-end API test against local wrangler dev
wrangler.toml            Worker, assets, D1 binding, custom domain, public vars
```

## Data model (D1 / SQLite)

```
users (id, provider, provider_user_id, email, name, avatar_url)
  └─ sessions (id = random token in `session` cookie, user_id, expires_at)
  └─ goals (title, description, emoji, color, category, status, target_date,
            total_days, sort_order)
       ├─ phases (label, title, duration, target_date, sort_order)
       │    └─ tasks (text, tag, notes, priority, due_date, done,
       │              completed_at, sort_order)
       └─ checkins (note, created_at)
```

- All child rows `ON DELETE CASCADE` from their parent.
- `category` ∈ software|study|business|personal|custom;
  `status` ∈ active|paused|done|archived (UI only uses active/archived);
  `priority` ∈ none|low|medium|high. Enforced by CHECK constraints.
- Timestamps are ISO-8601 strings. `done` is 0/1 in SQL; `lib/api.js`
  normalizes to boolean, and maps `status === "archived"` → `archived: true`.

## Request lifecycle of an edit

1. A component builds a new goal object and calls `onChange(goal)`.
2. `useGoals.saveChecklist` puts it into React state immediately (optimistic).
3. It enqueues a sync for that goal id (one promise chain per goal).
4. The sync diffs the last server-confirmed version against the new one
   (`lib/diffSync.js`) and sends only what changed.
5. Each endpoint returns the full goal; the last response becomes the new
   server baseline and is written back to state once the queue drains.
6. On error: toast + re-fetch the goal so the UI matches the server.
