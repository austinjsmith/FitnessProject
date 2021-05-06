"use strict";
const { joi } = require("joi");
const {db} = require("./db");
const uuidV4 = require('uuid').v4;

class postModel{
    constructor (db) {
        this.db = db;
    }

    createPost(post){
        try{
            const sql=`
                INSERT INTO Posts 
                    (postid, userid, postText, createdOn, title)
                VALUES
                    (@postid, @userid, @postText, @createdOn, @title)
            `;

            post.postid = uuidV4();
            
            let todaydate = new Date();
            let month = todaydate.getUTCMonth() + 1;
            let day = todaydate.getDate();
            let year = todaydate.getUTCFullYear();
                
            let todaysdate = `${year}/${month}/${day}`;
            post.createdOn = todaysdate;

            db.prepare(sql).run(post);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    updateLike(postid){
        try{
            const sql=`
                UPDATE Posts
                SET likes = likes + 1 
                WHERE postid=@postid
            `;
            db.prepare(sql).run({postid});
            return true;
        } catch(err) {
            console.error(err);
            return false;
        }
        
    }

    getAllPostData(){
        try{
            const sql=`
                SELECT * FROM Posts ORDER BY rowid DESC
            `;
            return db.prepare(sql).all();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    getPostByID(postid){
        try{
            const sql = `
                SELECT * FROM Posts WHERE postid=@postid
            `;
            return db.prepare(sql).get({postid});
        } catch (err) {
            console.error(err);
            return;
        }
    }

    deletePost(postid){
        try{
            const sql = `DELETE FROM Posts WHERE postid=@postid`;
            db.prepare(sql).run({postid});
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
}    

exports.postModel = new postModel(db);