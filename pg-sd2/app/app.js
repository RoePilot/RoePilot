const express = require("express");
const db = require("./services/db");
const app = express();
const { User } = require("./models/user");
const answerModel = require('./models/answerModel');
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./static/images"); // saves to public images directory
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

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
  const userId = req.query.user;
  try {
    let userName = null;
    let userPic = null;

    const requestsSql = userId
      ? "SELECT * FROM supportrequests WHERE UserID = ?"
      : "SELECT * FROM supportrequests";
    const requests = await db.query(requestsSql, userId ? [userId] : []);

    // Fetch user info if filtering
    if (userId && requests.length > 0) {
      const userResult = await db.query("SELECT Username, ProfilePic FROM users WHERE UserID = ?", [userId]);
      if (userResult.length > 0) {
        userName = userResult[0].Username;
        userPic = userResult[0].ProfilePic || "default-avatar.png";
      }
    }

    const answers = await db.query("SELECT * FROM answers");

    // Group answers
    const groupedAnswers = {};
    answers.forEach(answer => {
      if (!groupedAnswers[answer.RequestID]) {
        groupedAnswers[answer.RequestID] = [];
      }
      groupedAnswers[answer.RequestID].push(answer);
    });

    const combinedData = requests.map(req => ({
      ...req,
      answers: groupedAnswers[req.RequestID] || []
    }));

    res.render("supportrequests_combined", {
      posts: combinedData,
      filterUserName: userName,
      filterUserPic: userPic
    });
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
      res.redirect("/supportrequests");
    })
    .catch(error => {
      res.status(500).send("Error upvoting answer: " + error);
    });
});
// profilepic upload
app.post("/users/:id/upload", upload.single("profilePic"), async (req, res) => {
  const userId = req.params.id;
  const fileName = req.file.filename;

  try {
    const sql = "UPDATE users SET ProfilePic = ? WHERE UserID = ?";
    await db.query(sql, [fileName, userId]);
    res.redirect("/users");
  } catch (error) {
    res.status(500).send("Error uploading profile picture: " + error);
  }
});

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000/");
});