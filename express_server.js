const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateRandomString = function() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i <= 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * 6));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortUrl =  req.params.shortURL;
  const templateVars = {shortURL: shortUrl, longURL: urlDatabase[shortUrl]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortUrl =  generateRandomString();
  //console.log(shortUrl);
  urlDatabase[shortUrl] = req.body.longURL;
  console.log(urlDatabase);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});