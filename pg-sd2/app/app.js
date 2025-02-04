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
    // Capture the 'id' parameter from the URL
    const id = req.params.id;

    // Log the requested URL and ID to the console for debugging
    console.log(`Requested URL: ${req.url}`);
    console.log(`ID: ${id}`);

    // Modify the SQL query to include a WHERE clause for the passed ID
    const sql = 'SELECT * FROM test_table WHERE id = ?';

    // Execute the query with the captured ID
    db.query(sql, [id])
        .then(results => {
            console.log(results);

            // Check if any rows were returned
            if (results.length > 0) {
                // Extract the name from the first result
                const name = results[0].name;

                // Create an HTML response with some formatting
                const htmlResponse = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Database Test</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                margin: 50px;
                            }
                            h1 {
                                color: #333;
                            }
                            p {
                                font-size: 1.2em;
                                color: #555;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Database Test</h1>
                        <p>The name for ID <strong>${id}</strong> is: <strong>${name}</strong>.</p>
                    </body>
                    </html>
                `;

                // Send the HTML response back to the browser
                res.send(htmlResponse);
            } else {
                // If no rows were found, send a "Not Found" message
                res.status(404).send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Not Found</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                text-align: center;
                                margin: 50px;
                            }
                            h1 {
                                color: #d9534f;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Not Found</h1>
                        <p>No record found for ID <strong>${id}</strong>.</p>
                    </body>
                    </html>
                `);
            }
        })
        .catch(error => {
            // Handle any errors that occur during the query
            console.error('Error executing query:', error);
            res.status(500).send('An error occurred while querying the database.');
        });
});

// Start server on port 3000
app.listen(3000, function() {
    console.log(`Server running at http://127.0.0.1:3000/`);
});