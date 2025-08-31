CREATE TABLE IF NOT EXISTS species (
id TEXT PRIMARY KEY,
latin TEXT NOT NULL,
en_name TEXT NOT NULL,
ru_name TEXT NOT NULL,
family TEXT NOT NULL,
iucn_status TEXT,
range_geojson TEXT
);


CREATE TABLE IF NOT EXISTS rescue_centers (
id TEXT PRIMARY KEY,
name TEXT NOT NULL,
region TEXT NOT NULL,
country_code TEXT NOT NULL,
lat REAL NOT NULL,
lon REAL NOT NULL,
species_supported TEXT NOT NULL,
phone TEXT, email TEXT, site TEXT,
hours TEXT,
verified_at TEXT,
tags TEXT
);