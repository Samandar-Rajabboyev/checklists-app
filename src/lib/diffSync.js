import { api } from "./api.js";

// The UI edits a whole goal object at a time (Detail/PlainContent/Modal all
// call onChange/onSave with a new goal containing a new `phases` tree). The
// API is normalized into goal/phase/task rows, so this diffs the last
// server-confirmed version against the desired one and fires the minimal
// set of calls to reconcile them. Ids are client-generated and accepted by
// the server, so a just-created task keeps the same id on both sides.
//
// Returns the server's final goal, or null if nothing needed saving.

const GOAL_FIELDS = ["title", "description", "emoji", "color", "category", "total_days", "target_date"];
const PHASE_FIELDS = ["label", "title", "duration"];
const TASK_FIELDS = ["text", "done", "tag", "priority", "due_date", "notes"];

// "" and null both mean "no due date" etc. — don't sync spurious changes.
const norm = (v) => (v === "" || v === undefined ? null : v);

// Fields present on `next` whose value differs from `prev`. Fields missing
// from `next` (e.g. Modal doesn't carry task notes) are left untouched.
function changedFields(prev, next, fields) {
  const patch = {};
  for (const f of fields) {
    if (next[f] === undefined) continue;
    if (norm(prev?.[f]) !== norm(next[f])) patch[f] = f === "due_date" || f === "target_date" ? norm(next[f]) : next[f];
  }
  return Object.keys(patch).length ? patch : null;
}

const orderKey = (phases) => JSON.stringify(phases.map((p) => [p.id, p.tasks.map((t) => t.id)]));

export async function syncGoal(prev, next) {
  const goalId = next.id;
  const ops = [];

  const goalPatch = changedFields(prev, next, GOAL_FIELDS) || {};
  if (typeof next.archived === "boolean" && next.archived !== !!prev?.archived) {
    goalPatch.status = next.archived ? "archived" : "active";
  }
  if (Object.keys(goalPatch).length) ops.push(() => api.updateGoal(goalId, goalPatch));

  // Summary rows (home list) carry no phases; only diff the tree when both
  // sides have one. useGoals guarantees `prev` is full when `next` is.
  if (prev?.phases && next.phases) {
    const prevPhases = prev.phases;
    const nextPhases = next.phases;
    const prevPhaseById = new Map(prevPhases.map((p) => [p.id, p]));
    const nextPhaseIds = new Set(nextPhases.map((p) => p.id));
    const prevTaskById = new Map(prevPhases.flatMap((p) => p.tasks.map((t) => [t.id, t])));
    const nextTaskIds = new Set(nextPhases.flatMap((p) => p.tasks.map((t) => t.id)));

    // 1. New phases first, so tasks can be created in or moved into them.
    nextPhases.forEach((ph, idx) => {
      const prevPh = prevPhaseById.get(ph.id);
      if (!prevPh) {
        ops.push(() =>
          api.addPhase(goalId, { id: ph.id, label: ph.label, title: ph.title, duration: ph.duration, sort_order: idx }),
        );
        return;
      }
      const patch = changedFields(prevPh, ph, PHASE_FIELDS);
      if (patch) ops.push(() => api.updatePhase(goalId, ph.id, patch));
    });

    // 2. New tasks and field edits on existing ones.
    nextPhases.forEach((ph) => {
      ph.tasks.forEach((t, ti) => {
        const prevT = prevTaskById.get(t.id);
        if (!prevT) {
          ops.push(() => api.addTask(goalId, ph.id, { ...t, sort_order: ti }));
          return;
        }
        const patch = changedFields(prevT, t, TASK_FIELDS);
        if (patch) ops.push(() => api.updateTask(goalId, t.id, patch));
      });
    });

    // 3. Ordering / cross-phase moves, in one request. Must run before
    //    phase deletes so tasks moved out of a doomed phase survive the
    //    ON DELETE CASCADE.
    const survivingPrev = prevPhases
      .filter((p) => nextPhaseIds.has(p.id))
      .map((p) => ({ ...p, tasks: p.tasks.filter((t) => nextTaskIds.has(t.id)) }));
    if (orderKey(survivingPrev) !== orderKey(nextPhases)) {
      ops.push(() => api.reorder(goalId, nextPhases.map((p) => ({ id: p.id, tasks: p.tasks.map((t) => t.id) }))));
    }

    // 4. Deletes last.
    for (const t of prevTaskById.values()) {
      if (!nextTaskIds.has(t.id)) ops.push(() => api.deleteTask(goalId, t.id));
    }
    for (const p of prevPhases) {
      if (!nextPhaseIds.has(p.id)) ops.push(() => api.deletePhase(goalId, p.id));
    }
  }

  // Sequential, not Promise.all: each call returns the whole goal, and
  // the last response is the authoritative post-sync state.
  let result = null;
  for (const op of ops) result = await op();
  return result;
}
