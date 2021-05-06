const {db} = require("./db");
const uuidV4 = require('uuid').v4;

class userModel{
    constructor (db) {
        this.db = db;
    }

    createUser (user) {
        try {
            const sql = `
                INSERT INTO Users 
                    (userID, username, passwordHash, email) 
                VALUES 
                    (@userID, @username, @passwordHash, @email)
            `;
            const addUserStmt = db.prepare(sql);
            
            // Create the user's id and add it to the user object
            user.userID = uuidV4();
            // attempt to add them to the database
            addUserStmt.run(user);
            return true;
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getPasswordHash (email) {
        try {
            return db.prepare(`
                    SELECT passwordHash 
                    FROM Users 
                    WHERE email=@email
                `).get({email});
        } catch (err) {
            return;
        }
    }

    getUserDataEmail (email) {
        try {
            const sql = `
                SELECT 
                    *
                FROM
                    Users
                WHERE
                    email=@email
            `;
            return db.prepare(sql).get({email});
        } catch (err) {          // if there was any error
            console.error(err);  // then log it
            return false;        // return false to indicate failure
        }
    }

    getUserUsernameByID (userid){
        try {
            const sql = `SELECT username FROM Users WHERE userid=@userid`;
            return db.prepare(sql).get({userid});
        } catch (err) {
            console.error(err);
            return;
        }
    }
}

exports.userModel = new userModel(db);