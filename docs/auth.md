# Authentication

OAuth 2 authorization-code flow with Google or GitHub; no passwords. Code:
`worker/src/auth.ts` (helpers) and `worker/src/routes/auth.ts` (routes).

## Flow

1. Login screen links (plain `<a href>`, i.e. a browser navigation) to
   `GET /api/auth/{google|github}`.
2. Worker sets a 10-minute `oauth_state` cookie and 302s to the provider with
   `redirect_uri = ${PUBLIC_URL}/api/auth/callback/{provider}`.
3. Provider redirects back to the callback. Worker checks `state` against the
   cookie, exchanges the code, fetches the profile, finds or creates the user
   (keyed by `provider + provider_user_id`), inserts a `sessions` row, and sets
   the `session` cookie (HttpOnly, Secure, SameSite=Lax, 30 days).
4. Redirect to `/`. The SPA calls `GET /api/auth/me` → `{ user }` or `{ user: null }`.
5. `POST /api/auth/logout` deletes the session row and cookie.

On failure the callback redirects to `/?auth_error=cancelled|state|exchange`
and `Login.jsx` shows a message. The underlying error is `console.error`ed —
read it with `npx wrangler tail`.

All `/api/goals` and `/api/import` routes use `requireAuth`
(`worker/src/middleware.ts`), which puts the user on `c.get("user")`. Every
query must also filter by that user (directly or via an owned parent).

## Config

| Name | Where | Value |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID` | `wrangler.toml [vars]` | public |
| `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET` | `wrangler secret put` / `.dev.vars` | secret |
| `PUBLIC_URL` | `wrangler.toml` (prod), `.dev.vars` (local) | origin used to build redirect URIs |
| `DEV_LOGIN` | `.dev.vars` only | `1` enables `/api/auth/dev` |

Provider consoles must list `https://todo.samandar.dev/api/auth/callback/google`
and `.../github` as authorized redirect URIs.

## Troubleshooting

**Clicking "Continue with …" just reloads the login page.** The request never
reached the Worker. With `assets.not_found_handling = "single-page-application"`,
Cloudflare answers *navigation* requests that don't match a static file with
`index.html` before the Worker runs; `fetch()` calls are unaffected, which is
why `/api/auth/me` works while login doesn't. Fix: `run_worker_first =
["/api/*"]` under `[assets]` in `wrangler.toml` (this was the production
outage fixed in Oct 2026). Check with:

```bash
curl -si -H 'Sec-Fetch-Mode: navigate' -H 'Accept: text/html' https://todo.samandar.dev/api/auth/google | head -3
# expect: HTTP/2 302 with a location: header pointing at accounts.google.com
```

**`?auth_error=state`** — state cookie missing/mismatched: the flow took >10
min, was started on a different host than `PUBLIC_URL` (e.g. `www.` or
`workers.dev`), or cookies are blocked.

**`?auth_error=exchange`** — wrong/missing client secret, or the redirect URI
isn't registered with the provider. `npx wrangler secret list` and `wrangler tail`.

**Logged in but `/api/goals` is 401** — session expired or row deleted; log in again.

## Known limitations

- The same person signing in via Google and via GitHub gets two separate
  accounts (no email-based linking).
- Expired `sessions` rows are never purged (harmless; could add a cron).
