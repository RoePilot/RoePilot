const express = require("express");
const db = require("./services/db");
const app = express();
const { User } = require("./models/user");
const answerModel = require('./models/answerModel');

// Middleware to check if user is authenticated (example placeholder)
const requireAuth = (req, res, next) => {
  // This is a placeholder; implement actual auth logic (e.g., check session or token)
  if (!req.user) {
    return res.status(401).send("You must be logged in to upvote.");
  }
  next();
};

app.use(express.static("static"));

// Set up the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Users route
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql)
    .then(results => {
      res.render("users", { users: results });
    })
    .catch(error => {
      res.render("users", { error: "Database error: " + error });
    });
});

// Register
app.get('/register', function (req, res) {
  res.render('register');
});

// Login
app.get('/login', function (req, res) {
  res.render('login');
});

// Support Requests route
app.get("/understoodsupportrequests", (req, res) => {
  const sql = "SELECT * FROM support_requests";
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
  const sql = "SELECT * FROM categories";
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
  const sql = "SELECT * FROM answers";
  db.query(sql)
    .then(results => {
      res.render("answers", { answers: results });
    })
    .catch(error => {
      res.render("answers", { error: "Database error: " + error });
    });
});

// Upvote route
app.post("/answers/upvote/:id", requireAuth, (req, res) => {
  const answerId = req.params.id;
  const userId = req.user.id; // Assumes req.user.id is set by auth middleware
  answerModel.upvoteAnswer(userId, answerId)
    .then(() => {
      res.redirect("/answers");
    })
    .catch(error => {
      if (error === "Already upvoted") {
        res.status(403).send("You have already upvoted this answer.");
      } else {
        res.status(500).send("Error upvoting answer: " + error);
      }
    });
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});