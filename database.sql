DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS adjRegions;


CREATE TABLE users (
	userID SERIAL PRIMARY KEY,
	username VARCHAR(50),
	password VARCHAR(50)
);

CREATE TABLE regions (
	regionID SERIAL PRIMARY KEY,
	regionName VARCHAR(50),
	Continent VARCHAR(50)
);

CREATE TABLE games (
	gameID SERIAL PRIMARY KEY
	numPlayers integer,
	round integer,
	currentUsersTurn integer,
	startDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	endDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	winner VARCHAR(50),
	FOREIGN KEY (winner) REFERENCES users(username)
);

CREATE TABLE region (
	regionID SERIAL PRIMARY KEY integer,
	controlledBy VARCHAR(50),
	armyCount integer,
	gameID SERIAL,
	FOREIGN KEY (controlledBy) REFERENCES users(username),
	FOREIGN KEY (gameID) REFERENCES games(gameID)
);

CREATE TABLE AdjRegions (
	regionID SERIAL PRIMARY KEY
	adjRegionID integer,
	adjRegionID2 integer,
	adjRegionID3 integer
);
