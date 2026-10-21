# Development

## Setup

```bash
npm install
cp .dev.vars.example .dev.vars    # PUBLIC_URL=http://localhost:8787, DEV_LOGIN=1
npm run db:migrate:local
```

## Running

**Full stack (recommended)** — the Worker serves the built SPA + API + local D1:

```bash
npm run build && npm run worker:dev     # http://localhost:8787
```

Wrangler doesn't rebuild the frontend; re-run `npm run build` after editing
`src/` (Wrangler picks up the new `dist/` without a restart). Worker code in
`worker/src/` hot-reloads.

**Frontend with HMR** — run `npm run worker:dev` in one terminal and
`npm run dev` in another (Vite on :5173 proxies `/api` to :8787). Note the
OAuth/dev-login redirects land on `PUBLIC_URL` (:8787), so log in there first;
the cookie is shared because both are `localhost`.

### Logging in locally

Click **"Dev login (local only)"** on the login screen. It hits
`GET /api/auth/dev`, which creates/reuses a "Dev User" and sets a session.
It only works when `DEV_LOGIN=1` **and** `PUBLIC_URL` is a localhost URL
(both come from `.dev.vars`); in production it returns 404.

Real OAuth locally needs the client secrets in `.dev.vars` and
`http://localhost:8787/api/auth/callback/{google,github}` registered as
redirect URIs in the provider consoles.

## Verifying changes

```bash
npm run typecheck     # tsc on worker/
npm run build         # vite build — catches JSX/import errors
npm run smoke         # needs worker:dev running; exercises auth + every API path
```

`scripts/smoke-test.mjs` creates and deletes its own data. Extend it when you
add or change an endpoint. For UI work, also click through the change in a
browser (both default mode and plain mode — `M` toggles) and check the
console. Reload the page to confirm edits persisted server-side.

Inspect the local DB directly:

```bash
npx wrangler d1 execute todo-db --local --command "SELECT id, title, status FROM goals"
```

## Migrations

Add `worker/migrations/000N_description.sql`; never edit applied migrations.

```bash
npm run db:migrate:local
npm run db:migrate:remote    # production — confirm with the user first
```

## Deploy (production — confirm with the user first)

```bash
npm run deploy               # vite build && wrangler deploy
```

Ships to the `todo.samandar.dev` custom domain. Apply any new migrations
remotely *before* deploying code that depends on them. Secrets:

```bash
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret list
```

Logs: `npx wrangler tail`.

## Gotchas

- `wrangler dev` rewrites `request.url` to the production route hostname
  (`todo.samandar.dev`) because of the custom-domain route. Don't trust the
  request host for "am I local?" checks — use `env.PUBLIC_URL`.
- The session cookie is `Secure`; browsers allow that on `http://localhost`
  but not on other plain-HTTP hosts (e.g. a LAN IP).
- `dist/` is gitignored and built on deploy.
