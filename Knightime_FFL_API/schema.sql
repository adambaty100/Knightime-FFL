CREATE TABLE IF NOT EXISTS League_Members (
    id INTEGER NOT NULL UNIQUE PRIMARY KEY AUTOINCREMENT,
    league_member TEXT NOT NULL,
    experience INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Game_Data (
    league_member_id INTEGER,
    points_for INTEGER,
    points_against INTEGER,
    win_loss_tie TEXT,
    opponent_id INTEGER,
    year INTEGER,
    week TEXT,
    FOREIGN KEY (league_member_id) REFERENCES League_Members (id),
    FOREIGN KEY (opponent_id) REFERENCES League_Members (id)
);

CREATE TABLE IF NOT EXISTS Transactions (
    league_member_id INTEGER,
    trades INTEGER,
    acquisitions INTEGER,
    drops INTEGER,
    activations INTEGER,
    ir INTEGER,
    year INTEGER,
    FOREIGN KEY (league_member_id) REFERENCES League_Members (id)
);

CREATE TABLE IF NOT EXISTS Team_Data (
    year INTEGER,
    league_member_id INTEGER,
    team_name TEXT,
    FOREIGN KEY (league_member_id) REFERENCES League_Members (id)
);

CREATE TABLE IF NOT EXISTS Champions (
    league_member_id INTEGER,
    year INTEGER,
    FOREIGN KEY (league_member_id) REFERENCES League_Members (id)
);
