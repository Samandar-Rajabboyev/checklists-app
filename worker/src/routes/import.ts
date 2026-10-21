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
  notes?: string;
  priority?: string;
  due_date?: string | null;
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
  status?: string;
  category?: string;
  target_date?: string | null;
  phases?: LegacyPhase[];
}

const CATEGORIES = ["software", "study", "business", "personal", "custom"];

// Imports goals into the signed-in account: used both for the one-time
// migration of the old localStorage-only client (checklists-v2 blob) and
// for the "Import JSON" button, which accepts files from "Export". Always
// mints fresh ids so importing the same file twice yields two copies
// rather than a primary-key conflict.
importRoute.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);
  const checklists: LegacyChecklist[] = Array.isArray(body?.checklists) ? body.checklists : [];
  if (checklists.length === 0) return c.json({ error: "no checklists provided" }, 400);

  const ts = new Date().toISOString();
  let imported = 0;

  const stmts: D1PreparedStatement[] = [];
  for (let gi = 0; gi < checklists.length; gi++) {
    const cl = checklists[gi];
    const title = String(cl.title ?? "").trim();
    if (!title) continue;

    const archived = cl.archived || cl.status === "archived";
    const goalId = newId();
    stmts.push(
      c.env.DB.prepare(
        `INSERT INTO goals (id, user_id, title, description, emoji, color, category, status, target_date, total_days, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        goalId,
        user.id,
        title,
        cl.description ?? "",
        cl.emoji ?? "🎯",
        cl.color ?? "#D4522A",
        CATEGORIES.includes(cl.category ?? "") ? cl.category : "custom",
        archived ? "archived" : "active",
        cl.target_date ?? null,
        cl.total_days ?? null,
        gi,
        ts,
        ts,
      ),
    );

    const phases = Array.isArray(cl.phases) ? cl.phases : [];
    for (let pi = 0; pi < phases.length; pi++) {
      const ph = phases[pi];
      const phaseId = newId();
      stmts.push(
        c.env.DB.prepare(
          `INSERT INTO phases (id, goal_id, label, title, duration, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
        ).bind(phaseId, goalId, ph.label ?? `Phase ${pi}`, ph.title ?? "", ph.duration ?? "", pi),
      );

      const tasks = Array.isArray(ph.tasks) ? ph.tasks : [];
      for (let ti = 0; ti < tasks.length; ti++) {
        const t = tasks[ti];
        stmts.push(
          c.env.DB.prepare(
            `INSERT INTO tasks (id, phase_id, text, tag, notes, priority, due_date, done, completed_at, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).bind(
            newId(),
            phaseId,
            t.text ?? "",
            t.tag ?? "",
            t.notes ?? "",
            PRIORITIES.includes(t.priority as (typeof PRIORITIES)[number]) ? t.priority : "none",
            t.due_date || null,
            t.done ? 1 : 0,
            t.done ? ts : null,
            ti,
          ),
        );
      }
    }
    imported++;
  }
  if (stmts.length > 0) await c.env.DB.batch(stmts);

  return c.json({ ok: true, imported });
});

export default importRoute;
