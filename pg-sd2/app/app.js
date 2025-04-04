const express = require("express");
const db = require("./services/db");
const app = express();
const { User } = require("./models/user");
const answerModel = require('./models/answerModel');

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

app.get("/supportrequests", async (req, res) => {
  try {
    const requests = await db.query("SELECT * FROM supportrequests");
    const answers = await db.query("SELECT * FROM answers");

    // Group answers by their RequestID
    const groupedAnswers = {};
    answers.forEach(answer => {
      if (!groupedAnswers[answer.RequestID]) {
        groupedAnswers[answer.RequestID] = [];
      }
      groupedAnswers[answer.RequestID].push(answer);
    });

    // Attach answers to their respective support request
    const combinedData = requests.map(req => {
      return {
        ...req,
        answers: groupedAnswers[req.RequestID] || []
      };
    });

    res.render("supportrequests_combined", { posts: combinedData });
  } catch (error) {
    res.render("supportrequests_combined", { error: "Database error: " + error });
  }
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


// Upvote route
app.post("/answers/upvote/:id", (req, res) => {
  const answerId = req.params.id;
  answerModel.upvoteAnswer(answerId)
    .then(() => {
      res.redirect("/answers");
    })
    .catch(error => {
      res.status(500).send("Error upvoting answer: " + error);
    });
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});