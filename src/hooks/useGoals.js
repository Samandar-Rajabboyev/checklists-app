import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api.js";
import { uid } from "../lib/storage.js";
import { syncPhaseChanges } from "../lib/diffSync.js";

// Mirrors the old `checklists` state + `persist` callback from the
// localStorage era, but backed by the API. Mutations apply optimistically
// to local state immediately, then confirm/reconcile against the server
// response so the UI never has to wait on a round-trip to feel responsive.
export function useGoals() {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const goals = await api.listGoals();
      setChecklists(goals);
      setLoadError(null);
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const replaceOne = useCallback((goal) => {
    setChecklists((prev) => prev.map((cl) => (cl.id === goal.id ? goal : cl)));
  }, []);

  const createChecklist = useCallback(async (data) => {
    const optimisticId = uid();
    const optimistic = { ...data, id: optimisticId, archived: false, checkins: [] };
    setChecklists((prev) => [...prev, optimistic]);
    try {
      const created = await api.createGoal(data);
      setChecklists((prev) => prev.map((cl) => (cl.id === optimisticId ? created : cl)));
      return created;
    } catch (err) {
      setChecklists((prev) => prev.filter((cl) => cl.id !== optimisticId));
      throw err;
    }
  }, []);

  const updateChecklist = useCallback(
    async (data) => {
      const prev = checklists.find((cl) => cl.id === data.id);
      replaceOne(data);
      try {
        const saved = await api.updateGoal(data.id, data);
        replaceOne(saved);
        return saved;
      } catch (err) {
        if (prev) replaceOne(prev);
        throw err;
      }
    },
    [checklists, replaceOne],
  );

  // Detail/PlainContent call onChange(wholeChecklist) on every task toggle,
  // reorder, add, and delete. Apply it to local state immediately (so
  // keyboard nav / drag feel instant), then diff against what we last sent
  // the server and fire the minimal set of phase/task API calls. Queued
  // per-goal so rapid-fire changes (e.g. holding j/k + x) reconcile in
  // order instead of racing each other's read-modify-write.
  const syncQueue = useRef(new Map());
  const changeChecklist = useCallback(
    (updated) => {
      const prev = checklists.find((cl) => cl.id === updated.id);
      replaceOne(updated);

      const inFlight = syncQueue.current.get(updated.id) || Promise.resolve();
      const next = inFlight
        .then(() => syncPhaseChanges(updated.id, prev, updated))
        .then((saved) => {
          if (saved) replaceOne(saved);
        })
        .catch(() => {
          // Best-effort: a failed sync just means local state can drift
          // from the server until the next successful mutation reconciles.
        });
      syncQueue.current.set(updated.id, next);
    },
    [checklists, replaceOne],
  );

  const deleteChecklist = useCallback(async (id) => {
    setChecklists((prev) => prev.filter((cl) => cl.id !== id));
    await api.deleteGoal(id);
  }, []);

  const archiveChecklist = useCallback(
    async (id) => {
      const cl = checklists.find((c) => c.id === id);
      if (!cl) return;
      const nextStatus = cl.archived ? "active" : "archived";
      replaceOne({ ...cl, archived: !cl.archived });
      const saved = await api.updateGoal(id, { status: nextStatus });
      replaceOne(saved);
    },
    [checklists, replaceOne],
  );

  const importChecklists = useCallback(
    async (items) => {
      await api.importLegacy(items);
      await reload();
    },
    [reload],
  );

  // The list endpoint returns summaries only (no phases/tasks — see
  // normalizeGoal in lib/api.js). Call this when opening a goal's detail
  // view so Detail/PlainContent get the full phase/task tree they expect.
  const selectChecklist = useCallback(
    async (id) => {
      const full = await api.getGoal(id);
      replaceOne(full);
      return full;
    },
    [replaceOne],
  );

  return {
    checklists,
    loading,
    loadError,
    reload,
    createChecklist,
    updateChecklist,
    changeChecklist,
    deleteChecklist,
    archiveChecklist,
    importChecklists,
    selectChecklist,
    replaceOne,
  };
}
