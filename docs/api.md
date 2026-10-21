# API reference

All JSON. All routes except `/api/auth/*` require a valid `session` cookie
(401 `{ "error": "unauthorized" }` otherwise). Errors are
`{ "error": string }` with a 4xx/5xx status. Unknown `/api/*` paths → 404 JSON.

Every mutation under `/api/goals/:goalId/...` responds with the **full goal**
(`{ goal }`, including `phases[].tasks[]` and `checkins[]`), so the client can
adopt it as the new truth.

## Auth — `worker/src/routes/auth.ts`

| Method & path | Notes |
| --- | --- |
| `GET /api/auth/me` | `{ user: {id,email,name,avatar_url} \| null }` (always 200) |
| `POST /api/auth/logout` | `{ ok: true }` |
| `GET /api/auth/:provider` | `google` \| `github`; 302 to provider |
| `GET /api/auth/callback/:provider` | 302 to `/` or `/?auth_error=…` |
| `GET /api/auth/dev` | Local only (see docs/auth.md); 302 to `/` |

Route order matters: literal paths are registered before `/:provider`.

## Goals — `worker/src/routes/goals.ts`

| Method & path | Body | Returns |
| --- | --- | --- |
| `GET /api/goals` | – | `{ goals: [...] }` summaries: goal columns + `task_count`, `task_done_count`, **no `phases`** |
| `POST /api/goals` | `{ id?, title*, description, emoji, color, category, target_date, total_days, phases?: [{ id?, label, title, duration, tasks?: [{ id?, text, tag, notes, priority, due_date, done }] }] }` | 201 `{ goal }` — inserted in one D1 batch |
| `GET /api/goals/:id` | – | `{ goal }` |
| `PATCH /api/goals/:id` | any of `title, description, emoji, color, category, status, target_date, total_days, sort_order` | `{ goal }` |
| `DELETE /api/goals/:id` | – | `{ ok: true }` (cascades) |
| `POST /api/goals/:goalId/phases` | `{ id?, label, title, duration, target_date, sort_order? }` | 201 `{ goal }` |
| `PATCH /api/goals/:goalId/phases/:phaseId` | any of `label, title, duration, target_date, sort_order` | `{ goal }` |
| `DELETE /api/goals/:goalId/phases/:phaseId` | – | `{ goal }` (cascades tasks) |
| `POST /api/goals/:goalId/phases/:phaseId/tasks` | `{ id?, text, tag, notes, priority, due_date, done, sort_order? }` | 201 `{ goal }` |
| `PATCH /api/goals/:goalId/tasks/:taskId` | any of `text, tag, notes, priority, due_date, done, sort_order, phase_id` | `{ goal }`; `done` also sets `completed_at`; `phase_id` must be a phase of the same goal |
| `DELETE /api/goals/:goalId/tasks/:taskId` | – | `{ goal }` |
| `PUT /api/goals/:goalId/order` | `{ phases: [{ id, tasks: [taskId, …] }, …] }` | `{ goal }` — sets phase order and each task's phase + position in one batch |
| `POST /api/goals/:goalId/checkins` | `{ note* }` | 201 `{ goal }` |
| `DELETE /api/goals/:goalId/checkins/:checkinId` | – | `{ goal }` |

`id?` = optional client-generated id, accepted if it matches
`/^[A-Za-z0-9_-]{8,64}$/` (see `pickId` in `worker/src/id.ts`), else the server
mints a UUID. Empty-string `due_date` is stored as `NULL`.

## Import — `worker/src/routes/import.ts`

`POST /api/import` `{ checklists: [goalLike, …] }` → `{ ok, imported }`.
Accepts the legacy localStorage format and the app's own "Export" JSON.
Always assigns fresh ids (importing twice = two copies). One D1 batch.

## Adding an endpoint — checklist

1. Add the route in the right `routes/*.ts`; verify ownership (`assertGoalOwned`
   / `assertPhaseOwned` or `WHERE user_id = ?`).
2. Validate enums against the constant arrays at the top of the file; only
   set columns whose body field has the right type (see the `setField` pattern).
3. Return `loadGoalFull(...)` for goal-tree mutations.
4. Add the client method in `src/lib/api.js` (normalize with `normalizeGoal`).
5. Add a check to `scripts/smoke-test.mjs`; run `npm run typecheck && npm run smoke`.
6. Update this file.
