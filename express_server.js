const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const PORT = 8080;


// Import required functions
const { getUserByEmail, generateRandom, urlsForUser } = require("./helpers.js");


// Empty variables to house content
const urlDatabase = {};
const users = {};


// App set up
app.set("view engine", "ejs");

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: [generateRandom(32)],
  maxAge: 24 * 60 * 60 * 1000
}));


// Redirect to URLs upon entering site
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// Index page with list of URLs (viewable only by registered users)
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.render("error", { errorMessage: "Welcome to TinyApp! Please log in to see URLs", user: null });
  }
  const userURLs = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});


// Create new URLs page (viewable only by registered users)
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };

  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


// URLs redirect page after short URL has been generated (also available from URLs index)
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const id = req.params.id;
  const urlEntry = urlDatabase[id];

  if (!user) {
    return res.render("error", { errorMessage: "Error: Must log in to see URLs", user: null });
  }

  if (!urlEntry) {
    return res.render("error", { errorMessage: "Error: URL not found", user });
  }

  if (urlEntry.userID !== user.id) {
    return res.render("error", { errorMessage: "Error: You don't own this URL", user });
  }

  const templateVars = { id, longURL: urlEntry.longURL, user };
  res.render("urls_show", templateVars);
});


// Redirect link
app.get("/u/:id", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL.longURL);
  } else {
    return res.render("error", { errorMessage: "Shortened URL does not exist", user });
  }
});


// Registration page
app.get("/register", (req, res) => {
  const user = getUserByEmail(req.session.user_id, users);
  const templateVars = { user };

  if (user) {
    res.redirect("/urls");
  } else {
    res.render('register', templateVars);
  }
});


// Login page
app.get("/login", (req, res) => {
  const user = getUserByEmail(req.session.user_id, users);
  const templateVars = { user };

  if (user) {
    res.redirect("/urls");
  } else {
    res.render('login', templateVars);
  }
});


// Create new URL
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const longURL = req.body.longURL;
  const shortURL = generateRandom(6);

  if (!user) {
    return res.render("error", { errorMessage: "Must log in to shorten URLs", user: null });
  } else {
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: user.id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});


// Delete URL
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;

  if (!user) {
    return res.render("error", { errorMessage: "Must log in to delete URLs", user: null });
  }

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.render("error", { errorMessage: "URL not found", user });
  }

  if (urlDatabase[shortURL].userID !== user.id) {
    return res.render("error", { errorMessage: "You don't have permission to delete this URL", user });
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


// Update URL
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL;
  const user = users[req.session.user_id];

  if (!user) {
    return res.render("error", { errorMessage: "Must log in to update URLs", user: null });
  }

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.render("error", { errorMessage: "URL not found", user });
  }

  if (urlDatabase[shortURL].userID !== user.id) {
    return res.render("error", { errorMessage: "You don't have permission to update this URL", user });
  }
  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});


// Log into existing account
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.render("error", { errorMessage: "User cannot be found", user: null });
  } else if (!bcrypt.compareSync(password, user.hashedPassword)) {
    return res.render("error", { errorMessage: "Password is incorrect", user: null });
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});


// Log out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


// Register new account
app.post("/register", (req, res) => {
  const user = users[req.session.user_id];
  const { email, password } = req.body;
  const userID = generateRandom(12);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email) {
    return res.render("error", { errorMessage: "Email is required", user });
  }

  if (!password) {
    return res.render("error", { errorMessage: "Password is required", user });
  }

  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.render("error", { errorMessage: "Email is already registered", user });
  }

  const newUser = {
    id: userID,
    email,
    hashedPassword
  };

  users[userID] = newUser;

  console.log(users);
  req.session.user_id = userID;
  res.redirect(`/urls`);
});


// App listen on local host
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});