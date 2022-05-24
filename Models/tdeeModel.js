"use strict";
const { joi } = require("joi");
const {db} = require("./db");
const uuidV4 = require('uuid').v4;


class tdeeModel{
    constructor (db) {
        this.db = db;
    }

    createTDEE(comp){
        try {
            const sql=
                `INSERT INTO Composition 
                    (weight, gender, height, activity, userid, tdee, goal, age)
                VALUES 
                    (@weight, @gender, @height, @activity, @userid, @tdee, @goal, @age)
                `;
            
            db.prepare(sql).run(comp);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    updateTDEE (tdee, userid){
        try{
            const sql = `
                UPDATE Composition
                SET tdee = @tdee
                WHERE userid=@userid
            `;
            db.prepare(sql).run({tdee, userid});
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }

    }

    getTDEE (userid){
        try{
            const sql = `
                SELECT tdee
                FROM composition 
                WHERE userid=@userid
            `;
            return db.prepare(sql).get({userid}); 
        } catch (err) {
            console.error(err);
            return;
        }
    }

    getGender(userid){
        try {
            const sql = `
                SELECT gender 
                FROM Composition
                WHERE userid=@userid`;
            return db.prepare(sql).get({userid});
        } catch (err) {
            console.log(error);
            return;
        }
    }
}

exports.tdeeModel = new tdeeModel(db);