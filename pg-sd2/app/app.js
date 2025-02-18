const express = require("express");
const db = require("./services/db");

const app = express();
app.use(express.static("static"));

// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// EXERCISE 1: Modify root route to display "Hello [Your Name]"
app.get("/", function(req, res) {
    res.send("Hello [Your Name]!");
});

// EXERCISE 2: Create a new route '/roehampton'
app.get("/roehampton", function(req, res) {
    console.log(req.url);
    res.send("Hello Roehampton!");
});

// EXERCISE 4: Add logic to return first 3 letters of request path
app.get("/roehampton", function(req, res) {
    console.log(req.url);
    let path = req.url;
    res.send(path.substring(1, 4));
});

// Dynamic route for '/hello/:name'
app.get("/hello/:name", function(req, res) {
    console.log(req.params);
    res.send("Hello " + req.params.name);
});

// EXERCISE 2: Dynamic route '/user/:id'
app.get("/user/:id", function(req, res) {
    res.send("User ID: " + req.params.id);
});

// EXERCISE 3: Dynamic route '/student/:name/:id'
app.get("/student/:name/:id", function(req, res) {
    res.send(`<h1>Student Information</h1><p>Name: ${req.params.name}</p><p>ID: ${req.params.id}</p>`);
});

// EXERCISE 5: Modify '/db_test/:id' route to query specific user from database
app.get("/db_test/:id", function(req, res) {
    let sql = `SELECT name FROM test_table WHERE id = ?`;
    db.query(sql, [req.params.id]).then(results => {
        if (results.length > 0) {
            res.send(`<h1>Result</h1><p>Name: ${results[0].name}</p>`);
        } else {
            res.send("No record found.");
        }
    }).catch(error => {
        res.send("Database error: " + error);
    });
});

// Additional Task 1: Reverse "roehampton"
app.get("/roehampton/reverse", function(req, res) {
    let reversed = "roehampton".split("").reverse().join("");
    res.send(`<h1>Reversed: ${reversed}</h1>`);
});

// Additional Task 2: Create a dynamic route '/number/:n' to print numbers in a table
app.get("/number/:n", function(req, res) {
    let n = parseInt(req.params.n);
    if (isNaN(n) || n < 0) {
        return res.send("Invalid number.");
    }
    let tableRows = "";
    for (let i = 0; i <= n; i++) {
        tableRows += `<tr><td>${i}</td></tr>`;
    }
    res.send(`<h1>Numbers from 0 to ${n}</h1><table border='1'>${tableRows}</table>`);
});

// Serve static files
app.use(express.static("static"));

app.listen(3000, function() {
    console.log("Server running at http://127.0.0.1:3000/");
});
