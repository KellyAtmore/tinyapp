const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const {generateRandomString, urlsForUser, getUserByEmail} = require('./helpers');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["thissecretkey"]
}));
app.set("view engine", "ejs");

//DATABASES ------>
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "a"
  }
};

//ROUTES ---->

//shows urls of user logged in
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    return res.send("Please login or register");
  }
  let templateVars = {
    user: user,
    urls: urlsForUser(urlDatabase,user.id)
  };
  res.render("urls_index", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//creates short url with user input and redirects to page displaying long and short urls
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL =  generateRandomString();
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID: userId};
  res.redirect("/urls/" + shortURL);
});


//render new urls page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]};
  res.render("urls_new", templateVars);

});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const shortURLuser = urlDatabase[shortURL].userID;
  
  //if user is not logged in: error message
  if (userId !== shortURLuser) {
    res.status(401).send("Error: 401: you don't have access");
  }
  //show urls for user logged in
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL]["longURL"],
    user: users[userId]
  };
  res.render("urls_show", templateVars);
});

//redirects user to the long url address using the short url link
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  res.redirect(longURL);
});

//edits an existing long url
app.post("/urls/:shortURL", (req, res) => {
  const updatedLongUrl = req.body.updated_longURL;
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!userId) {
    return res.send('Permission denied, must be owner of account to edit url link');
  }
  if (user.id === userId) {
    urlDatabase[shortURL]["longURL"] = updatedLongUrl;
    res.redirect("/urls");
  }
});

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
});

//remove a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  //if user owns url, allow to delete
  if (userId && userId in users) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

//render the login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(email, users);
  
  //if inputs empty, return error message
  if (!email || !password) {
    return res.status(400).send("Please enter an email and password");
  }
  //if no user is found, ask to register
  if (!foundUser) {
    res.send("No account found with this email address, please register");
  }
  //check password for match
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Email or password does not match");
  }
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
  
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    urls: urlDatabase,
    user: users[userId]
  };
  res.render("login", templateVars);
});

//clear cookie on logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//updates the user database and sets cookie
app.post("/register", (req, res) => {
  const randomID =  generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  //check if email/password are empty
  if (!email || !password) {
    return res.status(400).send("Please enter an email and password");
  }
  //check for emails already taken
  if (getUserByEmail(email, users)) {
    return res.status(400).send("This email is already taken");
  }
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword
  };
  
  req.session.user_id = randomID;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {user: userId};
  res.render("register", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
