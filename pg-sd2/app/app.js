const express = require("express");
const db = require("./services/db");
const app = express();
const { User } = require("./models/user");
const answerModel = require('./models/answerModel');

app.use(express.static("static"));
app.use(express.json());

// Basic authentication middleware (replace with your actual auth system)
app.use((req, res, next) => {
  req.user = { id: 1 }; // Temporary - replace with real auth
  next();
});

app.set("view engine", "pug");
app.set("views", "./app/views");

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Users route
app.get("/users", async (req, res) => {
  try {
    const sql = "SELECT * FROM users";
    const results = await db.query(sql);
    res.render("users", { users: results });
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }
  } catch (error) {
    console.error('Users route error:', error);
    res.status(500).render("users", { error: "Database error: " + error.message });
  }
});

// Register
app.get('/register', (req, res) => {
  res.render('register');
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

// Support Requests route
app.get("/understoodsupportrequests", async (req, res) => {
  try {
    const sql = "SELECT * FROM support_requests";
    const results = await db.query(sql);
    res.render("supportrequests", { supportrequests: results });
  } catch (error) {
    console.error('Support requests error:', error);
    res.status(500).render("supportrequests", { error: "Database error: " + error.message });
  }
});

// Categories route
app.get("/categories", async (req, res) => {
  try {
    const sql = "SELECT * FROM categories";
    const results = await db.query(sql);
    res.render("categories", { categories: results });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).render("categories", { error: "Database error: " + error.message });
  }
});

// Answers route
app.get("/answers", async (req, res) => {
  try {
    const sql = "SELECT * FROM answers";
    const results = await db.query(sql);
    res.render("answers", { answers: results });
  } catch (error) {
    console.error('Answers route error:', error);
    res.status(500).render("answers", { error: "Database error: " + error.message });
  }
});

// Upvote route
app.post("/answers/upvote/:id", async (req, res) => {
  try {
    const answerId = req.params.id;
    const userId = req.user.id;
    const result = await answerModel.upvoteAnswer(answerId, userId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });  
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: "Error upvoting answer: " + error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).send('Something went wrong on the server');
});