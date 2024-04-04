const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const PORT = 8080;


// Import required functions
const { getUserByEmail, generateRandomKey, generateRandomString, generateRandomID, urlsForUser } = require("./helpers.js");


// Empty variables to house content
const urlDatabase = {};
const users = {};


// App set up
app.set("view engine", "ejs");

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(cookieSession({
  name: 'session',
  keys: [generateRandomKey(32)],
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
  const templateVars = { id, longURL: urlEntry.longURL, user };

  if (!user) {
    return res.render("error", { errorMessage: "Error: Must log in to see URLs", user: null });
  }

  if (!urlEntry) {
    return res.render("error", { errorMessage: "Error: URL not found", user });
  }

  if (urlEntry.userID !== user.id) {
    return res.render("error", { errorMessage: "Error: You don't own this URL", user });
  }

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
  const shortURL = generateRandomString();

  if (!user) {
    res.status(400).send("Must log in to shorten URLs");
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
  const shortURL = req.params.id;
  const user = users[req.session.user_id];

  if (!user) {
    return res.status(401).send("Must log in to delete URLs");
  }

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(404).send("URL not found");
  }

  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(403).send("You don't have permission to delete this URL");
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
    return res.status(401).send("Must log in to update URLs");
  }

  if (!urlDatabase.hasOwnProperty(shortURL)) {
    return res.status(404).send("URL not found");
  }

  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(403).send("You don't have permission to update this URL");
  }
  urlDatabase[shortURL].longURL = newURL;
  res.redirect("/urls");
});


// Log into existing account
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    res.status(403).send("User cannot be found");
  } else if (!bcrypt.compareSync(password, user.hashedPassword)) {
    res.status(403).send("Password is incorrect");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});


// Log out
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});


// Register new account
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userID = generateRandomID();
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email) {
    return res.status(400).send("Email is required");
  }

  if (!password) {
    return res.status(400).send("Password is required");
  }

  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.status(400).json({error: 'Email already registered'});
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