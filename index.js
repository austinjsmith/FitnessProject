"use strict";

const express = require("express");
const Joi = require("joi");
const argon2 = require("argon2");
const app = express();
const path = require("path");
const session = require("express-session");
const ejs = require("ejs");
//const {schemas, VALIDATION_OPTIONS} = require("./validators/allValidators");
//set view enginer to ejs
app.set('view engine','ejs');

const {mealModel} = require("./Models/mealModel");
const {tdeeModel} = require("./Models/tdeeModel");


app.use(express.json());
app.use(express.urlencoded ({extended: true}));
app.use(session({
    secret: "<something-secret>",
    resave: false,
    saveUninitialized: true
}));

const PORT = 8001;

app.use(express.static(path.join(__dirname, "public"),{
    extensions: ['html'],
}));

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
            proteins
        });
        console.log(add);
        res.redirect('index.html');
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
    const meals = mealModel.getAllMeals();
    console.log(meals);
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
    const user = "kresha";
    let {weight, gender, lean, activity} = req.body;
    // let weight = tdeeModel.getWeight(user);
    // let activity = tdeeModel.getActivity(user);
    // let lean = tdeeModel.getLean(user);
    // let gender = tdeeModel.getGender(user);

    weight = parseFloat(weight);
    lean = parseFloat(lean);
    activity = parseFloat(activity);

    //calculate tdee weight and update 
    let tdeeW = 0.0;
    tdeeW = tdeeW + weight / 2.2;
    if (gender === "female"){
        tdeeW = tdeeW * 0.9;
    }
    
    tdeeW = tdeeW * lean * activity * 24;
    tdeeW = parseInt(tdeeW);
    const updateTdee = tdeeModel.updateTdee(tdeeW, user);

    console.log(tdeeW);
    res.render('tdee', {tdeeW});
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})