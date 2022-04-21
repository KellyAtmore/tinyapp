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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
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
    password: "dishwasher-funk"
  }
};


//ROUTES ---->

app.get("/urls", (req, res) => {
  const userId = req.cookies['userId'];
  
  const templateVars = { urls: urlDatabase, user: users[userId]};
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//creates short url with user input and redirects to page displaying long and short urls
app.post("/urls", (req, res) => {
  const userId = req.cookies['userId'];
  console.log(req.body);  // Log the POST request body to the console
  const shortURL =  generateRandomString();
  
  urlDatabase[shortURL] = {longURL : req.body.longURL, userID: userId};
     
  res.redirect("/urls/" + shortURL);
});


//render new urls page
app.get("/urls/new", (req, res) => {
  const userId = req.cookies['userId'];
  
  const user = users[userId];

  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { urls: urlDatabase, user: users[userId]};
  res.render("urls_new", templateVars);

});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['userId'];
  
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
  urlDatabase[shortURL]["longURL"] = updatedLongUrl;
  
  res.redirect("/urls");
});

//remove a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//render the login page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    
    if (user.email === email && user.password === password) {
      foundUser = user;
    }
    
  }
  if (!foundUser) {
    return res.status(403).send("username or password incorrect");
  }
  res.cookie("userId", foundUser.id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const userId = req.cookies['userId'];
  const templateVars = { urls: urlDatabase, user: users[userId]};
  

  res.render("login", templateVars);

});


//clear cookie on logout
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});


//updates the user database and sets cookie
app.post("/register", (req, res) => {
  const randomID =  generateRandomString();
  
  /**
  * get the body of the request
  *
  * Validate the request
  * --- return if validation fails
  * Check if the user already exist
  * ---return user already exist
  *
  * At this point the user is unique
  * and the request is valid
  *
  * Create the user
  *
  */

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
      return res.status(400).send("This email is already registered");
    }
  }
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };

  res.cookie("userId", randomID);
  //console.log(users);
  res.redirect("/urls");
  console.log(users);
});

app.get("/register", (req, res) => {
  const userId = req.cookies.userId;
  const templateVars = {user: userId};
  res.render("register", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});