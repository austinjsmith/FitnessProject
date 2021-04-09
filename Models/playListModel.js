"use strict"
const {db} = require("./db");
const uuidV4 = require('uuid'.v4);

class playList{
    constructor(db){
        this.db = db;
    }

    createPlayList(PlayList){
        try{
            const sql = `
                INSERT INTO PlayList (name, category)   
                VALUES (@name, @category)
            `;

            const addPlayListStmt = db.prepare(sql);

            addPlayListStmt.run(PlayList);

            return true;
        }catch(err){
            console.error(err);
            return false;
        }
    }

    removePlayList(playList){

    }

}