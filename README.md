# todo

A goal-tracking app — break a goal (a software project, a study plan, a
business milestone) into phases and tasks, track progress, log check-ins
along the way. React + Vite frontend, Cloudflare Workers + D1 backend,
Google/GitHub OAuth. Keyboard-driven (vim-style) with a touch-friendly
responsive layout.

## Local development

Frontend only (uses `vite.config.js`'s dev proxy to `/api` — point it at a
running `wrangler dev` instance, or at the deployed Worker):

```bash
npm install
npm run dev
```

Full stack (frontend + Worker API + local D1), via Wrangler:

```bash
npm run build
npm run worker:dev
```

## Database migrations

```bash
npm run db:migrate:local    # apply to the local D1 instance
npm run db:migrate:remote   # apply to the production D1 database
```

## Deploy

```bash
npm run deploy
# builds the frontend, then `wrangler deploy` ships the Worker
# (serving both the static assets and /api/*) to Cloudflare.
```

OAuth client IDs live in `wrangler.toml` under `[vars]`; the matching
secrets (`GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`) and the session
cookie signing secret (`SESSION_SECRET`) are set via:

```bash
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
```
