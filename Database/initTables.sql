CREATE TABLE IF NOT EXISTS clients (
    name TEXT PRIMARY KEY,
    is_active INTEGER,
    height TEXT,
    weight TEXT,
    address TEXT,
    location TEXT,
    diet TEXT,
    plan TEXT
);

CREATE TABLE IF NOT EXISTS trainers (
    name TEXT PRIMARY KEY,
    license INTEGER,
    address TEXT,
    location TEXT
)