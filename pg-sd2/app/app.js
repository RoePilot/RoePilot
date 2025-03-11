const express = require("express");
const db = require("./services/db");
const app = express();

app.use(express.static("static"));

// Set up the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Users route: fetch all users from the database
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";  // Adjust table name/fields as needed
  db.query(sql)
    .then(results => {
      res.render("users", { users: results });
    })
    .catch(error => {
      res.render("users", { error: "Database error: " + error });
    });
});

// Support Requests route
app.get("/supportrequests", (req, res) => {
  const sql = "SELECT * FROM supportrequests";  // Adjust table name/fields as needed
  db.query(sql)
    .then(results => {
      res.render("supportrequests", { supportrequests: results });
    })
    .catch(error => {
      res.render("supportrequests", { error: "Database error: " + error });
    });
});

// Categories route
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";  // Adjust table name/fields as needed
  db.query(sql)
    .then(results => {
      res.render("categories", { categories: results });
    })
    .catch(error => {
      res.render("categories", { error: "Database error: " + error });
    });
});

// Answers route
app.get("/answers", (req, res) => {
  const sql = "SELECT * FROM answers";  // Adjust table name/fields as needed
  db.query(sql)
    .then(results => {
      res.render("answers", { answers: results });
    })
    .catch(error => {
      res.render("answers", { error: "Database error: " + error });
    });
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});