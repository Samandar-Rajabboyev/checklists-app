import { Hono } from "hono";
import type { Env, SessionUser } from "../types";
import { requireAuth } from "../middleware";
import { newId } from "../id";

type Vars = { user: SessionUser };
const goals = new Hono<{ Bindings: Env; Variables: Vars }>();
goals.use("*", requireAuth);

const CATEGORIES = ["software", "study", "business", "personal", "custom"] as const;
const STATUSES = ["active", "paused", "done", "archived"] as const;
const PRIORITIES = ["none", "low", "medium", "high"] as const;

function nowIso() {
  return new Date().toISOString();
}

async function loadGoalFull(db: D1Database, goalId: string, userId: string) {
  const goal = await db
    .prepare("SELECT * FROM goals WHERE id = ? AND user_id = ?")
    .bind(goalId, userId)
    .first();
  if (!goal) return null;

  const phases = await db
    .prepare("SELECT * FROM phases WHERE goal_id = ? ORDER BY sort_order ASC")
    .bind(goalId)
    .all();

  const tasks = await db
    .prepare(
      `SELECT t.* FROM tasks t
       JOIN phases p ON p.id = t.phase_id
       WHERE p.goal_id = ?
       ORDER BY t.sort_order ASC`,
    )
    .bind(goalId)
    .all();

  const checkins = await db
    .prepare("SELECT * FROM checkins WHERE goal_id = ? ORDER BY created_at DESC")
    .bind(goalId)
    .all();

  const tasksByPhase = new Map<string, unknown[]>();
  for (const t of tasks.results as Record<string, unknown>[]) {
    const list = tasksByPhase.get(t.phase_id as string) ?? [];
    list.push(t);
    tasksByPhase.set(t.phase_id as string, list);
  }

  return {
    ...goal,
    phases: (phases.results as Record<string, unknown>[]).map((p) => ({
      ...p,
      tasks: tasksByPhase.get(p.id as string) ?? [],
    })),
    checkins: checkins.results,
  };
}

// List goals (summary only — no nested phases/tasks) for the dashboard/home view.
goals.get("/", async (c) => {
  const user = c.get("user");
  // Task counts are joined in rather than returning full nested phases/tasks
  // per goal — the home/dashboard list only needs aggregate progress, and
  // the detail view fetches the full tree separately via GET /goals/:id.
  const rows = await c.env.DB.prepare(
    `SELECT g.*,
            COUNT(t.id) AS agg_task_count,
            SUM(CASE WHEN t.done THEN 1 ELSE 0 END) AS agg_task_done_count
     FROM goals g
     LEFT JOIN phases p ON p.goal_id = g.id
     LEFT JOIN tasks t ON t.phase_id = p.id
     WHERE g.user_id = ?
     GROUP BY g.id
     ORDER BY g.sort_order ASC, g.created_at DESC`,
  )
    .bind(user.id)
    .all();

  const goalsOut = (rows.results as Record<string, unknown>[]).map((g) => {
    const { agg_task_count, agg_task_done_count, ...rest } = g;
    return {
      ...rest,
      task_count: Number(agg_task_count) || 0,
      task_done_count: Number(agg_task_done_count) || 0,
    };
  });

  return c.json({ goals: goalsOut });
});

goals.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  if (!title) return c.json({ error: "title is required" }, 400);

  const category = CATEGORIES.includes(body.category) ? body.category : "custom";
  const id = newId();
  const ts = nowIso();
  await c.env.DB.prepare(
    `INSERT INTO goals (id, user_id, title, description, emoji, color, category, target_date, total_days, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      user.id,
      title,
      body.description ?? "",
      body.emoji ?? "🎯",
      body.color ?? "#D4522A",
      category,
      body.target_date ?? null,
      body.total_days ?? null,
      ts,
      ts,
    )
    .run();

  // phases + tasks (optional, for template/modal-driven creation)
  const phases = Array.isArray(body.phases) ? body.phases : [];
  for (let pi = 0; pi < phases.length; pi++) {
    const ph = phases[pi];
    const phaseId = newId();
    await c.env.DB.prepare(
      `INSERT INTO phases (id, goal_id, label, title, duration, target_date, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(phaseId, id, ph.label ?? `Phase ${pi}`, ph.title ?? "", ph.duration ?? "", ph.target_date ?? null, pi)
      .run();

    const tasks = Array.isArray(ph.tasks) ? ph.tasks : [];
    for (let ti = 0; ti < tasks.length; ti++) {
      const t = tasks[ti];
      await c.env.DB.prepare(
        `INSERT INTO tasks (id, phase_id, text, tag, priority, due_date, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
        .bind(newId(), phaseId, t.text ?? "", t.tag ?? "", PRIORITIES.includes(t.priority) ? t.priority : "none", t.due_date ?? null, ti)
        .run();
    }
  }

  const full = await loadGoalFull(c.env.DB, id, user.id);
  return c.json({ goal: full }, 201);
});

goals.get("/:id", async (c) => {
  const user = c.get("user");
  const full = await loadGoalFull(c.env.DB, c.req.param("id"), user.id);
  if (!full) return c.json({ error: "not found" }, 404);
  return c.json({ goal: full });
});

goals.patch("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const existing = await c.env.DB.prepare("SELECT id FROM goals WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first();
  if (!existing) return c.json({ error: "not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const fields: string[] = [];
  const values: unknown[] = [];

  const setField = (col: string, val: unknown) => {
    fields.push(`${col} = ?`);
    values.push(val);
  };

  if (typeof body.title === "string") setField("title", body.title.trim());
  if (typeof body.description === "string") setField("description", body.description);
  if (typeof body.emoji === "string") setField("emoji", body.emoji);
  if (typeof body.color === "string") setField("color", body.color);
  if (CATEGORIES.includes(body.category)) setField("category", body.category);
  if (STATUSES.includes(body.status)) setField("status", body.status);
  if (body.target_date === null || typeof body.target_date === "string") setField("target_date", body.target_date);
  if (body.total_days === null || typeof body.total_days === "number") setField("total_days", body.total_days);
  if (typeof body.sort_order === "number") setField("sort_order", body.sort_order);

  if (fields.length === 0) return c.json({ error: "no valid fields" }, 400);
  setField("updated_at", nowIso());
  values.push(id, user.id);

  await c.env.DB.prepare(`UPDATE goals SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`)
    .bind(...values)
    .run();

  const full = await loadGoalFull(c.env.DB, id, user.id);
  return c.json({ goal: full });
});

goals.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare("DELETE FROM goals WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .run();
  if (result.meta.changes === 0) return c.json({ error: "not found" }, 404);
  return c.json({ ok: true });
});

// ─── Phases ──────────────────────────────────────────────────────────────

async function assertGoalOwned(db: D1Database, goalId: string, userId: string) {
  const row = await db.prepare("SELECT id FROM goals WHERE id = ? AND user_id = ?").bind(goalId, userId).first();
  return !!row;
}

goals.post("/:goalId/phases", async (c) => {
  const user = c.get("user");
  const goalId = c.req.param("goalId");
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const countRow = await c.env.DB.prepare("SELECT COUNT(*) as n FROM phases WHERE goal_id = ?")
    .bind(goalId)
    .first<{ n: number }>();
  const sortOrder = countRow?.n ?? 0;

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO phases (id, goal_id, label, title, duration, target_date, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, goalId, body.label ?? `Phase ${sortOrder}`, body.title ?? "", body.duration ?? "", body.target_date ?? null, sortOrder)
    .run();

  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full }, 201);
});

goals.patch("/:goalId/phases/:phaseId", async (c) => {
  const user = c.get("user");
  const { goalId, phaseId } = c.req.param();
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const fields: string[] = [];
  const values: unknown[] = [];
  const setField = (col: string, val: unknown) => {
    fields.push(`${col} = ?`);
    values.push(val);
  };
  if (typeof body.label === "string") setField("label", body.label);
  if (typeof body.title === "string") setField("title", body.title);
  if (typeof body.duration === "string") setField("duration", body.duration);
  if (body.target_date === null || typeof body.target_date === "string") setField("target_date", body.target_date);
  if (typeof body.sort_order === "number") setField("sort_order", body.sort_order);
  if (fields.length === 0) return c.json({ error: "no valid fields" }, 400);

  values.push(phaseId, goalId);
  await c.env.DB.prepare(`UPDATE phases SET ${fields.join(", ")} WHERE id = ? AND goal_id = ?`)
    .bind(...values)
    .run();

  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full });
});

goals.delete("/:goalId/phases/:phaseId", async (c) => {
  const user = c.get("user");
  const { goalId, phaseId } = c.req.param();
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  await c.env.DB.prepare("DELETE FROM phases WHERE id = ? AND goal_id = ?").bind(phaseId, goalId).run();
  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full });
});

// ─── Tasks ───────────────────────────────────────────────────────────────

async function assertPhaseOwned(db: D1Database, phaseId: string, goalId: string, userId: string) {
  const row = await db
    .prepare(
      `SELECT p.id FROM phases p JOIN goals g ON g.id = p.goal_id
       WHERE p.id = ? AND p.goal_id = ? AND g.user_id = ?`,
    )
    .bind(phaseId, goalId, userId)
    .first();
  return !!row;
}

goals.post("/:goalId/phases/:phaseId/tasks", async (c) => {
  const user = c.get("user");
  const { goalId, phaseId } = c.req.param();
  if (!(await assertPhaseOwned(c.env.DB, phaseId, goalId, user.id))) return c.json({ error: "not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const countRow = await c.env.DB.prepare("SELECT COUNT(*) as n FROM tasks WHERE phase_id = ?")
    .bind(phaseId)
    .first<{ n: number }>();
  const sortOrder = countRow?.n ?? 0;

  const id = newId();
  await c.env.DB.prepare(
    `INSERT INTO tasks (id, phase_id, text, tag, priority, due_date, notes, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      phaseId,
      body.text ?? "",
      body.tag ?? "",
      PRIORITIES.includes(body.priority) ? body.priority : "none",
      body.due_date ?? null,
      body.notes ?? "",
      sortOrder,
    )
    .run();

  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full }, 201);
});

goals.patch("/:goalId/tasks/:taskId", async (c) => {
  const user = c.get("user");
  const { goalId, taskId } = c.req.param();
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  const taskRow = await c.env.DB.prepare(
    `SELECT t.id FROM tasks t JOIN phases p ON p.id = t.phase_id WHERE t.id = ? AND p.goal_id = ?`,
  )
    .bind(taskId, goalId)
    .first();
  if (!taskRow) return c.json({ error: "not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const fields: string[] = [];
  const values: unknown[] = [];
  const setField = (col: string, val: unknown) => {
    fields.push(`${col} = ?`);
    values.push(val);
  };

  if (typeof body.text === "string") setField("text", body.text);
  if (typeof body.tag === "string") setField("tag", body.tag);
  if (typeof body.notes === "string") setField("notes", body.notes);
  if (PRIORITIES.includes(body.priority)) setField("priority", body.priority);
  if (body.due_date === null || typeof body.due_date === "string") setField("due_date", body.due_date);
  if (typeof body.sort_order === "number") setField("sort_order", body.sort_order);
  if (typeof body.done === "boolean") {
    setField("done", body.done ? 1 : 0);
    setField("completed_at", body.done ? nowIso() : null);
  }
  if (fields.length === 0) return c.json({ error: "no valid fields" }, 400);

  values.push(taskId);
  await c.env.DB.prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`)
    .bind(...values)
    .run();

  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full });
});

goals.delete("/:goalId/tasks/:taskId", async (c) => {
  const user = c.get("user");
  const { goalId, taskId } = c.req.param();
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  await c.env.DB.prepare(
    `DELETE FROM tasks WHERE id = ? AND phase_id IN (SELECT id FROM phases WHERE goal_id = ?)`,
  )
    .bind(taskId, goalId)
    .run();

  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full });
});

// ─── Check-ins ───────────────────────────────────────────────────────────

goals.post("/:goalId/checkins", async (c) => {
  const user = c.get("user");
  const goalId = c.req.param("goalId");
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const note = String(body.note ?? "").trim();
  if (!note) return c.json({ error: "note is required" }, 400);

  const id = newId();
  await c.env.DB.prepare("INSERT INTO checkins (id, goal_id, note) VALUES (?, ?, ?)").bind(id, goalId, note).run();

  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full }, 201);
});

goals.delete("/:goalId/checkins/:checkinId", async (c) => {
  const user = c.get("user");
  const { goalId, checkinId } = c.req.param();
  if (!(await assertGoalOwned(c.env.DB, goalId, user.id))) return c.json({ error: "not found" }, 404);

  await c.env.DB.prepare("DELETE FROM checkins WHERE id = ? AND goal_id = ?").bind(checkinId, goalId).run();
  const full = await loadGoalFull(c.env.DB, goalId, user.id);
  return c.json({ goal: full });
});

export default goals;
