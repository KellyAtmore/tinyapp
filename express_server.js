const express = require("express");
const {generateRandomString, urlsForUser, getUserByEmail} = require('./helpers');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");


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
    return res.redirect("/login");
  }
  let templateVars = {
    user: user,
    urls: urlsForUser(urlDatabase,user.id)
  };
  console.log("this is template vars", templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//creates short url with user input and redirects to page displaying long and short urls
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL =  generateRandomString();
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID: userId};
     
  res.redirect("/urls/" + shortURL);
});


//render new urls page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_new", templateVars);

});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;
  const templateVars = {shortURL, longURL: urlDatabase[shortURL]["longURL"], user: users[userId] };
  
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
  
  
  if (user.id === userId) {
    urlDatabase[shortURL]["longURL"] = updatedLongUrl;
    res.redirect("/urls");
  } if (user.id !== userId) {
    res.send("you don't have permissions for this url");
  }


});

//remove a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;

  if (userId && userId in users) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
  
});

//render the login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    
    if (user.email === email && bcrypt.compareSync(password, hashedPassword)) {
      foundUser = user;
    }
    
  }
  if (!foundUser) {
    return res.status(403).send("username or password incorrect");
  }
  req.session.user_id = foundUser.id;
  res.redirect("/urls");
  
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("login", templateVars);
});

//clear cookie on logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//updates the user database and sets cookie
app.post("/register", (req, res) => {
  const randomID =  generateRandomString();
  
  //check if email/password are empty
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (!email || !password) {
    return res.status(400).send("Please enter an email and password");
  }
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
