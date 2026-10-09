-- Leaderboard players and their best contest scores. No email, IP address or
-- other personal details are stored: a player is a random public id, the
-- SHA-256 hash of a random secret kept on their device, and a nickname.
CREATE TABLE players (
  id TEXT PRIMARY KEY,                 -- public id, shown to tell entries apart
  secret_hash TEXT NOT NULL UNIQUE,    -- SHA-256 of the player code, hex
  name TEXT NOT NULL,
  created INTEGER NOT NULL,            -- ms since epoch
  last_submit INTEGER NOT NULL DEFAULT 0
);

-- One row per player and board: their best score on it.
CREATE TABLE scores (
  player TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  board TEXT NOT NULL,                 -- contest-1, contest-2, contest-5, contest-10
  score INTEGER NOT NULL,
  qsos INTEGER NOT NULL,
  mults INTEGER NOT NULL,
  top INTEGER NOT NULL,                -- fastest good QSO, WPM
  date INTEGER NOT NULL,
  PRIMARY KEY (player, board)
);
CREATE INDEX scores_board ON scores (board, score DESC, date);
