const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs") ;
const  cookieParser = require('cookie-parser');
app.use(cookieParser());

//using the body-parser library to make the POST request body human readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// generating a "unique" shortURL by returning a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//log in and create a cookie
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username",username);
  res.redirect("/urls")
});

//log out and clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls")
});
// adding a route to urls using template engine
app.get("/urls", (req, res) => {
  let templateVars = {
     urls: urlDatabase, 
     username : req.cookies["username"]
    };

 

  res.render("urls_index", templateVars);
});

//add a get route to show the form
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username : req.cookies["username"]
   };
  res.render("urls_new",templateVars)
});

//Render information about a single URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL : req.params.shortURL,
     longURL : urlDatabase[req.params.shortURL],
     username : req.cookies["username"]
     };
  res.render("urls_show", templateVars);
});

//created a route to handle the POST requests from our form
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);       
});

// delete a url
app.post('/urls/:shortURL/delete',(req, res) => {
  const key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// update a url
app.post('/urls/:shortURL/update',(req, res) => {
  const key = req.params.shortURL;
  urlDatabase[key] = req.body.newURL;
  res.redirect("/urls");
});

//Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});