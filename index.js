"use strict";

const express = require("express");
const Joi = require("joi");
const argon2 = require("argon2");
const app = express();
const path = require("path");
const redis = require("redis");
const session = require("express-session");
const ejs = require("ejs");
const {leanValue} = require("./public/js/addmeal");
//const {schemas, VALIDATION_OPTIONS} = require("./validators/allValidators");

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
// const { emitWarning } = require("process");
// const { connected } = require("process");

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

	const {username, password, email} = req.body;

	try {
		const passwordHash = await argon2.hash(password, {hashLength: 5});
		const userAdded = userModel.createUser({
			username, 
			passwordHash,
			email
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
});

//login into account
app.post("/login", async (req, res) => {
	const { email, password } = req.body;
    
	try {
        const row = userModel.getPasswordHash(email); 
        const user = userModel.getUserDataEmail(email);

		if (!row) {
			return res.sendStatus(400);
		}

		const {passwordHash} = row;
		
		if ( await argon2.verify(passwordHash, password) ) {
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
});


app.post("/logout", async (req, res) => {
	req.session.destroy(function(err) {
        //if user isnt logged in 
        // if (req.session.isLoggedIn){
        //     if (req.session.isLoggedIn !== 1){
        //         return res.redirect("/login.html");
        //     }
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
    const {mealname, maincalorie, fats, carbs, proteins} = req.body;
    try {
        const add = mealModel.createMeal({
            mealname,
            maincalorie,
            fats,
            carbs, 
            proteins,
            userid: req.session.userID
        });
        console.log(add);
        setTimeout(() => {
            res.redirect('index.html');
        }, 600);
            
        
    } catch (err){
        console.log(err);
        return res.sendStatus(500);
    }
});

// app.get("/meals", (req,res) => {
//     console.log("GET /meals");
//     try {
//         const meals = mealModel.getAllMeals();
//         res.render("home", {meals});
//     } catch (err) {
//         console.log(err);
//         return res.sendStatus(500);
//     }
// });

app.get('/home', (req, res) => {
    console.log(req.session.userID);
    const meals = mealModel.getAllMeals(req.session.userID);
    console.log(meals.length);
    res.render('home', {meals});
})

// app.post('/comp', (req, res) => {
//     console.log("GET /tdee");
//     const {gender, weight, lean, activity} = req.body;

//     try {
//         const comp = tdeeModel.createTDEE({
//             gender,
//             weight,
//             lean,
//             activity,
//             user: "kresha"
//         });
        
//         return res.sendStatus(200);
//     } catch (err) {
//         console.error(err);
//         return false;
//     }
// });

app.post("/counter", (req, res) =>{
    //set default user for testing
    console.log("POST /intake");

    let {weight} = req.body;
    let lean = req.body.select;
    let gender = req.body.genderselect;
    let activity = req.body.activityselect;

    lean = parseFloat(lean);
    weight = parseFloat(weight);
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
    const usern = req.session.userID;
    let t;
    //if logged into an account
    if( req.session.isLoggedIn === 1 ){
        t = tdeeModel.getTDEE(usern);
    } 
    res.render('tdee', {t});
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});