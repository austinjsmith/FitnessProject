CREATE TABLE IF NOT EXISTS Meals (
    mealname TEXT REQUIRED, 
    maincalorie INTEGER REQUIRED,  
    fats INTEGER, 
    carbs INTEGER, 
    proteins INTEGER
);

CREATE TABLE IF NOT EXISTS Composition (
	weight	REAL,
	gender	TEXT,
	lean	REAL,
	activity	REAL,
	tdee	INTEGER DEFAULT 2000,
	goal	TEXT,
	userid	TEXT
);

CREATE TABLE IF NOT EXISTS Meals (
	mealname TEXT,
	maincalorie INTEGER,
	fats INTEGER,
	carbs INTEGER,
	protein INTEGER
);

CREATE TABLE IF NOT EXISTS Comments (
	postid TEXT,
	userid TEXT,
	commentTEXT TEXT,
	CreatedOn TEXT
	username TEXT
);

CREATE TABLE IF NOT EXISTS Posts (
	postid TEXT, 
	userid TEXT,
	postText TEXT,
	createdOn TEXT,
	title TEXT
);