export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  PUBLIC_URL: string;
}

export type Provider = "google" | "github";

export interface SessionUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
}
