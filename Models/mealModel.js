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
                (mealname, maincalorie, fats, carbs, proteins)
            VALUES 
                (@mealname, @maincalorie, @fats, @carbs, @proteins)
            `;
            db.prepare(sql).run(meal);
            return true;

        } catch (err) {
            console.log(err);
            return false;
        }
    }

    getAllMeals () {
        try {
            const sql = `SELECT * FROM Meals`;
            return db.prepare(sql).all();
        } catch (err){
            return [];
        }
        
    }
}

exports.mealModel = new mealModel(db);