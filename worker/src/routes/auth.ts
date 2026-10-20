import { Hono } from "hono";
import type { Env, Provider } from "../types";
import {
  oauthAuthorizeUrl,
  exchangeCodeForProfile,
  findOrCreateUser,
  createSession,
  setSessionCookie,
  setStateCookie,
  readAndClearStateCookie,
  getSessionUser,
  destroySession,
} from "../auth";
import { randomToken } from "../id";

const auth = new Hono<{ Bindings: Env }>();

function isProvider(p: string): p is Provider {
  return p === "google" || p === "github";
}

// Specific paths must be registered before the dynamic "/:provider" segment,
// otherwise Hono matches "/me" and "/logout" as provider="me"/"logout".
auth.get("/me", async (c) => {
  const user = await getSessionUser(c);
  if (!user) return c.json({ user: null }, 200);
  return c.json({ user });
});

auth.post("/logout", async (c) => {
  await destroySession(c);
  return c.json({ ok: true });
});

auth.get("/callback/:provider", async (c) => {
  const provider = c.req.param("provider");
  if (!isProvider(provider)) return c.json({ error: "unknown provider" }, 404);

  const code = c.req.query("code");
  const state = c.req.query("state");
  const expectedState = readAndClearStateCookie(c);
  if (!code || !state || !expectedState || state !== expectedState) {
    return c.json({ error: "invalid oauth state" }, 400);
  }

  try {
    const profile = await exchangeCodeForProfile(provider, code, c.env);
    const user = await findOrCreateUser(provider, profile, c.env);
    const token = await createSession(user.id, c.env);
    setSessionCookie(c, token);
  } catch (err) {
    return c.json({ error: "oauth exchange failed", detail: String(err) }, 502);
  }

  return c.redirect(`${c.env.PUBLIC_URL}/`);
});

auth.get("/:provider", (c) => {
  const provider = c.req.param("provider");
  if (!isProvider(provider)) return c.json({ error: "unknown provider" }, 404);
  const state = randomToken();
  setStateCookie(c, state);
  return c.redirect(oauthAuthorizeUrl(provider, c.env, state));
});

export default auth;
