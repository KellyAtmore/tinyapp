const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");



const generateRandomString = function() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * 6));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//creates short url with user input and redirects to page displaying long and short urls
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL =  generateRandomString();
  //console.log(shortURL);
  urlDatabase[shortURL] = req.body.longURL;
  //console.log(urlDatabase);
  res.redirect("/urls/" + shortURL);         // Respond with 'Ok' (we will replace this)
});


//render new urls page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  //console.log(shortURL);
  const shortURL = req.params.shortURL;
  const templateVars = {shortURL, longURL: urlDatabase[shortURL]};
  res.render("urls_show", templateVars);
});

//redirects user to the long url address using the short url link
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL);
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


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n"); });

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});