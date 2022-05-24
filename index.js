"use strict";

//configure the envioronment file
require("dotenv").config();

//for server, set to production, otherwise, set to development
const isDevelopement = !process.env.NODE_ENV || process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

const express = require("express");
const Joi = require('joi');
const argon2 = require("argon2");
const app = express();
const path = require("path");
const redis = require("redis");
const session = require("express-session");
const ejs = require("ejs");
const helmet = require("helmet");
const calTdee = require ("./public/js/CalCountJS/calculate");
const {schemas, VALIDATION_OPTIONS} = require("./validators/allValidators");

if (isProduction) {
	app.set('trust proxy', 1);
	app.use(helmet());
}

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient();

app.set('view engine','ejs');

const sessionConfig = {
	store: new RedisStore({ client: redisClient }),
	secret: process.env.SECRET,
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

redisClient.on("error", function (err) {
    console.log("error" + err);
});

const {mealModel} = require("./Models/CalorieCounter/mealModel");
const {tdeeModel} = require("./Models/CalorieCounter/tdeeModel");
const {userModel} = require("./Models/CalorieCounter/userModel");
const {postModel} = require("./Models/CalorieCounter/postModel");
const {commentModel} = require("./Models/CalorieCounter/commentModel");
const {client_model} = require("./Models/ClientTrainer/clientModel");
const {trainer_model} = require("./Models/ClientTrainer/TrainerModel");

app.use(express.static(path.join(__dirname, "public"), {
    extensions: ['html'],
}));
app.use(express.json());
app.use(express.urlencoded ({extended: true}));
app.use(session(sessionConfig));

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

// app.get('/FindActiveClient', (req, res) =>{
//     res.render('FindActiveClient');
// });

app.post('/addition/AddClient', (req, res) => {
    console.log("POST /clients");

    console.log(req.body);
    const {value, error} = schemas.addClients.validate(req.body, VALIDATION_OPTIONS);
    if (error) {
        console.log(error.details);
        return res.sendStatus(400);
    }
    let is_active = req.body.is_active;

    if (is_active == "yes"){
        is_active = 1;
    } else if (is_active == "no"){
        is_active = 0;
    } else {
        return res.send("Incomplete/invalid entry");
    }
    console.log('is_active: ' + is_active);

    try {
        const insert = client_model.add_client({
            name: value.name,
            is_active: is_active,
            height: value.height,
            weight: value.weight,
            address: value.address,
            location: value.location,
            diet: value.diet,
            plan: value.plan
        });

        if (insert){
            return res.redirect('/ClientTrackerPages/main');
        }
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
    }

});

app.get("/login", (req, res) =>{
    const isLogged = req.session.isLoggedIn;
    const isAdmin = req.session.role;

    //if user is logged in, only allow log out
    if (isLogged === 1){
        res.redirect('/CalCountPages/logout');
    } else {
        //if user is not logged in, allow them to login only
        res.render('login', {isLogged, isAdmin});
    }   
});

app.get("/", (req, res) => {
    if (req.session.isLoggedIn){
        res.redirect('/index'); 
    } else {
        res.redirect('/login');
    }
    
})

//create a new account
app.post("/register", async (req, res) =>{
    console.log("POST /users");
    const {value, error} = schemas.postUsersSchema.validate(req.body, VALIDATION_OPTIONS);
    console.log(value);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        return res.status(400).json(errorMessages);
    }
    else {
        try {
            const passwordHash = await argon2.hash(value.password, {hashLength: 5});
            const userAdded = userModel.createUser({
                username: value.username, 
                passwordHash,
                email: value.email
            });
        
            if (userAdded) {
                return res.render('login'); // 200 OK
            } else { // something went wrong
                res.sendStatus(500); // 500 Internal Server Error
            }
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }

});

app.post("/login", async (req, res) => {
    const { value, error } = schemas.postLoginSchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        return res.status(400).json(errorMessages);
    }
    else {
        try {
            const email = value.email;
            const row = userModel.getPasswordHash(email); 
            const user = userModel.getUserDataEmail(email);
    
            if (!row) {
                return res.sendStatus(400);
            }
            const {passwordHash} = row;
            
            if ( await argon2.verify(passwordHash, value.password) ) {
                //res.redirect('index.html');
                req.session.regenerate(function(err) {
                    if (err){
                        console.log(err);
                        return res.sendStatus(500);
                    } else {
                        req.session.userID = user.userID;
                        req.session.email = user.email;
                        req.session.username = user.username;
                        req.session.isLoggedIn = 1;

                        if (email.includes(process.env.ADMIN) ){
                            req.session.role = 1;
                            res.redirect('/ClientTrackerPages/main');
                        } else {
                            return res.redirect('/index');
                        }
                    }
                });
            } else {
                return res.sendStatus(400);
            }
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }

});


app.post("/logout", async (req, res) => {
    if (req.session.isLoggedIn !== 1){
        return res.redirect('/login');
    } else {
        req.session.destroy(function(err) {
            //if fails to destory
            if (err){
                return res.sendStatus(500);
            } else {
                //logged out 
                console.log("logged out successfully");
                return res.redirect('/login');
            }
        })
    }
});


//adding a new meal for calories
app.post("/calories", (req, res) => {
    console.log("POST /calories");
    const {value, error} = schemas.postMealSchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        console.log(errorMessages);
        return res.status(400).json(errorMessages);
    } else {
        try {
            const add = mealModel.createMeal({
                mealname: value.mealname,
                maincalorie: value.maincalorie,
                fats: value.fats,
                carbs: value.carbs, 
                proteins: value.proteins,
                userid: req.session.userID
            });

            if (add === true){
                res.redirect('/meallog');
            }
                
        } catch (err){
            console.error(err);
            return res.sendStatus(500);
        }
    }
   
});

app.get("/index", (req,res) =>{
    try{
        const isAdmin = req.session.role;
        const isLogged = req.session.isLoggedIn;
        if(isLogged !==  1){
            res.redirect('/login');
        } else {
            res.render('index', {isAdmin});
        } 
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
    
});

app.get('/meallog', (req, res) => {
    let todaydate = new Date();
    let month = todaydate.getUTCMonth() + 1;
    let day = todaydate.getDate();
    let year = todaydate.getUTCFullYear();
    let todaysdate = `${year}/${month}/${day}`;
    let showDate = `${month}/${day}/${year}`;

    const meal2 = mealModel.getTodaysMeals(req.session.userID, todaysdate);
    const tdeeW = tdeeModel.getTDEE(req.session.userID);
    const loggedIn = req.session.isLoggedIn;
    const isAdmin = req.session.role;
    //if user is not logged in, send to the login page
    if (loggedIn !== 1){
        res.redirect('/login');
    } else {
        const isAdmin = req.session.role;
        res.render('meallog', {meal2, loggedIn, tdeeW, showDate, isAdmin});
    }
});

app.post("/counter", (req, res) =>{
    //set default user for testing
    console.log("POST /intake");
    const {value, error} = schemas.postTDEESchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        return res.status(400).json(errorMessages);
        
    } else {

        let height = req.body.height;
        let goal = req.body.goal;
        let gender = req.body.gender;
        let activity = req.body.activity;
        let weight = value.weight;
        let age = value.age;
       
        height = parseInt(height);
        weight = parseFloat(value.weight);
        age = parseInt(value.age);
        activity = parseFloat(activity);
        goal = parseInt(goal);

        try {
            let tdeeW = calTdee.calTdee(weight, gender, height, activity, goal, age);
            //if user has account
            if (req.session.isLoggedIn){
                const user = req.session.userID;
                const tdeenow = tdeeModel.getTDEE(user);
                
                //if user is defaulted, create tdee
                if (typeof tdeenow === 'undefined'){
                    const cal = tdeeModel.createTDEE({
                        weight, 
                        gender, 
                        height,
                        activity, 
                        age,
                        userid: user,
                        tdee: tdeeW,
                        goal: goal
                    });
                
                    if (cal){
                        res.redirect('tdee');
                    } else {
                        res.sendStatus(400);
                    }
                } else {
                    const update = tdeeModel.updateTDEE( tdeeW, user );
                    if (update){
                        res.redirect('tdee');
    
                    } else {
                        res.sendStatus(400);
                    }
                }
            }
            
        } catch (err) {
            console.log(error);
            res.sendStatus(500);
        }
    }  
});

app.get('/tdee', (req,res) => {
    const userid = req.session.userID;
    const isLogged = req.session.isLoggedIn;
    const isAdmin = req.session.role;
    let t, gen;
    try{
        //if user is not logged in, send to the login page
        if (req.session.isLoggedIn !== 1){
            return res.redirect('/login');
        } else if ( req.session.isLoggedIn === 1 ){
            t = tdeeModel.getTDEE(userid);
            res.render('tdee', {t, loggedIn: req.session.isLoggedIn, isAdmin});
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.post('/newpost', (req,res) => {
    const {value, error} = schemas.postPostSchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        //change to where it logs to screen
        return res.status(400).json(errorMessages);
    }
    else{
        try{
            const posting = postModel.createPost({
                userid: req.session.userID,
                username: req.session.username,
                postText: value.postText,
                title: value.title
            });

            if (posting){
                res.redirect('viewpost');
            } else {
                res.sendStatus(400);
            }

        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
        
    }

});

app.get("/newpost", (req, res) => {
    if (req.session.isLoggedIn){
        const isAdmin = req.session.role;
        res.render('newpost', {isAdmin});
    } else {
        return res.sendStatus(500);
    }
});

app.get("/viewpost", (req,res) => {
    try{
        const allPosts = postModel.getAllPostData();
        const loggedIn = req.session.isLoggedIn;
        const isAdmin = req.session.role;
        res.render('viewpost', {allPosts, loggedIn, isAdmin});
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.get("/posts/:postid", (req, res) =>{
    try{
        const getPost = postModel.getPostByID(req.params.postid);
        const getComments = commentModel.getCommentsByID(req.params.postid);
        const loggedIn = req.session.isLoggedIn;
        let username;
        if (getPost){
            username = userModel.getUserUsernameByID(getPost.userid);
        } else{
            username = "n/a";
        }
       
        const currUsername = req.session.username;
        const isAdmin = req.session.role;
        if (getPost){
            res.render('showpost', {getPost, getComments, loggedIn, username, currUsername, isAdmin});
        } else {
            return res.sendStatus(500);
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    } 
});

app.post("/posts/:postid/comments" , (req, res) => {
    const {value, error} = schemas.postCommentSchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        return res.status(400).json(errorMessages);
    } else {
        try {
            const newComment = commentModel.createComment({
                userid: req.session.userid,
                postid: req.params.postid,
                commentText: value.commentText,
                username: req.session.username
            });
    
            if (newComment){
                res.redirect("/posts/" + req.params.postid);
            } else {
                return res.sendStatus(400);
            }
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }

});

app.post("/posts/:postid/delete", (req, res) => {
    const deletepost = postModel.deletePost(req.params.postid);
    if (deletepost){
        res.redirect('/viewpost');
    } else if (req.session.isLoggedIn !== 1){
        res.redirect('/login');
    } else {
        res.sendStatus(400);
    }
});

app.post("/posts/:commentID/deletecomment", (req, res) => {
    const deleteComment = commentModel.deleteComment(req.params.commentID);
    if (deleteComment){
        res.redirect((req.get('referer')));
    } else if (req.session.isLoggedIn !== 1){
        res.redirect('/login');
    } else {
        res.sendStatus(400);
    }
});

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
            return res.redirect('/ClientTrackerPages/main');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

app.post('/delete_client', (req, res) => {
    // let name = req.body.delete_client_name;
    console.log(req.body);
    const {value, error} = schemas.deleteClients.validate(req.body, VALIDATION_OPTIONS);

    if (error) {
        const errorMessages = error.details.map(error => error.message);
        console.log(error);
        return res.sendStatus(400).json(errorMessages);
    }
    
    const name = value.name;
    try {
        
        client_model.delete_client(name);
        return res.redirect('/ClientTrackerPages/main');
    } catch (err) {
        res.sendStatus(500);
        console.error(err);
        return [];
    }
});

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
        return res.redirect('/ClientTrackerPages/main');
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
            return res.redirect('/ClientTrackerPages/main.html');
        }
    } catch(err) {
        res.sendStatus(500);
        console.log(err);
        return [];
    }
});

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
            return res.redirect('/ClientTrackerPages/main.html');
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