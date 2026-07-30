-- GoldWing eFootball tournament schema
-- Format: group stage -> knockout, flexible grouping decided after registration closes.
-- Tables are prefixed gw_ to avoid collisions in the shared Neon database.

-- USERS: accounts. role 'admin' can manage tournaments.
CREATE TABLE IF NOT EXISTS gw_users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  display_name        TEXT NOT NULL,
  efootball_username  TEXT NOT NULL,
  platform            TEXT NOT NULL DEFAULT 'mobile',
  role                TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TOURNAMENTS: one cup. Status drives which phase the UI/admin actions allow.
CREATE TABLE IF NOT EXISTS gw_tournaments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'registration'
                      CHECK (status IN ('draft','registration','groups','knockout','completed')),
  points_win        INTEGER NOT NULL DEFAULT 3,
  points_draw       INTEGER NOT NULL DEFAULT 1,
  points_loss       INTEGER NOT NULL DEFAULT 0,
  advance_per_group INTEGER NOT NULL DEFAULT 2,
  created_by        UUID REFERENCES gw_users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GROUPS: created when admin draws groups after registration closes (e.g. Group A).
CREATE TABLE IF NOT EXISTS gw_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES gw_tournaments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, name)
);

-- REGISTRATIONS: a user entering a tournament. Admin approves; group_id set at draw time.
CREATE TABLE IF NOT EXISTS gw_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES gw_tournaments(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES gw_users(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  group_id      UUID REFERENCES gw_groups(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, user_id)
);

-- MATCHES: both group games and knockout ties. Rows created when brackets/groups are generated.
CREATE TABLE IF NOT EXISTS gw_matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES gw_tournaments(id) ON DELETE CASCADE,
  stage         TEXT NOT NULL CHECK (stage IN ('group','knockout')),
  group_id      UUID REFERENCES gw_groups(id) ON DELETE CASCADE,   -- set for group games
  round         INTEGER,                                           -- knockout round: 1=first, ... final=highest
  slot          INTEGER,                                           -- position of the tie within its round
  player1_id    UUID REFERENCES gw_users(id) ON DELETE SET NULL,   -- null = bye / not decided yet
  player2_id    UUID REFERENCES gw_users(id) ON DELETE SET NULL,
  player1_score INTEGER,
  player2_score INTEGER,
  winner_id     UUID REFERENCES gw_users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reported','verified')),
  reported_by   UUID REFERENCES gw_users(id) ON DELETE SET NULL,
  next_match_id UUID REFERENCES gw_matches(id) ON DELETE SET NULL, -- knockout: where the winner advances
  next_slot     INTEGER,                                           -- 1 or 2: which player slot in next_match
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gw_registrations_tournament ON gw_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_gw_matches_tournament ON gw_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_gw_matches_group ON gw_matches(group_id);
CREATE INDEX IF NOT EXISTS idx_gw_groups_tournament ON gw_groups(tournament_id);
