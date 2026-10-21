# Frontend

React 18, plain JS/JSX, no router, no state library. Built by Vite into `dist/`.

## Component tree

```
App                         auth gate; applies color scheme for all screens
├─ Login                    OAuth links, ?auth_error message, local dev login
└─ AuthedApp                owns useGoals(), view ("home"|"detail"), theme, uiMode
   ├─ [uiMode = "classic"]  (the default look; name is historical)
   │  ├─ Home               goal grid/list/compact, filters, search, import, sign out
   │  ├─ Detail             one goal: phases/tasks, vim keymaps, drag/drop, check-ins
   │  └─ Modal              goal editor (create + edit) — see "Goal editor" below
   ├─ [uiMode = "plain"]    terminal-style alternative (toggle with `M`)
   │  └─ PlainApp           sidebar of goals + PlainContent (detail) + its own Modal
   ├─ HelpOverlay (`?`)
   └─ import prompt         one-time offer to import legacy localStorage data
```

Styles are template strings in `src/styles/` injected via `<style>`; colors are
CSS variables set by `applyScheme()` from `SCHEMES` in `src/constants.js`.
`plain.js` overrides apply under `body.plain`. Mobile breakpoints live in
the same files.

## State & sync — read before touching data flow

`src/hooks/useGoals.js` is the only place goal data is mutated.

- `checklists` — array of goals. Items from `GET /goals` are **summaries**
  (no `phases`; progress via `task_count`/`task_done_count`). Opening a goal
  calls `selectChecklist(id)`, which loads the full tree into the same slot.
  `getProgress()` handles both shapes.
- `saveChecklist(goalOrPartial)` (exported as both `changeChecklist` and
  `updateChecklist`): merges into the current item, updates state
  immediately, and enqueues a sync. Components just call
  `onChange({...checklist, phases: newPhases})` — no API knowledge needed.
- Per-goal queue (`queues` ref): syncs for one goal run strictly in order.
  Only the *last* queued sync writes the server's response back to state,
  so in-flight responses never clobber newer local edits.
- `server` ref: last server-confirmed version per goal = the diff baseline.
- `lib/diffSync.js#syncGoal(prev, next)` emits, in order: goal PATCH; new
  phases; phase field PATCHes; new tasks; task field PATCHes; one
  `PUT /order` if any order/membership changed; task deletes; phase deletes.
  Fields absent from `next` are left alone (Modal doesn't carry `notes`).
- Ids for new goals/phases/tasks come from `uid()` = `crypto.randomUUID()`
  and are kept by the server, so a task can be edited before its create
  request finishes.
- Failures: `syncError` toast (auto-hides) and the goal is re-fetched.
- `createChecklist`, `deleteChecklist`, `archiveChecklist`,
  `importChecklists`, `addCheckin`, `deleteCheckin` are the other entry points.

## Goal editor (`components/Modal.jsx`)

Used for both create and edit, from both UI modes. Designed to be typed
through like an outliner; keep it that way when changing it.

- Layout: emoji button + big title; template chips (new goals, until the
  user edits the seeded phases); a collapsed **details** row (description,
  category, target date, estimated days, color) shown as summary pills;
  phases & tasks; sticky footer with counts and Cancel/Save.
- Keys (handled on the dialog element, which **stops propagation** so the
  window-level shortcuts in Home/Detail/plain mode never fire while it's
  open): `Enter` in title → first phase; `Enter` in phase title → its
  tasks; `Enter` in a task splits at the caret / makes the next task;
  `Enter` on an empty last task or the "Add a task" line → new phase;
  `Shift+Enter` → new phase; `Backspace` on empty → delete + focus previous;
  `↑/↓` move between lines; `Alt+↑/↓` reorder task (hops phases at the
  edges) or phase; `⌘/Ctrl+Enter` or `⌘/Ctrl+S` save; `Esc` close (asks
  first if dirty; `Esc` again discards).
- Paste a multi-line list into any task line → one task per line;
  `# Heading` lines become phases, `[x]` keeps done state
  (`lib/pasteList.js`, pure).
- Tasks can also be dragged by the `⠿` handle; priority/due/delete
  controls appear on row hover/focus (always shown on touch devices).
- New-goal input autosaves to localStorage `goal-draft` and is offered back
  ("Restored your unsaved draft") next time; cleared on save or discard.
- Phase `label` "" means auto: shown and saved as `Phase <index>`.
- Edit mode spreads the original phase/task objects so fields the editor
  doesn't show (`notes`, `completed_at`) survive a save. If the goal's tree
  isn't loaded, the editor omits `phases` from the payload so the sync
  can't mistake it for "delete everything".
- Templates live in `lib/templates.js`; styles in `styles/goalModal.js`
  (`gm-` prefix).

## Local preferences (localStorage, `lib/storage.js`)

`scheme`, `uimode` (classic|plain), `view` (grid|list|compact),
`import-offered`, `goal-draft`, and legacy data keys `checklists-v2`/`checklists-v1`
(read-only now, for the import prompt).

## Keymaps

Defined inline in each component's `keydown` effect; the canonical list for
users is `HelpOverlay.jsx` — update it when adding keys. Global: `?` help,
`T` theme, `M` plain/default mode. Home: `j/k h/l Enter n i v Tab /`.
Detail: `j/k` move, `x`/Enter toggle, `J/K` reorder, `H/L` move task to
prev/next phase, `[`/`]` move phase, `P` toggle phase, `dd` delete task,
`V` visual (multi-select), `/` search, `z` fold, `e` edit, `a` archive,
`E` export, `d` delete goal, `b`/Esc back. Handlers bail out when focus is
in an INPUT/TEXTAREA.

## Conventions

- Components receive data + callbacks as props; no context providers.
- Keep components unaware of the API; add behavior to `useGoals` instead.
- `Detail.jsx` (≈1150 lines) and `PlainContent.jsx` (≈700) duplicate a lot
  of keyboard/tree logic — when changing tree behavior, change both.
