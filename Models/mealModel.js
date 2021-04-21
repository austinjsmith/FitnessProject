"use strict";
const { joi } = require("joi");
const {db} = require("./db");
const uuidV4 = require('uuid').v4;

class mealModel{
    constructor (db) {
        this.db = db;
    }

    createMeal(meal){
        try {
            const sql =` 
            INSERT INTO Meals 
                (mealname, maincalorie, fats, carbs, proteins, userid, dateadded)
            VALUES 
                (@mealname, @maincalorie, @fats, @carbs, @proteins, @userid, @dateadded)
            `;

            let todaydate = new Date();
            let month = todaydate.getUTCMonth() + 1;
            let day = todaydate.getUTCDate();
            let year = todaydate.getUTCFullYear();
            
            let todaysdate = `${year}/${month}/${day}`;
            meal.dateadded = todaysdate;
            db.prepare(sql).run(meal);
            return true;

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    getAllMeals (userid) {
        try {
            const sql = `
            SELECT * FROM Meals 
            WHERE userid = @userid 
            ORDER BY rowid DESC`;
            return db.prepare(sql).all({userid});
        } catch (err){
            return [];
        }
    }

    getTodaysMeals(userid, today){
        try{
            const sql = `
                SELECT * FROM Meals 
                WHERE userid=@userid 
                AND dateadded == @today
                ORDER BY rowid DESC
            `;
            return db.prepare(sql).all({userid, today});
        } catch (err) {
            console.error(err);
            return [];
        }
    }

}

exports.mealModel = new mealModel(db);