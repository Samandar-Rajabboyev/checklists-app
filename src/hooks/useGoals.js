import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api.js";
import { uid } from "../lib/storage.js";
import { syncGoal } from "../lib/diffSync.js";

// Goals state backed by the API. Every mutation goes through saveChecklist:
// it applies the new goal to local state immediately (so keyboard nav and
// drag feel instant), then — queued per goal so rapid-fire changes apply in
// order — diffs it against the last server-confirmed version and sends the
// minimal set of API calls. On failure the goal is re-fetched so the UI
// snaps back to what the server actually has.
export function useGoals() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [syncError, setSyncError] = useState(null);

  // Mirror of `checklists` for callbacks that must see the latest state
  // without being re-created on every change.
  const latest = useRef(checklists);
  latest.current = checklists;
  // goalId → last version the server confirmed (summary or full).
  const server = useRef(new Map());
  // goalId → tail of that goal's sync promise chain, plus a pending count
  // so only the last queued sync writes server state back into the UI.
  const queues = useRef(new Map());

  const replaceOne = useCallback((goal) => {
    setChecklists((prev) => prev.map((cl) => (cl.id === goal.id ? goal : cl)));
  }, []);

  const confirm = useCallback((goal) => {
    server.current.set(goal.id, goal);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const goals = await api.listGoals();
      server.current = new Map(goals.map((g) => [g.id, g]));
      setChecklists(goals);
      setLoadError(null);
    } catch (err) {
      setLoadError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const enqueue = useCallback(
    (goalId, task) => {
      const q = queues.current.get(goalId) || { tail: Promise.resolve(), pending: 0 };
      q.pending++;
      const run = q.tail.then(task);
      q.tail = run
        .then((saved) => {
          if (saved) confirm(saved);
          // Only the last queued sync may overwrite local state; earlier
          // responses would clobber edits made while they were in flight.
          if (--q.pending === 0 && saved) replaceOne(saved);
        })
        .catch(async (err) => {
          q.pending--;
          setSyncError(String(err.message || err));
          try {
            const fresh = await api.getGoal(goalId);
            confirm(fresh);
            replaceOne(fresh);
          } catch {
            // goal may have been deleted; leave state alone
          }
        });
      queues.current.set(goalId, q);
      // Never rejects: failures are reported via syncError and the resync
      // above, and most callers (keyboard edits) don't await this.
      return run.catch(() => null);
    },
    [confirm, replaceOne],
  );

  // Ensures the server baseline has a phases tree before diffing a goal
  // that does (the home list only loads summaries).
  const fullBaseline = useCallback(
    async (goalId) => {
      let base = server.current.get(goalId);
      if (!base?.phases) {
        base = await api.getGoal(goalId);
        confirm(base);
      }
      return base;
    },
    [confirm],
  );

  const saveChecklist = useCallback(
    (data) => {
      const current = latest.current.find((cl) => cl.id === data.id);
      // Callers may pass a partial goal (Modal omits archived/checkins…).
      const next = { ...current, ...data };
      replaceOne(next);
      return enqueue(next.id, async () => {
        const prev = next.phases ? await fullBaseline(next.id) : server.current.get(next.id);
        return syncGoal(prev, next);
      });
    },
    [enqueue, fullBaseline, replaceOne],
  );

  const createChecklist = useCallback(
    async (data) => {
      const goal = {
        ...data,
        id: data.id || uid(),
        archived: false,
        checkins: [],
        phases: data.phases || [],
      };
      setChecklists((prev) => [...prev, goal]);
      try {
        const created = await api.createGoal(goal);
        confirm(created);
        replaceOne(created);
        return created;
      } catch (err) {
        setChecklists((prev) => prev.filter((cl) => cl.id !== goal.id));
        setSyncError(String(err.message || err));
        throw err;
      }
    },
    [confirm, replaceOne],
  );

  const deleteChecklist = useCallback(async (id) => {
    setChecklists((prev) => prev.filter((cl) => cl.id !== id));
    server.current.delete(id);
    try {
      await api.deleteGoal(id);
    } catch (err) {
      setSyncError(String(err.message || err));
    }
  }, []);

  const archiveChecklist = useCallback(
    (id) => {
      const cl = latest.current.find((c) => c.id === id);
      if (!cl) return;
      return saveChecklist({ id, archived: !cl.archived });
    },
    [saveChecklist],
  );

  const importChecklists = useCallback(
    async (items) => {
      try {
        await api.importLegacy(items);
      } catch (err) {
        setSyncError(String(err.message || err));
        throw err;
      }
      await reload();
    },
    [reload],
  );

  // The list endpoint returns summaries only (no phases/tasks). Call this
  // when opening a goal so Detail/PlainContent get the full tree. Goes
  // through the queue so it can't overwrite edits still being synced.
  const selectChecklist = useCallback(
    (id) =>
      enqueue(id, async () => {
        const full = await api.getGoal(id);
        return full;
      }),
    [enqueue],
  );

  // Check-ins are their own resource; the response is the full goal.
  const addCheckin = useCallback(
    (goalId, note) => enqueue(goalId, () => api.addCheckin(goalId, note)),
    [enqueue],
  );
  const deleteCheckin = useCallback(
    (goalId, checkinId) => enqueue(goalId, () => api.deleteCheckin(goalId, checkinId)),
    [enqueue],
  );

  return {
    checklists,
    loading,
    loadError,
    syncError,
    clearSyncError: () => setSyncError(null),
    reload,
    createChecklist,
    updateChecklist: saveChecklist,
    changeChecklist: saveChecklist,
    deleteChecklist,
    archiveChecklist,
    importChecklists,
    selectChecklist,
    addCheckin,
    deleteCheckin,
  };
}
