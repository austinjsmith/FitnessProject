"use strict";

const Database = require('better-sqlite3')
const db = new Database('./Database/ArmorsOnly.db');

//Signak handlers to close the database when the code
//termiantes(whether successfully or due to a signal)
process.on('exit', () => db.close());
process.on('SIGHUP', () => db.exit(128 + 1));
process.on('SIGINT', () => db.exit(128 + 2));
process.on('SIGTERM', () => db.exit(128 + 15));

exports.db = db;

