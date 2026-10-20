import { api } from "./api.js";

// Detail.jsx and PlainContent.jsx mutate a checklist's `phases` tree in bulk
// (toggle, reorder, add, delete all produce a whole new `phases` array) and
// call onChange(wholeChecklist) — exactly like the old localStorage version
// did. The API is normalized into separate phase/task tables though, so
// this walks old vs new phases/tasks and fires the minimal set of calls
// needed to reconcile the two, in a safe order (deletes last).
export async function syncPhaseChanges(goalId, prevChecklist, nextChecklist) {
  const prevPhases = prevChecklist?.phases || [];
  const nextPhases = nextChecklist?.phases || [];
  const prevPhaseById = new Map(prevPhases.map((p) => [p.id, p]));
  const nextPhaseById = new Map(nextPhases.map((p) => [p.id, p]));

  const ops = [];

  nextPhases.forEach((ph, idx) => {
    const prevPh = prevPhaseById.get(ph.id);
    if (!prevPh) {
      ops.push(() => api.addPhase(goalId, { ...ph, sort_order: idx }));
      return;
    }
    if (prevPh.label !== ph.label || prevPh.title !== ph.title || prevPh.duration !== ph.duration) {
      ops.push(() => api.updatePhase(goalId, ph.id, { label: ph.label, title: ph.title, duration: ph.duration }));
    }

    const prevTaskById = new Map(prevPh.tasks.map((t) => [t.id, t]));
    const nextTaskById = new Map(ph.tasks.map((t) => [t.id, t]));

    ph.tasks.forEach((t, ti) => {
      const prevT = prevTaskById.get(t.id);
      if (!prevT) {
        ops.push(() => api.addTask(goalId, ph.id, { ...t, sort_order: ti }));
        return;
      }
      const changed =
        prevT.text !== t.text ||
        prevT.done !== t.done ||
        prevT.tag !== t.tag ||
        prevT.priority !== t.priority ||
        prevT.due_date !== t.due_date ||
        prevT.notes !== t.notes;
      if (changed) {
        ops.push(() =>
          api.updateTask(goalId, t.id, {
            text: t.text,
            done: t.done,
            tag: t.tag,
            priority: t.priority,
            due_date: t.due_date ?? null,
            notes: t.notes,
          }),
        );
      }
    });

    for (const prevT of prevPh.tasks) {
      if (!nextTaskById.has(prevT.id)) ops.push(() => api.deleteTask(goalId, prevT.id));
    }
  });

  for (const prevPh of prevPhases) {
    if (!nextPhaseById.has(prevPh.id)) ops.push(() => api.deletePhase(goalId, prevPh.id));
  }

  // Sequential, not Promise.all: task/phase mutations on the same goal
  // race on the server's read-modify-write of the nested JSON response,
  // so overlapping requests can clobber each other's result.
  let result = null;
  for (const op of ops) {
    result = await op();
  }
  return result;
}
