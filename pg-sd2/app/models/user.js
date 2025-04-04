const db = require('../services/db');
const bcrypt = require("bcryptjs");

class User {
  constructor({ email, username }) {
    this.email = email;
    this.username = username;
  }

  async getByUsernameOrEmail(identifier) {
    const sql = "SELECT * FROM users WHERE Email = ? OR Username = ?";
    const result = await db.query(sql, [identifier, identifier]);
    return result.length ? result[0] : null;
  }

  async addUser({ username, email, password, universityId }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO users (Username, Email, Password, UniversityID)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(sql, [username, email, hashedPassword, universityId]);
    return true;
  }

  async authenticate(identifier, submittedPassword) {
    const user = await this.getByUsernameOrEmail(identifier);
    if (!user) return false;
    const match = await bcrypt.compare(submittedPassword, user.Password);
    return match ? user : false;
  }
}

module.exports = {
  User
};