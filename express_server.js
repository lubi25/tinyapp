const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { urls: urlDatabase, username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL]
  if (longURL) {
    res.redirect(longURL);
  }
  else {
    res.status(404).send("URL not found");
  }
});

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortURL = '';
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
}

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase.hasOwnProperty(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL;

  if (urlDatabase.hasOwnProperty(shortURL)) {
    urlDatabase[shortURL] = newURL;
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  if (!username) {
    res.status(404).send("URL not found");
  } else {
    res.cookie('username', username);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});