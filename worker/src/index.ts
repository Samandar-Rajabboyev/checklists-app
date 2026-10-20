import { Hono } from "hono";
import type { Env } from "./types";
import authRoutes from "./routes/auth";
import goalsRoutes from "./routes/goals";
import importRoutes from "./routes/import";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/auth", authRoutes);
app.route("/api/goals", goalsRoutes);
app.route("/api/import", importRoutes);

app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) return c.json({ error: "not found" }, 404);
  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
