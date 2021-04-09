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
                `INSERT INTO composition 
                    (weight, gender, lean, activity, user)
                VALUES 
                    (@weight, @gender, @lean, @activity, @user)
                `;
            
            db.prepare(sql).run(comp);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    updateTdee(tdee, user){
        const sql=`UPDATE composition SET tdee=@tdee WHERE user=@user`
        db.prepare(sql).run({user: user, tdee: tdee});
    }

    updateWeight(weight, user){
        const sql=`UPDATE composition SET weight=@weight WHERE user=@user`
        db.prepare(sql).run({user: user, weight: weight});
    }

    getWeight (userID){
        const sql=`
        SELECT weight FROM composition WHERE user=@userID`;

        return db.prepare(sql).get({userID}); 
    }
    getActivity (userID){
        const sql=`
        SELECT activity FROM composition WHERE user=@userID`;

        return db.prepare(sql).get({userID}); 
    }
    getLean (userID){
        const sql=`
        SELECT lean FROM composition WHERE user=@userID`;

        return db.prepare(sql).get({userID}); 
    }
    getGender (userID){
        const sql=`
        SELECT gender FROM composition WHERE user=@userID`;

        return db.prepare(sql).get({userID}); 
    }
}

exports.tdeeModel = new tdeeModel(db);