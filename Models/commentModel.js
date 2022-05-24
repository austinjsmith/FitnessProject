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
                (userid, postid, commentText, createdOn, username, commentID)
            VALUES 
                (@userid, @postid, @commentText, @createdOn, @username, @commentID)
            `;

            let todaydate = new Date();
            let month = todaydate.getUTCMonth() + 1;
            let day = todaydate.getDate();
            let year = todaydate.getUTCFullYear();
                
            let todaysdate = `${year}/${month}/${day}`;

            comment.createdOn = todaysdate;
            comment.commentID = uuidV4();
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

    getComment(commentID){
        try{
            const sql = `SELECT * FROM Comments WHERE commentID=@commentID`;
            return db.prepare(sql).get({commentID});
        } catch (err){
            console.error(err);
            return;
        }
    }

    deleteComment(commentID){
        try{
            const sql=`DELETE FROM Comments WHERE commentID=@commentID`
            db.prepare(sql).run({commentID});
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}

exports.commentModel = new commentModel(db);