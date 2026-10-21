export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  PUBLIC_URL: string;
  // Set to "1" in .dev.vars only. Enables GET /api/auth/dev (localhost only).
  DEV_LOGIN?: string;
}

export type Provider = "google" | "github";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}
