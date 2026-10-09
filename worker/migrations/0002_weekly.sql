-- Weekly contest standings. Weeks start on Monday 00:00 UTC and are identified by
-- that Monday's date (YYYY-MM-DD).

-- Each player's best score on each board in each week.
CREATE TABLE weekly (
  player TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  board TEXT NOT NULL,
  week TEXT NOT NULL,
  score INTEGER NOT NULL,
  qsos INTEGER NOT NULL,
  mults INTEGER NOT NULL,
  top INTEGER NOT NULL,
  date INTEGER NOT NULL,
  PRIMARY KEY (player, board, week)
);
CREATE INDEX weekly_board ON weekly (week, board, score DESC, date);

-- How each player finished a closed week: their best place (1-5) across all boards.
-- Only top-5 finishes are kept; the weekly QSL cards count these rows.
CREATE TABLE week_results (
  week TEXT NOT NULL,
  player TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  place INTEGER NOT NULL,
  board TEXT NOT NULL,                 -- the board that gave the best place
  PRIMARY KEY (week, player)
);
CREATE INDEX week_results_player ON week_results (player);

-- Weeks whose results have been worked out.
CREATE TABLE settled_weeks (week TEXT PRIMARY KEY);
