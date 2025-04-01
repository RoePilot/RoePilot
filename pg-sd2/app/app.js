const express = require("express");
const db = require("./services/db");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.static("static"));
app.use(express.urlencoded({ extended: true })); // To parse form data

app.use(
  session({
    secret: "your_secret_key", // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "pug");
app.set("views", "./app/views");

// Middleware to check authentication
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

// Home Route
app.get("/", (req, res) => {
  res.render("index", { user: req.session.userId });
});

// Show Login Form
app.get("/login", (req, res) => {
  res.render("login");
});

// Handle Login Submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email])
    .then(results => {
      if (results.length === 0) {
        return res.render("login", { error: "Invalid email or password" });
      }

      const user = results[0];

      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        if (isMatch) {
          req.session.userId = user.id;
          res.redirect("/dashboard");
        } else {
          res.render("login", { error: "Invalid email or password" });
        }
      });
    })
    .catch(error => res.render("login", { error: "Database error: " + error }));
});

// Show Register Form
app.get("/register", (req, res) => {
  res.render("register");
});

// Handle Registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [email, hashedPassword])
    .then(() => res.redirect("/login"))
    .catch(error => res.render("register", { error: "Database error: " + error }));
});

// Dashboard (Protected Route)
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.session.userId });
});

// Logout Route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});
