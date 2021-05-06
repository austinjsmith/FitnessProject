"use strict";

module.exports.calTdee = function(weight, gender, height, activity, goal, age){
    let tdee = 0.0;
    //convert to kg
    // tdeeW = tdeeW + weight / 2.2;
    // if (gender === "female"){
    //     tdeeW = tdeeW * 0.9;
    // }
    
    // tdeeW = tdeeW * lean * activity * 24;
    // if (goal === 1){
    //     tdeeW = tdeeW + 300;
    // } else if (goal === 2) {
    //     tdeeW = tdeeW - 300;
    // }

    if (gender === "male"){
        tdee = (4.536 * weight) + (15.88 * height) - (5 * age) + 5;
    } else {
        tdee = (4.536 * weight) + (15.88 * height) - (5 * age) - 161;
    }

    tdee = tdee * activity;

    if (goal === 1){
        tdee = tdee + 300;
    }
    if (goal === 2){
        tdee = tdee - 300;
    }
 
    return tdee = parseInt(tdee);
}