"use strict";

// const http = require("http");
const express = require("express");
const Joi = require('joi');
const redis = require("redis");
const session = require("express-session");

const app = express();
const path = require("path");
const {schemas, VALIDATION_OPTIONS} = require("./validators/allValidators")

// Don't forget to configure your environement file
require("dotenv").config();
const helmet = require("helmet");
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
	app.set('trust proxy', 1);
	app.use(helmet());
}

let RedisStore = require("connect-redis")(session)
let redisClient = redis.createClient();
const sessionConfig = {
	store: new RedisStore({ client: redisClient }),
	secret: process.env.COOKIE_SECRET,
	resave: false,
	saveUninitialized: false,
	name: "session",
	cookie: {
		sameSite: isProduction,
		secure: isProduction,
		httpOnly: true,
	    maxAge: process.env.MAX_AGE || 1000 * 60 * 60 * 8, // Defaults to 8 hours
	}
};

redisClient.on('error', function (err) {
    console.log("error" + err);
});

app.use(express.json());
app.use(express.urlencoded( {extended: false} ));
app.use(session(sessionConfig));

const PORT = 8000;

const Database = require('better-sqlite3');
const db = new Database('./Database/ClientTrainer.db');

const tablesInit = 'CREATE TABLE IF NOT EXISTS clients (name TEXT PRIMARY KEY, is_active INTEGER, height TEXT, weight TEXT, address TEXT, location TEXT, diet TEXT, plan TEXT); CREATE TABLE IF NOT EXISTS trainers (name TEXT PRIMARY KEY, license, address TEXT, location TEXT)';
db.exec(tablesInit);


app.use(express.static(path.join(__dirname, "public"), {
    extensions: ['html'],
}));

app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/main.html'));
});

/*
*   SEARCH IMPLEMENTATIONS BELOW
*/
// Search active clients
app.use(express.static(path.join(__dirname)))
app.get('/get_active_clients', (req, res) => {
    console.log("Trying to retrieve active client(s) info from DB");
    // if (err) throw err;

    const name = req.query;
    console.log(req.query);
    const {error, result} = schemas.getClients.validate(req.query, VALIDATION_OPTIONS);

    if (error) {
        console.log(error.details);
        return res.status(400);
    }
    else {
        const client_name = name.client_name;
        if (client_name == "Show all")
        {

            try{
                const sql = 'SELECT * FROM clients WHERE is_active = 1';
                console.log("Showing all");
                
                let client = db.prepare(sql).all();
                console.log(client);
                if (client.length > 0){
                    var table = '<table border = "1"><tr><th>Name</th><th>Height</th><th>Weight</th><th>Address</th><th>Location</th><th>Diet</th><th>Plan</th></tr>';

                    // create table
                    for (let i = 0; i < client.length; ++i){
                        table +='</td><td>' 
                        + client[i].name + '</td><td>' 
                        + client[i].height + '</td><td>' 
                        + client[i].weight + '</td><td>' 
                        + client[i].address + '</td><td>' 
                        + client[i].location + '</td><td>' 
                        + client[i].diet + '</td><td>' 
                        + client[i].plan + '</td></tr>';
                    }
                    return res.send(table);
                }
                else
                    res.sendStatus(404);
            } catch (err) {
                console.error(err);
                return [];
            }
        }
        else
        {
            try{
                const sql = 'SELECT * FROM clients WHERE name = @client_name AND is_active = 1';

                let client = db.prepare(sql).all({client_name});
                console.log(client);
                if (client.length > 0){
                    var table = '<table border = "1"><tr><th>Name</th><th>Height</th><th>Weight</th><th>Address</th><th>Location</th><th>Diet</th><th>Plan</th></tr>';

                    // create table
                    for (let i = 0; i < client.length; ++i){
                        table +='</td><td>' 
                        + client[i].name + '</td><td>' 
                        + client[i].height + '</td><td>' 
                        + client[i].weight + '</td><td>' 
                        + client[i].address + '</td><td>' 
                        + client[i].location + '</td><td>' 
                        + client[i].diet + '</td><td>' 
                        + client[i].plan + '</td></tr>';
                    }
                    return res.send(table);
                }
                else
                    res.sendStatus(404);
                // stmt.run(name);
            } catch (err) {
                console.error(err);
                return [];
            }
        }
    }
});

// Search all clients
app.use(express.static(path.join(__dirname)))
app.get('/get_client', (req, res) => {
    console.log("Trying to retrieve client(s) info from DB");

    const name = req.query;
    console.log(req.query);
    const {error, result} = schemas.getClients.validate(req.query, VALIDATION_OPTIONS);

    if (error) {
        console.log(error.details);
        return res.status(400);
    }
    else {
        console.log('name: ' + name.client_name);
        const client_name = name.client_name;
        
        if (client_name == "Show all")
        {

            try{
                const sql = 'SELECT * FROM clients';
                console.log("Showing all");
                
                let client = db.prepare(sql).all();
                console.log(client);
                if (client.length > 0){
                    var table = '<table border = "1"><tr><th>Name</th><th>Height</th><th>Weight</th><th>Health</th><th>Location</th><th>Diet</th><th>Plan</th></tr>';

                    // create table
                    for (let i = 0; i < client.length; ++i){
                        table +='</td><td>' 
                        + client[i].name + '</td><td>' 
                        + client[i].height + '</td><td>' 
                        + client[i].weight + '</td><td>' 
                        + client[i].address + '</td><td>' 
                        + client[i].location + '</td><td>' 
                        + client[i].diet + '</td><td>' 
                        + client[i].plan + '</td></tr>';
                    }
                    return res.send(table);
                }
                else
                    return res.sendStatus(404);
            } catch (err) {
                console.error(err);
                return err;
            }
        }
        else
        {
            try{
                const sql = 'SELECT * FROM clients WHERE name = @client_name';

                let client = db.prepare(sql).all({client_name});
                console.log(client);
                if (client.length > 0){
                    var table = '<table border = "1"><tr><th>Name</th><th>Height</th><th>Weight</th><th>Health</th><th>Location</th><th>Diet</th><th>Plan</th></tr>';

                    // create table
                    for (let i = 0; i < client.length; ++i){
                        table +='</td><td>' 
                        + client[i].name + '</td><td>' 
                        + client[i].height + '</td><td>' 
                        + client[i].weight + '</td><td>' 
                        + client[i].address + '</td><td>' 
                        + client[i].location + '</td><td>' 
                        + client[i].diet + '</td><td>' 
                        + client[i].plan + '</td></tr>';
                    }
                    return res.send(table);
                }
                else
                    return res.sendStatus(404);
                // stmt.run(name);
            } catch (err) {
                console.error(err);
                return err;
            }
        }
    }
});

app.use(express.static(path.join(__dirname)));
app.get('/get_trainer', (req, res) => {
    console.log("Trying to retrieve trainer(s) info from DB");
    // if (err) throw err;

    // // let name = document.getElementById("client_name");
    let name = req.query;
    console.log(req.query);
    const {error, result} = schemas.getTrainers.validate(req.query, VALIDATION_OPTIONS);

    if (error) {
        console.log(error.details);
        return res.status(400);
    }
    else{
        const trainer_name = name.trainer_name;
        if (trainer_name == "Show all")
        {

            try{
                const sql = 'SELECT * FROM trainers';
                console.log("Showing all");
                
                let trainers = db.prepare(sql).all();
                console.log(trainers);
                if (trainers.length > 0){
                    var table = '<table border = "1"><tr><th>Name</th><th>License</th><th>Address</th><th>Location</th></tr>';

                    // create table
                    for (let i = 0; i < trainers.length; ++i){
                        table +='</td><td>' 
                        + trainers[i].name + '</td><td>' 
                        + trainers[i].license + '</td><td>' 
                        + trainers[i].address + '</td><td>' 
                        + trainers[i].location + '</td><tr>';
                    }
                    return res.send(table);
                }
                else
                    res.sendStatus(404);
            } catch (err) {
                console.error(err);
                return [];
            }
        }
        else
        {
            try{
                const sql = 'SELECT * FROM trainers WHERE name = @trainer_name';

                let trainers = db.prepare(sql).all({trainer_name});
                console.log(trainers);
                if (trainers.length > 0){
                    var table = '<table border = "1"><tr><th>Name</th><th>License</th><th>Address</th><th>Location</th></tr>';

                    // create table
                    for (let i = 0; i < trainers.length; ++i){
                        table +='</td><td>' 
                        + trainers[i].name + '</td><td>' 
                        + trainers[i].license + '</td><td>' 
                        + trainers[i].address + '</td><td>' 
                        + trainers[i].location + '</td><tr>';
                    }
                    return res.send(table);
                }
                else
                    res.sendStatus(404);
                // stmt.run(name);
            } catch (err) {
                console.error(err);
                return [];
            }
        }
    }
});

/*
 *  ADDITION IMPLEMENTATION BELOW
 */
app.use(express.static(path.join(__dirname, "addition")));
app.post('/addition/AddClient.html', (req, res) => {
    console.log("POST /clients");

    let {name, is_active, height, weight, address, location, diet, plan} = req.body;
    console.log(req.body);
    const {error, result} = schemas.addClients.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        console.log(error.details);
        return res.sendStatus(400);
    }

    if (is_active == 'yes'){
        is_active = 1;
    } else if (is_active == 'no'){
        is_active = 0;
    } else {
        return res.send("Incomplete/invalid entry");
    }
    console.log('is_active: ' + is_active);

    try {
        const sql = 'INSERT INTO clients (name, is_active, height, weight, address, location, diet, plan) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const stmt = db.prepare(sql);
        stmt.run(name, is_active, height, weight, address, location, diet, plan);

        return res.redirect('../main.html');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }

});
app.use(express.static(path.join(__dirname, "addition")));
app.post('/addition/AddTrainer.html', (req, res) => {
    console.log("POST /trainers");

    let {name, license, address, location} = req.body;
    console.log(req.body);
    const {error, result} = schemas.addTrainers.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        console.log(error.details);
        return res.sendStatus(400);
    }
    try {
        const sql = 'INSERT INTO trainers (name, license, address, location) VALUES (?, ?, ?, ?)';
        const stmt = db.prepare(sql);
        stmt.run(name, license, address, location);

        return res.redirect('../main.html');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

/*
 * DELETION IMPLEMENTATIONS BELOW
 */
app.use(express.static(path.join(__dirname, "deletion")));
app.post('/delete_client', (req, res) => {
    // let name = req.body.delete_client_name;
    console.log(req.body);
    const {error, result} = schemas.deleteClients.validate(req.body, VALIDATION_OPTIONS);

    if (error) {
        console.log(error.details);
        return res.status(400);
    }
    const name = req.body.client_name;
    console.log("Deleting " + name);

    try {
        const sql = 'DELETE FROM clients WHERE name = @name';
        db.prepare(sql).run({name});

        return res.redirect('../main.html');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

app.use(express.static(path.join(__dirname, "deletion")));
app.post('/delete_trainer', (req, res) => {
    console.log(req.body);
    const {error, result} = schemas.deleteTrainers.validate(req.body, VALIDATION_OPTIONS);

    if (error) {
        console.log(error.details);
        return res.status(400);
    }
    const name = req.body.trainer_name;
    console.log("Deleting " + name);

    try {
        const sql = 'DELETE FROM trainers WHERE name = @name';
        db.prepare(sql).run({name});

        return res.redirect('../main.html');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

/*
 * UPDATE IMPLEMENTATIONS BELOW
 */
app.use(express.static(path.join(__dirname, "update")));
app.post('/update_client', (req, res) => {
    let {name, is_active, height, weight, address, location, diet, plan} = req.body;
    console.log(req.body);
});
app.listen(process.env.PORT, () => {
	// Colorize output with ANSI escape codes
	// https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
	const BLUE = "\u001b[34;1m";
	const GREEN = "\u001b[32;1m";
	const RESET = "\u001b[0m";
	
	// Default to development mode
	let mode = process.env.NODE_ENV || "development";
	// Then add some color
	const color = isProduction ? GREEN : BLUE;
	mode = `${color}${mode}${RESET}`;
	
	console.log(`Server is listenting on http://localhost:${process.env.PORT} in ${mode} mode`);
});