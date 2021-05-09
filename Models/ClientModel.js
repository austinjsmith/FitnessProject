'use strict';

const {joi} = require("joi");
const {db} = require("./db");
const uuidV4 = require('uuid').v4;

class client_model
{
    constructor(db) {
        this.db = db;
    }

    add_client(client){

        try {
            const sql = `INSERT INTO clients (name, is_active, height, weight, address, location, diet, plan) 
                        VALUES (@name, @is_active, @height, @weight, @address, @location, @diet, @plan)`;
            const stmt = db.prepare(sql);
            stmt.run(client);
    
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    get_all_clients() {

        try {
            const sql = 'SELECT * FROM clients';
            const stmt = db.prepare(sql);

            return stmt.all();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    get_client(name) {
        
        try {
            const sql = 'SELECT * FROM clients WHERE name = @name';
            const stmt = db.prepare(sql);

            return stmt.all({name});
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    get_all_active_clients() {

        try {
            const sql = 'SELECT * FROM clients WHERE is_active = 1';
            const stmt = db.prepare(sql);

            return stmt.all();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    get_active_client(name) {

        try {
            const sql = 'SELECT * FROM clients WHERE name = @name AND is_active = 1';
            const stmt = db.prepare(sql);

            return stmt.all({name});
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    
    delete_client(name) {

        try {
            console.log("deleting client...");
            const sql = `DELETE FROM clients WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name});
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    update_is_active(name, is_active) {

        try {
            const sql = `UPDATE clients 
                        SET is_active = @is_active 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, is_active});
        } catch(err) {
            console.error(err);
            return [];
        }
    }

    update_height(name, height) {
        try {
            const sql = `UPDATE clients 
                        SET height = @height 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, height});
        } catch(err) {
            console.error(err);
            return [];
        }
    }

    update_weight(name, weight) {
        try {
            const sql = `UPDATE clients 
                        SET weight = @weight 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, weight});
        } catch(err) {
            console.error(err);
            return [];
        }
    }

    update_address(name, address) {
        try {
            const sql = `UPDATE clients 
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
            const sql = `UPDATE clients 
                        SET location = @location 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, location});
        } catch(err) {
            console.error(err);
            return [];
        }
    }

    update_diet(name, diet) {
        try {
            const sql = `UPDATE clients 
                        SET diet = @diet 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, diet});
        } catch(err) {
            console.error(err);
            return [];
        }
    }

    update_plan(name, plan) {
        try {
            const sql = `UPDATE clients 
                        SET plan = @plan 
                        WHERE name = @name`;
            const stmt = db.prepare(sql);

            return stmt.run({name, plan});
        } catch(err) {
            console.error(err);
            return [];
        }
    }
}

exports.client_model = new client_model(db);