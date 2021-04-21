"use strict";
const { joi } = require("joi");
const {db} = require("./db");
const uuidV4 = require('uuid').v4;

class commentModel {
    constructor (db) {
        this.db = db;
    }

    createComment(comment){
        try{
            const sql = `
            INSERT INTO Comments 
                (userid, postid, commentText, createdOn, username)
            VALUES 
                (@userid, @postid, @commentText, @createdOn, @username)
            `;

            let todaydate = new Date();
            let month = todaydate.getUTCMonth() + 1;
            let day = todaydate.getDate();
            let year = todaydate.getUTCFullYear();
                
            let todaysdate = `${year}/${month}/${day}`;

            comment.createdOn = todaysdate;
            db.prepare(sql).run(comment);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    getCommentsByID(postid){
        try{
            const sql = `SELECT * FROM Comments WHERE postid=@postid ORDER BY rowid DESC`;
            return db.prepare(sql).all({postid});
        } catch (err) {
            console.error(err);
            return[];
        }
    }
}

exports.commentModel = new commentModel(db);