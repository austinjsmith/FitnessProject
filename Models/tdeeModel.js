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
                    (weight, gender, lean, activity, userid, tdee)
                VALUES 
                    (@weight, @gender, @lean, @activity, @userid, @tdee)
                `;
            
            db.prepare(sql).run(comp);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    updateTDEE (tdee, userid){
        const sql = `
            UPDATE Composition
            SET tdee = @tdee
            WHERE userid=@userid
            `;
        db.prepare(sql).run({tdee, userid});
    }

    getTDEE (userid){
        const sql = `
        SELECT tdee FROM composition WHERE userid=@userid`;
        return db.prepare(sql).get({userid}); 

    }
}

exports.tdeeModel = new tdeeModel(db);