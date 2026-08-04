-- GoldWing eFootball tournament schema
-- Format: group stage -> knockout, flexible grouping decided after registration closes.
-- No player accounts: people register with just a team name + X username.
-- Admin access is guarded by a single secret password (see ADMIN_PASSWORD in .env.local).
-- Tables are prefixed gw_ to avoid collisions in the shared Neon database.

-- TOURNAMENTS: one cup. Status drives which phase the UI/admin actions allow.
CREATE TABLE IF NOT EXISTS gw_tournaments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  prize_pool        TEXT,                       -- free text, e.g. "$100", "50 USDC + trophy"
  registration_deadline TIMESTAMPTZ,            -- when registration closes (drives the countdown)
  status            TEXT NOT NULL DEFAULT 'registration'
                      CHECK (status IN ('draft','registration','groups','knockout','completed')),
  points_win        INTEGER NOT NULL DEFAULT 3,
  points_draw       INTEGER NOT NULL DEFAULT 1,
  points_loss       INTEGER NOT NULL DEFAULT 0,
  advance_per_group INTEGER NOT NULL DEFAULT 2,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to existing databases (safe to run repeatedly).
ALTER TABLE gw_tournaments ADD COLUMN IF NOT EXISTS prize_pool TEXT;
ALTER TABLE gw_tournaments ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;

-- GROUPS: created when admin draws groups after registration closes (e.g. Group A).
CREATE TABLE IF NOT EXISTS gw_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES gw_tournaments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, name)
);

-- REGISTRATIONS: a participant entering a tournament. This IS the player record now.
-- Admin approves; group_id set at draw time. One X username per tournament.
CREATE TABLE IF NOT EXISTS gw_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES gw_tournaments(id) ON DELETE CASCADE,
  team_name     TEXT NOT NULL,
  x_username    TEXT NOT NULL,             -- e.g. @web3mami
  efootball_id  TEXT,                       -- optional in-game ID so opponents can add each other
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected')),
  group_id      UUID REFERENCES gw_groups(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, x_username)
);

-- MATCHES: both group games and knockout ties. Players reference registrations.
-- Rows created when groups/brackets are generated.
CREATE TABLE IF NOT EXISTS gw_matches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES gw_tournaments(id) ON DELETE CASCADE,
  stage         TEXT NOT NULL CHECK (stage IN ('group','knockout')),
  group_id      UUID REFERENCES gw_groups(id) ON DELETE CASCADE,        -- set for group games
  round         INTEGER,                                                -- knockout round: 1=first, ... final=highest
  slot          INTEGER,                                                -- position of the tie within its round
  player1_id    UUID REFERENCES gw_registrations(id) ON DELETE SET NULL,-- null = bye / not decided yet
  player2_id    UUID REFERENCES gw_registrations(id) ON DELETE SET NULL,
  player1_score INTEGER,
  player2_score INTEGER,
  winner_id     UUID REFERENCES gw_registrations(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reported','verified')),
  next_match_id UUID REFERENCES gw_matches(id) ON DELETE SET NULL,      -- knockout: where the winner advances
  next_slot     INTEGER,                                                -- 1 or 2: which player slot in next_match
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gw_registrations_tournament ON gw_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_gw_matches_tournament ON gw_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_gw_matches_group ON gw_matches(group_id);
CREATE INDEX IF NOT EXISTS idx_gw_groups_tournament ON gw_groups(tournament_id);
