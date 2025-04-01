// Get the functions in the db.js file to use
const db = require('../services/db');
const bcrypt = require("bcryptjs");

class User {

    // Id of the user
    id;

    // Email of the user
    email;

    constructor(email) {
        this.email = email;
    }
    

    // Checks to see if the submitted email address exists in the Users table
    async getIdFromEmail() {
            var sql = "SELECT id FROM Users WHERE Users.email = ?";
            const result = await db.query(sql, [this.email]);
            // TODO LOTS OF ERROR CHECKS HERE..
            if (JSON.stringify(result) != '[]') {
                this.id = result[0].id;
                return this.id;
            }
            else {
                return false;
            }
    }
    // Add a password to an existing user
    async setUserPassword(password) {
        const pw = await bcrypt.hash(password, 10);
        var sql = "UPDATE Users SET password = ? WHERE Users.id = ?"
        const result = await db.query(sql, [pw, this.id]);
        return true;
    }
    
    // Add a new record to the users table    
    async addUser(password) {
    
    }

    // Test a submitted password against a stored password
    async authenticate(submitted) {

    }


}

module.exports  = {
    User
}
