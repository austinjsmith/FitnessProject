"use strict";

// const http = require("http");
const express = require("express");
const Joi = require('joi');
const redis = require("redis");
const session = require("express-session");
const ejs = require('ejs');

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
app.set('view engine','ejs');


const {client_model} = require("./Models/ClientModel");
const {trainer_model} = require("./Models/TrainerModel")

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

    const name = req.query;
    console.log(req.query);
    const {value, error} = schemas.getClients.validate(req.query, VALIDATION_OPTIONS);

    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    else {
        const client_name = value.client_name;
        
        if (client_name == "Show all")
        {

            try{
                let clients = client_model.get_all_active_clients();
                res.render('FindActiveClient', {clients});
            } catch (err) {
                console.error(err);
                return err;
            }
        }
        else
        {
            try{
                let clients = client_model.get_active_client(client_name);
                res.render('FindActiveClient', {clients});
            } catch (err) {
                console.error(err);
                return err;
            }
        }
    }
});

// Search all clients
app.use(express.static(path.join(__dirname)))
app.get('/get_client', (req, res) => {
    const {value, error} = schemas.getClients.validate(req.query, VALIDATION_OPTIONS);

    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    else {
        const client_name = value.client_name;

        if (client_name == "Show all")
        {

            try{
                let clients = client_model.get_all_clients();
                console.log(clients);
                res.render('FindClient', {clients});
            } catch (err) {
                console.error(err);
                return err;
            }
        }
        else
        {
            try{
                let clients = client_model.get_client(client_name);
                console.log(clients);
                res.render('FindClient', {clients});
            } catch (err) {
                console.error(err);
                return err;
            }
        }
    }
});

app.use(express.static(path.join(__dirname)));
app.get('/get_trainer', (req, res) => {
    
    const {value, error} = schemas.getTrainers.validate(req.query, VALIDATION_OPTIONS);

    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    else{
        const trainer_name = value.trainer_name;
        if (trainer_name == "Show all")
        {

            try{
                let trainers = trainer_model.get_all_trainers();
                res.render('FindTrainers', {trainers});
            } catch (err) {
                console.error(err);
                return [];
            }
        }
        else
        {
            try{

                let trainers = trainer_model.get_trainer(trainer_name);
                res.render('FindTrainers', {trainers});
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
app.post('/addition/AddClient', (req, res) => {
    console.log("POST /clients");

    const {value, error} = schemas.addClients.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    let is_active = value.is_active.toLowerCase();

    if (is_active == 'yes'){
        is_active = 1;
    } else if (is_active == 'no'){
        is_active = 0;
    } else {
        return res.send("Incomplete/invalid entry");
    }
    try {
        const insert = client_model.add_client({
            name: value.name,
            is_active: value.is_active,
            height: value.height,
            weight: value.weight,
            address: value.address,
            location: value.location,
            diet: value.diet,
            plan: value.plan
        });

        if (insert === true)
            return res.redirect('../main.html');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

app.use(express.static(path.join(__dirname, "addition")));
app.post('/addition/AddTrainer', (req, res) => {
    console.log("POST /trainers");

    const {value, error} = schemas.addTrainers.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    try {
        const insert = trainer_model.add_trainer({
            name: value.name,
            license: value.license,
            address: value.address,
            location: value.location
        });

        if (insert === true)
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
    const {value, error} = schemas.deleteClients.validate(req.body, VALIDATION_OPTIONS);

    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    const name = value.name;
    console.log(name);

    try {
        client_model.delete_client(name);
        console.log("Done redirecting...");

        return res.redirect('../Search/FindClient.html');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

app.use(express.static(path.join(__dirname, "deletion")));
app.post('/delete_trainer', (req, res) => {
    console.log(req.body);
    const {value, error} = schemas.deleteTrainers.validate(req.body, VALIDATION_OPTIONS);

    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    const name = value.name;

    try {
        trainer_model.delete_trainer(name);
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
    // let {name, is_active, height, weight, address, location, diet, plan} = req.body;

    const {value, error} = schemas.updateClients.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    let name = value.name;
    let is_active = value.is_active.toLowerCase();
    let height = value.height;
    let weight = value.weight;
    let address = value.address;
    let location = value.location;
    let diet = value.diet;
    let plan = value.plan;

    try{
        if (name){
            if (is_active){
                if (is_active == 'yes'){
                    is_active = 1;
                } else if (is_active == 'no'){
                    is_active = 0;
                }

                client_model.update_is_active(name, is_active);
            }
            if (height){
                client_model.update_height(name, height);
            }
            if (weight){
                client_model.update_weight(name, weight);
            }
            if (address){
                client_model.update_address(name, address);
            }
            if (location){
                client_model.update_location(name, location);
            }
            if (diet){
                client_model.update_diet(name, diet);
            }
            if (plan){
                client_model.update_plan(name, plan);
            }
            return res.redirect('../main.html');
        }
    } catch(err) {
        res.sendStatus(500);
        console.log(err);
        return [];
    }
});

app.use(express.static(path.join(__dirname, "update")));
app.post('/update_trainer', (req, res) => {
    // let {name, is_active, height, weight, address, location, diet, plan} = req.body;

    const {value, error} = schemas.updateTrainers.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    let name = value.name;
    let license = value.license;
    let address = value.address;
    let location = value.location;

    try{
        if (name){
            if (license){
                trainer_model.update_license(name, license);
            }
            if (address){
                trainer_model.update_address(name, address);
            }
            if (location){
                trainer_model.update_location(name, location);
            }
            return res.redirect('../main.html');
        }
    } catch(err) {
        res.sendStatus(500);
        console.log(err);
        return [];
    }
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