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
const calTdee = require ("./public/js/calculate");
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

const {mealModel} = require("./Models/mealModel");
const {tdeeModel} = require("./Models/tdeeModel");
const {userModel} = require("./Models/userModel");
const {postModel} = require("./Models/postModel");
const {commentModel} = require("./Models/commentModel");

app.use(express.static(path.join(__dirname, "public"), {
    extensions: ['html'],
}));
app.use(express.json());
app.use(express.urlencoded ({extended: true}));
app.use(session(sessionConfig));

app.get("/login", (req, res) =>{
    res.render('login', {isLogged: req.session.isLoggedIn});
});

app.get("/", (req, res) => {
    res.redirect('/login');
})

//create a new account
app.post("/register", async (req, res) =>{
	console.log("POST /users");
    const {value, error} = schemas.postUsersSchema.validate(req.body, VALIDATION_OPTIONS);
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

                        //check if admin
                        // if (email.includes(process.env.ADMIN) ){
                        //     res.redirect(TO AUSTINS SIDE OF THE WEBSITE)
                        // } ELSE REDIRECT TO INDEX
                        return res.redirect('index');
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
        if(req.session.isLoggedIn !==  1){
            return res.render('login');
        } else {
            res.render('index');
        } 
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
    
});

app.get('/meallog', (req, res) => {
    let todaydate = new Date();
    let month = todaydate.getUTCMonth() + 1;
    let day = todaydate.getUTCDate();
    let year = todaydate.getUTCFullYear();
    let todaysdate = `${year}/${month}/${day}`;
    let showDate = `${month}/${day}/${year}`;

    const meal2 = mealModel.getTodaysMeals(req.session.userID, todaysdate);
    const tdeeW = tdeeModel.getTDEE(req.session.userID);
    const loggedIn = req.session.isLoggedIn;
    
    //if user is not logged in, send to the login page
    if (loggedIn !== 1){
        res.render('login');
    } else {
        res.render('meallog', {meal2, loggedIn, tdeeW, showDate});
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
    let t, gen;
    try{
        //if user is not logged in, send to the login page
        if (req.session.isLoggedIn !== 1){
            return res.redirect('login');
        } else if ( req.session.isLoggedIn === 1 ){
            t = tdeeModel.getTDEE(userid);

            res.render('tdee', {t, loggedIn: req.session.isLoggedIn});
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
        res.render('newpost');
    } else {
        return res.sendStatus(500);
    }
});

app.get("/viewpost", (req,res) => {
    try{
        const allPosts = postModel.getAllPostData();
        const loggedIn = req.session.isLoggedIn;
        res.render('viewpost', {allPosts, loggedIn});
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
        if (getPost){
            res.render('showpost', {getPost, getComments, loggedIn, username, currUsername});
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
        res.redirect('back');
    } else if (req.session.isLoggedIn !== 1){
        res.redirect('/login');
    } else {
        res.sendStatus(400);
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