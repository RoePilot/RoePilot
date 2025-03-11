const express = require("express");
const db = require("./services/db");

const app = express();
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Root route: Display "Hello [Your Name]!"
app.get("/", function(req, res) {
    res.render("index", { name: "Your Name" });
});

// Dynamic route for '/hello/:name'
app.get("/hello/:name", function(req, res) {
    res.render("hello", { name: req.params.name });
});

// Dynamic route '/user/:id'
app.get("/user/:id", function(req, res) {
    res.render("user", { id: req.params.id });
});

// Dynamic route '/student/:name/:id'
app.get("/student/:name/:id", function(req, res) {
    res.render("student", { name: req.params.name, id: req.params.id });
});

// DB test route: query specific user from database
app.get("/db_test/:id", function(req, res) {
    let sql = `SELECT name FROM test_table WHERE id = ?`;
    db.query(sql, [req.params.id]).then(results => {
        if (results.length > 0) {
            res.render("db_test", { result: results[0] });
        } else {
            res.render("db_test", { error: "No record found." });
        }
    }).catch(error => {
        res.render("db_test", { error: "Database error: " + error });
    });
});

// Roehampton route: combine greeting and substring logic
app.get("/roehampton", function(req, res) {
    let greeting = "Hello Roehampton!";
    let substring = req.url.substring(1, 4);
    res.render("roehampton", { greeting, substring });
});

// Additional Task 2: Dynamic route '/number/:n' to print numbers in a table
app.get("/number/:n", function(req, res) {
    let n = parseInt(req.params.n);
    if (isNaN(n) || n < 0) {
        return res.send("Invalid number.");
    }
    let numbers = Array.from({ length: n + 1 }, (_, i) => i);
    res.render("number", { n, numbers });
});

// (Optional) Serve static files from the static folder if needed
app.use(express.static("static"));

app.listen(3000, function() {
    console.log("Server running at http://127.0.0.1:3000/");
});
