"use strict";

const express = require("express");
const Joi = require('joi');
const argon2 = require("argon2");
const app = express();
const path = require("path");
const redis = require("redis");
const session = require("express-session");
const ejs = require("ejs");
const {schemas, VALIDATION_OPTIONS} = require("./validators/allValidators");

const calTdee = require ("./public/js/calculate");

let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient();

app.set('view engine','ejs');

const sessionConfig = {
    store: new RedisStore({ client: redisClient }),
    secret: "somethingSecret",
    resave: false,
    saveUninitialized: false,
    name: "session", // now it is just a generic name
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 8, // 8 hours
    }
}

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

const PORT = 8001;

app.use(express.static(path.join(__dirname, "public"),{
    extensions: ['html'],
}));

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
                return res.redirect('/login.html'); // 200 OK
            } else { // something went wrong
                res.sendStatus(500); // 500 Internal Server Error
            }
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }

});

//login into account
app.post("/login", async (req, res) => {
	// const { email, password } = req.body;
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
                        return res.redirect('index.html');
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
	req.session.destroy(function(err) {
        //if user isnt logged in 
        // if (req.session.isLoggedIn !== 'undefined'){
        //     if (req.session.isLoggedIn !== 1){
        //         return res.redirect("/login.html");
        //     }
        // }

        //if it fails to destroy
        if (err){
            return res.sendStatus(500);
        }
        //if destoryed
        else {
            return res.redirect("/login.html");
        }
	});
});


//adding a new meal for calories
app.post("/calories", (req, res) => {
    console.log("POST /calories");
    const {value, error} = schemas.postMealSchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        //change to where it logs to screen
        return res.status(400).json(errorMessages);
    }

    else {
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
                return res.sendStatus(200);
            }
                
        } catch (err){
            console.log(err);
            return res.sendStatus(500);
        }
    }
   
});

app.get('/meallog', (req, res) => {
    let todaydate = new Date();
    let month = todaydate.getUTCMonth() + 1;
    let day = todaydate.getUTCDate();
    let year = todaydate.getUTCFullYear();
    let todaysdate = `${year}/${month}/${day}`;

    const meal2 = mealModel.getTodaysMeals(req.session.userID, todaysdate);
    const tdeeW = tdeeModel.getTDEE(req.session.userID);
    const loggedIn = req.session.isLoggedIn;
    
    //if user is not logged in, send to the login page
    if (loggedIn !== 1){
        res.redirect('login.html');
    } 
    //meal and tdee exists
    // if (meal2 && tdeeW){
    res.render('meallog', {meal2, loggedIn, tdeeW, todaysdate});
    // }
});

app.post("/counter", (req, res) =>{
    //set default user for testing
    console.log("POST /intake");
    const {value, error} = schemas.postTDEESchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        //change to where it logs to screen
        return res.status(400).json(errorMessages);
    }

    let lean = req.body.select;
    let gender = req.body.genderselect;
    let activity = req.body.activityselect;

    lean = parseFloat(lean);
    let weight = parseFloat(value.weight);
    activity = parseFloat(activity);
   
    //female
    if (gender === "1"){
        gender = "female";
        if (lean === 5.0){
           lean = 1.0; 
        }
        else if (lean === 6.0){
            lean = 0.95; 
         }
        if (lean === 7.0){
            lean = 0.9; 
         }
        else if (lean === 8.0){
            lean = 0.85;
        }
    }
    //male
    if (gender === "2"){
        gender = "male";
        if (lean === 1.0){
            lean = 1.0; 
         }
        else if (lean === 2.0){
             lean = 0.95; 
          }
        else if (lean === 3.0){
             lean = 0.9; 
          }
        else if (lean === 4.0){
             lean = 0.85;
         }
    }

    let tdeeW = calTdee.calTdee(weight, gender, lean, activity);
    tdeeW = parseInt(tdeeW);
    
    //if user has account
    if (req.session.isLoggedIn){
        const user = req.session.userID;
        const tdeenow = tdeeModel.getTDEE(user);

        //if user is defaulted, create tdee
        if (typeof tdeenow === 'undefined'){
            tdeeModel.createTDEE({
                weight, 
                gender, 
                lean: lean, 
                activity, 
                userid: user,
                tdee: tdeeW
            });
        } else {
            tdeeModel.updateTDEE( tdeeW, user );
        }
    }

    res.redirect('tdee');
});

app.get('/tdee', (req,res) => {
    const userid = req.session.userID;
    let t, gen;

    //if logged into an account
    if( req.session.isLoggedIn === 1 ){
        t = tdeeModel.getTDEE(userid);
        gen = tdeeModel.getGender(userid);
    } 
    res.render('tdee', {t, loggedIn: req.session.isLoggedIn, gen});
});

app.get('/forum', (req, res) =>{
    const user = req.session.username;
    const postData = postModel.getAllPostData();
    if (postData && user){
        res.render('viewpost', {user, postData});
    }
    else {
        res.redirect('login.html');
    }
});

app.post('/newpost', (req,res) => {
    const {value, error} = schemas.postContentSchema.validate(req.body, VALIDATION_OPTIONS);
    if (error){
        const errorMessages = error.details.map( error => error.message );
        //change to where it logs to screen
        return res.status(400).json(errorMessages);
    }
    else{
        const posting = postModel.createPost({
            userid: req.session.userID,
            username: req.session.username,
            postText: value.postText
        });
        
        if (posting){
            res.redirect('forum');
        }
    }

});

app.get("/newpost", (req, res) => {
    res.redirect('newpost.html');
});

app.post("/posts/new", (req,res) => {
    const {title, postText} = req.body;
    console.log(postText);
    try {
        const newPost = postModel.createPost({
            userid: req.session.userID,
            postText: postText,
            title: title
        });

        if (newPost){
            res.redirect('/viewpost');
        } else {
            return res.sendStatus(400);
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }

});

app.get("/viewpost", (req,res) => {
    try{
        const allPosts = postModel.getAllPostData();
        if (allPosts.length > 0){
            res.render('viewpost', {allPosts});
        } else {
            return res.sendStatus(400);
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.get("/posts/:postid", (req, res) =>{
    try{
        const getPost = postModel.getPostByID(req.params.postid);
        const getComments = commentModel.getCommentsByID(req.params.postid);
        if (getPost){
            res.render('showpost', {getPost, getComments});
    
        } else {
            return res.sendStatus(400);
        }
      
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
    
});

app.post("/posts/:postid/comments" , (req, res) => {
    const {commentText} = req.body;
    try {
        const newComment = commentModel.createComment({
            userid: req.session.userid,
            postid: req.params.postid,
            commentText: commentText,
            username: req.session.username
        });

        if (newComment){
            // return res.sendStatus(200);
            console.log("new comment");
            res.redirect("/posts/" + req.params.postid);
        } else {
            return res.sendStatus(400);
        }
    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});