import { Hono, type Context } from "hono";
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

function authError(c: Context, reason: string) {
  return c.redirect(`${c.env.PUBLIC_URL}/?auth_error=${reason}`);
}

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
  // Failures land back on the SPA with ?auth_error=… so the login screen
  // can show a message instead of the user staring at raw JSON.
  if (c.req.query("error")) return authError(c, "cancelled");
  if (!code || !state || !expectedState || state !== expectedState) {
    return authError(c, "state");
  }

  try {
    const profile = await exchangeCodeForProfile(provider, code, c.env);
    const user = await findOrCreateUser(provider, profile, c.env);
    const token = await createSession(user.id, c.env);
    setSessionCookie(c, token);
  } catch (err) {
    console.error("oauth exchange failed", err);
    return authError(c, "exchange");
  }

  return c.redirect(`${c.env.PUBLIC_URL}/`);
});

// Local-only shortcut so the app can be exercised without real OAuth
// credentials. Requires DEV_LOGIN=1 *and* a localhost PUBLIC_URL, both set
// only in .dev.vars. (The request URL can't be used for this: wrangler dev
// rewrites it to the production route's hostname.)
auth.get("/dev", async (c) => {
  const host = new URL(c.env.PUBLIC_URL).hostname;
  if (c.env.DEV_LOGIN !== "1" || (host !== "localhost" && host !== "127.0.0.1")) {
    return c.json({ error: "not found" }, 404);
  }
  const user = await findOrCreateUser(
    "github",
    { providerUserId: "dev-user", email: "dev@localhost", name: "Dev User", avatarUrl: null },
    c.env,
  );
  setSessionCookie(c, await createSession(user.id, c.env));
  return c.redirect("/");
});

auth.get("/:provider", (c) => {
  const provider = c.req.param("provider");
  if (!isProvider(provider)) return c.json({ error: "unknown provider" }, 404);
  const state = randomToken();
  setStateCookie(c, state);
  return c.redirect(oauthAuthorizeUrl(provider, c.env, state));
});

export default auth;
