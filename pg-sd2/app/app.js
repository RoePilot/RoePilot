const express = require("express");
const db = require("./services/db");
const app = express();
const { User } = require("./models/user");
const session = require("express-session");
const answerModel = require('./models/answerModel');
const multer = require("multer");

// Set the sessions
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secretkeysdfjsflyoifasd',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./static/images"); // saves to public images directory
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

const upload = multer({ storage: storage });

app.use(express.static("static"));

// Set up the Pug templating engine
app.set("view engine", "pug");
app.set("views", "./app/views");

// Home route
app.get("/home", requireLogin, (req, res) => {
  res.render("index", { user: req.session.user });
});


// Login route
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/home"); // already logged in
  }
  res.render("login");
});


// Register route
app.get('/register', (req, res) => {
  res.render('register');
});

// Users route
app.get("/users", async (req, res) => {
  const search = req.query.search;
  let sql = "SELECT * FROM users";
  let params = [];

  if (search) {
    sql += " WHERE Username LIKE ? OR Email LIKE ? OR UniversityID LIKE OR CredibilityScore LIKE ?";
    const wildcard = `%${search}%`;
    params = [wildcard, wildcard, wildcard];
  }

  try {
    const results = await db.query(sql, params);
    res.render("users", { users: results, search });
  } catch (error) {
    res.render("users", { error: "Database error: " + error });
  }
});

// Handle register
app.post("/register", async (req, res) => {
  const { username, email, password, universityId } = req.body;

  // Create a user instance
  const user = new User({ email, username });

  try {
    await user.addUser({
      username,
      email,
      password,
      universityId
    });

    res.render("register", { success: "Account created! You can now log in." });
  } catch (err) {
    console.error(err);
    res.render("register", { error: "Error creating user: " + err });
  }
});

// Handle login
app.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  const user = new User({});
  const authUser = await user.authenticate(identifier, password);

  if (authUser) {
    req.session.user = {
      id: authUser.UserID,
      username: authUser.Username
    };
    return res.redirect("/home");  // ✅ <-- must redirect here!
  } else {
    res.render("login", { error: "Invalid credentials." });
  }
});


app.get("/supportrequests", async (req, res) => {
  const userId = req.query.user;
  const categoryId = req.query.category;

  try {
    let userName = null;
    let userPic = null;
    let pageTitle = "Support Requests";

    let requestsSql = "SELECT * FROM supportrequests";
    const sqlParams = [];

    // Add filtering
    if (userId) {
      requestsSql += " WHERE UserID = ?";
      sqlParams.push(userId);
    } else if (categoryId) {
      requestsSql += " WHERE CategoryID = ?";
      sqlParams.push(categoryId);
    }

    const requests = await db.query(requestsSql, sqlParams);

    // Fetch user info if filtering by user
    if (userId && requests.length > 0) {
      const userResult = await db.query("SELECT Username, ProfilePic FROM users WHERE UserID = ?", [userId]);
      if (userResult.length > 0) {
        userName = userResult[0].Username;
        userPic = userResult[0].ProfilePic || "default-avatar.png";
        pageTitle = `Support Requests by ${userName}`;
      }
    }

    // Fetch category info if filtering by category
    if (categoryId && requests.length > 0) {
      const catResult = await db.query("SELECT CategoryName FROM categories WHERE CategoryID = ?", [categoryId]);
      if (catResult.length > 0) {
        pageTitle = `Support Requests in "${catResult[0].CategoryName}"`;
      }
    }

    const answers = await db.query("SELECT * FROM answers");

    // Group answers by RequestID
    const groupedAnswers = {};
    answers.forEach(answer => {
      if (!groupedAnswers[answer.RequestID]) {
        groupedAnswers[answer.RequestID] = [];
      }
      groupedAnswers[answer.RequestID].push(answer);
    });

    // Map categories for category name display
    const categories = await db.query("SELECT * FROM categories");
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.CategoryID] = cat.CategoryName;
    });

    const combinedData = requests.map(req => ({
      ...req,
      answers: groupedAnswers[req.RequestID] || [],
      CategoryName: categoryMap[req.CategoryID] || "Uncategorized"
    }));

    res.render("supportrequests_combined", {
      posts: combinedData,
      filterUserName: userName,
      filterUserPic: userPic,
      pageTitle
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