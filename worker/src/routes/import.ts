import { Hono } from "hono";
import type { Env, SessionUser } from "../types";
import { requireAuth } from "../middleware";
import { newId } from "../id";

type Vars = { user: SessionUser };
const importRoute = new Hono<{ Bindings: Env; Variables: Vars }>();
importRoute.use("*", requireAuth);

const PRIORITIES = ["none", "low", "medium", "high"] as const;

interface LegacyTask {
  id?: string;
  text?: string;
  tag?: string;
  done?: boolean;
}
interface LegacyPhase {
  id?: string;
  label?: string;
  title?: string;
  duration?: string;
  tasks?: LegacyTask[];
}
interface LegacyChecklist {
  emoji?: string;
  title?: string;
  description?: string;
  color?: string;
  total_days?: number;
  archived?: boolean;
  phases?: LegacyPhase[];
}

// One-time migration from the old localStorage-only client (checklists-v2 blob)
// into D1-backed goals/phases/tasks rows for the now-authenticated user.
importRoute.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);
  const checklists: LegacyChecklist[] = Array.isArray(body?.checklists) ? body.checklists : [];
  if (checklists.length === 0) return c.json({ error: "no checklists provided" }, 400);

  const ts = new Date().toISOString();
  let imported = 0;

  for (let gi = 0; gi < checklists.length; gi++) {
    const cl = checklists[gi];
    const title = String(cl.title ?? "").trim();
    if (!title) continue;

    const goalId = newId();
    await c.env.DB.prepare(
      `INSERT INTO goals (id, user_id, title, description, emoji, color, category, status, total_days, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'custom', ?, ?, ?, ?, ?)`,
    )
      .bind(
        goalId,
        user.id,
        title,
        cl.description ?? "",
        cl.emoji ?? "🎯",
        cl.color ?? "#D4522A",
        cl.archived ? "archived" : "active",
        cl.total_days ?? null,
        gi,
        ts,
        ts,
      )
      .run();

    const phases = Array.isArray(cl.phases) ? cl.phases : [];
    for (let pi = 0; pi < phases.length; pi++) {
      const ph = phases[pi];
      const phaseId = newId();
      await c.env.DB.prepare(
        `INSERT INTO phases (id, goal_id, label, title, duration, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      )
        .bind(phaseId, goalId, ph.label ?? `Phase ${pi}`, ph.title ?? "", ph.duration ?? "", pi)
        .run();

      const tasks = Array.isArray(ph.tasks) ? ph.tasks : [];
      for (let ti = 0; ti < tasks.length; ti++) {
        const t = tasks[ti];
        await c.env.DB.prepare(
          `INSERT INTO tasks (id, phase_id, text, tag, priority, done, completed_at, sort_order)
           VALUES (?, ?, ?, ?, 'none', ?, ?, ?)`,
        )
          .bind(newId(), phaseId, t.text ?? "", t.tag ?? "", t.done ? 1 : 0, t.done ? ts : null, ti)
          .run();
      }
    }
    imported++;
  }

  return c.json({ ok: true, imported });
});

export default importRoute;
