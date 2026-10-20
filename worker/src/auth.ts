import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Env, Provider, SessionUser } from "./types";
import { newId, randomToken } from "./id";

const SESSION_COOKIE = "session";
const SESSION_TTL_DAYS = 30;

// Oauth `state` cookie is short-lived and only guards the redirect round-trip.
const STATE_COOKIE = "oauth_state";
const STATE_TTL_MINUTES = 10;

export function oauthAuthorizeUrl(provider: Provider, env: Env, state: string) {
  const redirectUri = `${env.PUBLIC_URL}/api/auth/callback/${provider}`;
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

interface OAuthProfile {
  providerUserId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export async function exchangeCodeForProfile(
  provider: Provider,
  code: string,
  env: Env,
): Promise<OAuthProfile> {
  const redirectUri = `${env.PUBLIC_URL}/api/auth/callback/${provider}`;

  if (provider === "google") {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error(`google token exchange failed: ${await tokenRes.text()}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) throw new Error("google userinfo fetch failed");
    const u = (await userRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };
    return {
      providerUserId: u.sub,
      email: u.email ?? null,
      name: u.name ?? null,
      avatarUrl: u.picture ?? null,
    };
  }

  // github
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenRes.ok) throw new Error(`github token exchange failed: ${await tokenRes.text()}`);
  const tokenJson = (await tokenRes.json()) as { access_token?: string; error?: string };
  if (!tokenJson.access_token) throw new Error(`github token exchange error: ${tokenJson.error}`);

  const headers = {
    Authorization: `Bearer ${tokenJson.access_token}`,
    "User-Agent": "todo-app",
    Accept: "application/vnd.github+json",
  };
  const userRes = await fetch("https://api.github.com/user", { headers });
  if (!userRes.ok) throw new Error("github user fetch failed");
  const u = (await userRes.json()) as {
    id: number;
    login: string;
    name: string | null;
    avatar_url: string | null;
    email: string | null;
  };

  let email = u.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", { headers });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as { email: string; primary: boolean; verified: boolean }[];
      email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null;
    }
  }

  return {
    providerUserId: String(u.id),
    email,
    name: u.name ?? u.login,
    avatarUrl: u.avatar_url ?? null,
  };
}

export async function findOrCreateUser(
  provider: Provider,
  profile: OAuthProfile,
  env: Env,
): Promise<SessionUser> {
  const existing = await env.DB.prepare(
    "SELECT id, email, name, avatar_url FROM users WHERE provider = ? AND provider_user_id = ?",
  )
    .bind(provider, profile.providerUserId)
    .first<SessionUser>();
  if (existing) return existing;

  const id = newId();
  await env.DB.prepare(
    "INSERT INTO users (id, provider, provider_user_id, email, name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(id, provider, profile.providerUserId, profile.email, profile.name, profile.avatarUrl)
    .run();
  return { id, email: profile.email, name: profile.name, avatar_url: profile.avatarUrl };
}

export async function createSession(userId: string, env: Env): Promise<string> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, userId, expiresAt)
    .run();
  return token;
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

export function setStateCookie(c: Context, state: string) {
  setCookie(c, STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    maxAge: STATE_TTL_MINUTES * 60,
  });
}

export function readAndClearStateCookie(c: Context): string | undefined {
  const state = getCookie(c, STATE_COOKIE);
  deleteCookie(c, STATE_COOKIE, { path: "/" });
  return state;
}

export async function getSessionUser<E extends { Bindings: Env }>(
  c: Context<E>,
): Promise<SessionUser | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.avatar_url
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.expires_at > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
  )
    .bind(token)
    .first<SessionUser>();
  return row ?? null;
}

export async function destroySession(c: Context<{ Bindings: Env }>) {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  clearSessionCookie(c);
}
