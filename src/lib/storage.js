import { SCHEMES } from "../constants.js";

// ──── localStorage wrapper ──────────────────────────────────────────────────

export const ls = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

// Client-generated ids are sent to the API on create (see worker/src/id.ts
// pickId), so they must be globally unique — not just unique per session.
export const uid = () => crypto.randomUUID();

export const loadMode = () => {
  const m = ls.get("uimode");
  return ["classic", "plain"].includes(m) ? m : "classic";
};
export const saveMode = (m) => ls.set("uimode", m);

export const loadData = () => {
  try {
    const r = ls.get("checklists-v2");
    if (r) return JSON.parse(r);
    const v1 = ls.get("checklists-v1");
    if (v1) return JSON.parse(v1);
  } catch {}
  return [];
};
export const saveData = (d) => ls.set("checklists-v2", JSON.stringify(d));

export const loadView = () => {
  const v = ls.get("view");
  return ["grid", "list", "compact"].includes(v) ? v : "grid";
};
export const saveView = (v) => ls.set("view", v);

export const loadScheme = () => {
  const id = ls.get("scheme");
  return SCHEMES.find((s) => s.id === id) || SCHEMES[0];
};
export const saveScheme = (s) => ls.set("scheme", s.id);

export const getProgress = (cl) => {
  // Home-list rows come from the API's summary endpoint, which carries
  // precomputed task_count/task_done_count instead of a full phases tree
  // (that tree is fetched separately, only for the detail view).
  if (!cl.phases) {
    return { done: cl.task_done_count ?? 0, total: cl.task_count ?? 0 };
  }
  let done = 0,
    total = 0;
  for (const ph of cl.phases)
    for (const t of ph.tasks) {
      total++;
      if (t.done) done++;
    }
  return { done, total };
};
