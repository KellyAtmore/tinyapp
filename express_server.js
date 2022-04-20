const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


//function for generating short url and userid
const generateRandomString = function() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * 6));
  }
  return result;
};


//DATABASES ------>

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    password: "dishwasher-funk"
  }
};


//ROUTES ---->

app.get("/urls", (req, res) => {
  const userId = req.cookies['userId'];
  
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//creates short url with user input and redirects to page displaying long and short urls
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL =  generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/" + shortURL);
});


//render new urls page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['userId'];
  
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['userId'];
  
  const shortURL = req.params.shortURL;
  const templateVars = {shortURL, longURL: urlDatabase[shortURL], user: users[userId] };
  res.render("urls_show", templateVars);
});

//redirects user to the long url address using the short url link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//edits an existing long url
app.post("/urls/:shortURL", (req, res) => {
  const updatedLongUrl = req.body.updated_longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = updatedLongUrl;
  
  res.redirect("/urls");
});

//remove a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//render the login page
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


//clear cookie on logout
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});


//updates the user database and sets cookie
app.post("/register", (req, res) => {
  const randomID =  generateRandomString();
  
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };

  //check if email/password are empty
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send("Please enter an email and password");
  }
  
  
  //let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
  
    if (user.email === email) {
      res.status(400).send("This email is already registered");
    }
    res.cookie("userId", randomID);
    //console.log(users);
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  const userId = req.cookies.userId;
  const templateVars = {user: userId};
  res.render("register", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});