'use strict';

const {joi} = require("joi");
const {db} = require("./db");
const uuidV4 = require('uuid').v4;

class trainer_model
{
    constructor(db) {
        this.db = db;
    }

    add_trainer(trainer){

        try {
            const sql = `INSERT INTO trainers (name, license, address, location) 
                            VALUES (@name, @license, @address, @location)`;
            const stmt = db.prepare(sql);
            stmt.run(trainer);
    
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    get_all_trainers() {

        try {
            const sql = 'SELECT * FROM trainers';
            const stmt = db.prepare(sql);

            return stmt.all();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    get_trainer(name) {
        
        try {
            const sql = 'SELECT * FROM trainers WHERE name = @name';
            const stmt = db.prepare(sql);

            return stmt.all({name});
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    delete_trainer(name) {

        try {
            const sql = 'DELETE FROM trainers WHERE name = @name';
            const stmt = db.prepare(sql);

            return stmt.run({name});
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    update_license(name, license) {

        try {
            const sql = `UPDATE trainers 
                        SET license = @license 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, license});
        } catch(err) {
            console.error(err);
            return [];
        }
    }
    update_address(name, address) {

        try {
            const sql = `UPDATE trainers 
                        SET address = @address 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, address});
        } catch(err) {
            console.error(err);
            return [];
        }
    }
    update_location(name, location) {

        try {
            const sql = `UPDATE trainers 
                        SET location = @location
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, location});
        } catch(err) {
            console.error(err);
            return [];
        }
    }
}

exports.trainer_model = new trainer_model(db);