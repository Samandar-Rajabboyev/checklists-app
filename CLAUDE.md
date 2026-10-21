# todo — agent guide

Goal tracker: goals → phases → tasks, plus check-ins. React 18 + Vite SPA,
served by a Cloudflare Worker (Hono) that also hosts the `/api/*` backend on
D1. Google/GitHub OAuth. Live at https://todo.samandar.dev.

Read the doc that matches your task before changing code:

| Doc | Read when |
| --- | --- |
| [docs/architecture.md](docs/architecture.md) | First time in the repo; anything spanning frontend + Worker |
| [docs/development.md](docs/development.md) | Running, testing, deploying, migrations |
| [docs/auth.md](docs/auth.md) | Login, sessions, OAuth config, "auth is broken" |
| [docs/api.md](docs/api.md) | Adding/changing an endpoint or the DB schema |
| [docs/frontend.md](docs/frontend.md) | UI components, state, the sync model, keymaps |
| [docs/status.md](docs/status.md) | What's done, known gaps, ideas for next work |

## Ground rules

- **Verify before claiming done**: `npm run typecheck && npm run build`, then
  with `npm run worker:dev` running, `npm run smoke`. For UI changes, also
  click through at http://localhost:8787 using "Dev login (local only)".
- **All goal mutations go through `useGoals().saveChecklist`** (exposed as
  `changeChecklist`/`updateChecklist`) — never call `api.*` mutation methods
  from components. See docs/frontend.md.
- **Ids are client-generated** (`crypto.randomUUID()` via `uid()`) and the
  server keeps them. Don't reintroduce server-assigned ids for goals/phases/tasks.
- **Schema changes = a new file in `worker/migrations/`** (never edit
  `0001_init.sql`), applied with `npm run db:migrate:local` / `:remote`.
- **Don't remove `run_worker_first` from `wrangler.toml`** — it's what makes
  OAuth work. See docs/auth.md.
- Secrets (`*_CLIENT_SECRET`) are Wrangler secrets; never commit them.
  `.dev.vars` is gitignored; `.dev.vars.example` is the template.
- Deploying (`npm run deploy`) and remote migrations touch production —
  ask the user first.
- Match existing style: plain JS + JSX on the frontend (no TS), TypeScript
  in `worker/`, CSS-in-JS strings in `src/styles/`, comments explain *why*.
