const express = require("express");
const db = require("./services/db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "your_secret_key",  // Change this to a secure key
    resave: false,
    saveUninitialized: false,
  })
);

// Set up the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Home route
app.get("/", (req, res) => {
  res.render("index", { user: req.session.user });
});

// Registration route
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    await db.query(sql, [username, hashedPassword]);

    res.redirect("/login");
  } catch (error) {
    res.render("register", { error: "Registration failed: " + error });
  }
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = "SELECT * FROM users WHERE username = ?";
    const results = await db.query(sql, [username]);

    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.user = { id: user.id, username: user.username };
        return res.redirect("/dashboard");
      }
    }

    res.render("login", { error: "Invalid credentials" });
  } catch (error) {
    res.render("login", { error: "Login failed: " + error });
  }
});

// Dashboard (only for authenticated users)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("dashboard", { user: req.session.user });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});
