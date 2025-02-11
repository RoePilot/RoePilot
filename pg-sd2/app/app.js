// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - /
app.get("/", function(req, res) {
    res.send("Hello world!");
});

// Create a route for testing the db
app.get("/db_test", function(req, res) {
    // Assumes a table called test_table exists in your database
    sql = 'select * from test_table';
    db.query(sql).then(results => {
        console.log(results);
        res.send(results)
    });
});

// NEW ROUTE: Create a route for /db_test/:id
app.get("/db_test/:id", function(req, res) {
    const id = req.params.id;
    console.log(`Requested URL: ${req.url}`);
    console.log(`ID: ${id}`);

    const sql = 'SELECT * FROM test_table WHERE id = ?';
    db.query(sql, [id])
        .then(results => {
            console.log(results);
            if (results.length > 0) {
                const name = results[0].name;
                const htmlResponse = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Database Test</title>
                    </head>
                    <body>
                        <h1>Database Test</h1>
                        <p>The name for ID <strong>${id}</strong> is: <strong>${name}</strong>.</p>
                    </body>
                    </html>
                `;
                res.send(htmlResponse);
            } else {
                res.status(404).send("No record found for ID " + id);
            }
        })
        .catch(error => {
            console.error('Error executing query:', error);
            res.status(500).send('An error occurred while querying the database.');
        });
});

// NEW ROUTE: Create a route for "/hello/:name"
app.get("/hello/:name", function(req, res) {
    const name = req.params.name;
    res.send(`Hello, ${name}!`);
});

// Start server on port 3000
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});
