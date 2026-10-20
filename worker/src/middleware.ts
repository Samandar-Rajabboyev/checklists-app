import type { Context, Next } from "hono";
import type { Env, SessionUser } from "./types";
import { getSessionUser } from "./auth";

export type AuthedContext = Context<{ Bindings: Env; Variables: { user: SessionUser } }>;

export async function requireAuth(c: AuthedContext, next: Next) {
  const user = await getSessionUser(c);
  if (!user) return c.json({ error: "unauthorized" }, 401);
  c.set("user", user);
  await next();
}
