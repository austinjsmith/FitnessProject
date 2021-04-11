create table if not exists Meals (
    mealname TEXT, 
    maincalorie INTEGER ,  
    fats INTEGER, 
    carbs INTEGER, 
    proteins INTEGER
);

CREATE TABLE IF NOT EXISTS composition (
	weight	REAL,
	gender	TEXT,
	lean	REAL,
	activity	REAL,
	tdee	INTEGER DEFAULT 2000,
	goal	TEXT,
	userid	TEXT
);