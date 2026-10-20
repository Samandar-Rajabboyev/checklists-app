// Thin fetch wrapper around the Workers API. Normalizes D1's row shape
// (done: 0/1, snake_case extras) back to the boolean/legacy-ish shape the
// existing UI components already expect, so the component layer doesn't
// need to change just because the storage layer did.

async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `request failed: ${res.status}`);
  }
  return res.json();
}

function normalizeTask(t) {
  return { ...t, done: !!t.done };
}
function normalizePhase(p) {
  return { ...p, tasks: (p.tasks || []).map(normalizeTask) };
}
export function normalizeGoal(g) {
  return {
    ...g,
    archived: g.status === "archived",
    // Summary rows from GET /goals carry no `phases` key at all (they ship
    // task_count/task_done_count instead) — leave it undefined rather than
    // defaulting to [], since getProgress() uses that distinction to pick
    // between walking the tree and reading the precomputed counts.
    ...(g.phases !== undefined && { phases: g.phases.map(normalizePhase) }),
    checkins: g.checkins || [],
  };
}

export const api = {
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  listGoals: async () => {
    const { goals } = await request("/goals");
    return goals.map(normalizeGoal);
  },
  getGoal: async (id) => {
    const { goal } = await request(`/goals/${id}`);
    return normalizeGoal(goal);
  },
  createGoal: async (data) => {
    const { goal } = await request("/goals", { method: "POST", body: JSON.stringify(data) });
    return normalizeGoal(goal);
  },
  updateGoal: async (id, patch) => {
    const { goal } = await request(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    return normalizeGoal(goal);
  },
  deleteGoal: (id) => request(`/goals/${id}`, { method: "DELETE" }),

  addPhase: async (goalId, data) => {
    const { goal } = await request(`/goals/${goalId}/phases`, { method: "POST", body: JSON.stringify(data) });
    return normalizeGoal(goal);
  },
  updatePhase: async (goalId, phaseId, patch) => {
    const { goal } = await request(`/goals/${goalId}/phases/${phaseId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return normalizeGoal(goal);
  },
  deletePhase: async (goalId, phaseId) => {
    const { goal } = await request(`/goals/${goalId}/phases/${phaseId}`, { method: "DELETE" });
    return normalizeGoal(goal);
  },

  addTask: async (goalId, phaseId, data) => {
    const { goal } = await request(`/goals/${goalId}/phases/${phaseId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeGoal(goal);
  },
  updateTask: async (goalId, taskId, patch) => {
    const { goal } = await request(`/goals/${goalId}/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    return normalizeGoal(goal);
  },
  deleteTask: async (goalId, taskId) => {
    const { goal } = await request(`/goals/${goalId}/tasks/${taskId}`, { method: "DELETE" });
    return normalizeGoal(goal);
  },

  addCheckin: async (goalId, note) => {
    const { goal } = await request(`/goals/${goalId}/checkins`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
    return normalizeGoal(goal);
  },
  deleteCheckin: async (goalId, checkinId) => {
    const { goal } = await request(`/goals/${goalId}/checkins/${checkinId}`, { method: "DELETE" });
    return normalizeGoal(goal);
  },

  importLegacy: (checklists) => request("/import", { method: "POST", body: JSON.stringify({ checklists }) }),
};
