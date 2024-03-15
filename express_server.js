const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };

  if (!user) {
    res.redirect("/login")
  }
  else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const id = req.params.id; 
  const longURL = urlDatabase[id].longURL; 
  const templateVars = { id: id, longURL: longURL, user }; 
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL.longURL); // Accessing the longURL property of the object
  } else {
    res.status(404).send("Shortened URL does not exist");
  }
});


app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };

  if (user) {
    res.redirect("/urls")
  } else {
    res.render('register', templateVars);
  }
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };

  if (user) {
    res.redirect("/urls")
  } else {
    res.render('login', templateVars);
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

function generateRandomID() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomUserID = '';
  for (let i = 0; i < 12; i++) {
    randomUserID += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomUserID;
}

function findUserByEmail(email) {
  return Object.values(users).find(user => user.email === email);
}

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
    urlDatabase[shortURL].longURL = newURL; // Update the longURL property
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user) {
    res.status(403).send("User cannot be found");
  } 

  else if (password !== user.password) {
    res.status(403).send("Password is incorrect")
  }

  else {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const userID = generateRandomID();

  if (!email) {
    return res.status(400).send("Email is required");
  }

  if (!password) {
    return res.status(400).send("Password is required");
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({error: 'Email already registered'});
  }

  const newUser = { 
    id: userID,
    email,
    password
  }

  users[userID] = newUser;

  console.log(users);
  res.cookie('user_id', userID);
  res.redirect(`/urls`);
});