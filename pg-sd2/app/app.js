const express = require("express");
const db = require("./services/db");

const app = express();

// Use static files
app.use(express.static("static"));

// Use Pug as the templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Root route: Display a welcome message
app.get("/", (req, res) => {
    res.render("index", { name: "Your Name" });
});

// Dynamic route for '/hello/:name'
app.get("/hello/:name", (req, res) => {
    res.render("hello", { name: req.params.name });
});

// Dynamic route '/user/:id'
app.get("/user/:id", (req, res) => {
    res.render("user", { id: req.params.id });
});

// Dynamic route '/student/:name/:id'
app.get("/student/:name/:id", (req, res) => {
    res.render("student", { name: req.params.name, id: req.params.id });
});

// ✅ Fetch questions dynamically from the database
app.get("/questions", async (req, res) => {
    try {
        const [questions] = await db.query("SELECT * FROM questions");
        res.render("questions", { questions });
    } catch (err) {
        res.render("error", { error: "Database error: " + err.message });
    }
});

// ✅ Fetch a specific user from the database by ID
app.get("/db_test/:id", async (req, res) => {
    try {
        const [results] = await db.query("SELECT name FROM test_table WHERE id = ?", [req.params.id]);
        if (results.length > 0) {
            res.render("db_test", { result: results[0] });
        } else {
            res.render("db_test", { error: "No record found." });
        }
    } catch (err) {
        res.render("db_test", { error: "Database error: " + err.message });
    }
});

// Roehampton route: Example substring logic
app.get("/roehampton", (req, res) => {
    let greeting = "Hello Roehampton!";
    let substring = req.url.substring(1, 4);
    res.render("roehampton", { greeting, substring });
});

// ✅ Number Table - Display numbers in a list
app.get("/number/:n", (req, res) => {
    let n = parseInt(req.params.n);
    if (isNaN(n) || n < 0) {
        return res.send("Invalid number.");
    }
    let numbers = Array.from({ length: n + 1 }, (_, i) => i);
    res.render("number", { n, numbers });
});

// (Optional) Serve static files from "static" folder
app.use(express.static("static"));

// Start the server
app.listen(3000, () => {
    console.log("Server running at http://127.0.0.1:3000/");
});
