CREATE TABLE IF NOT EXISTS Users (
    userID TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    gender TEXT,
    passwordHash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    didVerifyEmail BOOLEAN NOT NULL DEFAULT 0 -- defaults to unverified
);

CREATE TABLE IF NOT EXISTS PlayList (
    name TEXT UNIQUE NOT NULL,
);

CREATE TABLE IF NOT EXISTS videoFile(
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    gender TEXT
);