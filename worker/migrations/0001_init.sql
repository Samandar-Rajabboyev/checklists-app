-- Users authenticate via Google or GitHub OAuth only; no password storage.
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  provider_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY, -- random token, stored hashed in the cookie lookup
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  emoji TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#D4522A',
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('software', 'study', 'business', 'personal', 'custom')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'done', 'archived')),
  target_date TEXT,
  total_days INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_goals_user ON goals(user_id);

CREATE TABLE phases (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  title TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  target_date TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_phases_goal ON phases(goal_id);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  phase_id TEXT NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  tag TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'none' CHECK (priority IN ('none', 'low', 'medium', 'high')),
  due_date TEXT,
  done INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_tasks_phase ON tasks(phase_id);

CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX idx_checkins_goal ON checkins(goal_id);
