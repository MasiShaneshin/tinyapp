const express = require("express");
const bodyParser = require("body-parser");
const  cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session')
const app = express();
const session = require('express-session');
const bcrypt = require('bcrypt');
const { json } = require("body-parser");
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);

app.set("view engine", "ejs") ;
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}))
//----Database------
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", userID: "rT5e4W"}
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple", 10)
  },
 "rT5e4W": {
    id: "rT5e4W", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher", 10)
  }
}

//------ generating Random string -----
const generateRandomString = ()=> {
  return Math.random().toString(36).substring(2,8);
}

//----- return urls ------
const urlsForUser = (id)=> {
  const urls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urls[key] = urlDatabase[key];
    }
  }
  return urls;
}

//lookup for an email and return the user that has this email
const emailExists = (email) => {
  for (let key in users) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return null;
} 

//----- form for Registration ------
app.get("/register", (req, res) => {
  let templateVars = {
    user : users[req.session.user_id]
   };
  res.render("register",templateVars);
})

// -----create Registration------
app.post("/register", (req, res) => {
  if(req.body.email && req.body.password && emailExists(req.body.email) === null){
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      id : userRandomID,
      email : req.body.email,
      password : bcrypt.hashSync(req.body.password, 10)
    };
    req.session["user_id"]= users[userRandomID].id;
    res.redirect("/urls");
  } else if (req.body.email && req.body.password && emailExists(req.body.email)) {
    res.status(400).send("This email exists already!")
  } else {
    res.status(400).send("Email or password invalid");
  }
});

//----------show the form for login page----
app.get("/login", (req, res) =>{
  let templateVars = {
    user : users[req.session.user_id]
   };
  res.render("login",templateVars);
});

//---------log page with crypt password-----------
app.post("/login", (req, res) => {
  const user = emailExists(req.body.email);
  if (user){
    if (bcrypt.compareSync(req.body.password, users[user.id]["password"])) {
      req.session["user_id"] = user.id;
      res.redirect("/urls");
    } else {
      let templateVars = {
        error: 401,
        message: "Incorrect email or password",
        user: users[req.session.user]
      };
      res.status(503).render("error_page", templateVars);
    } 
  }else{
    res.status(400).send("Email dosen't exsit");
  }
});

//------log out page
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/urls")
});

//----------- show all the urls for a specific user ------------
app.get("/urls", (req, res) => {
  if (req.session['user_id']) {
    const templateVars = {
      urls: urlsForUser(req.session.user_id), 
      user : users[req.session.user_id]
     };
   res.render("urls_index", templateVars);
  } else {
    const templateVars = { 
      user : null,
      message : "You have to Register/Login inorder to accesss to Tinyapp"
     };
    res.render("message",templateVars);
  }
  
});

//------display th form to add a new url---------
app.get("/urls/new", (req, res) => {
  if(req.session["user_id"]){
    let templateVars = {
      user : users[req.session.user_id]
     };
    res.render("urls_new",templateVars)
  } else {
    res.redirect("/login");
  }
});

//----------Render information about a single URL-----------
app.get("/urls/:shortURL", (req, res) => {
 if(req.session['user_id'] && urlsForUser(req.session['user_id']).hasOwnProperty(req.params.shortURL)) {
    const templateVars = { shortURL : req.params.shortURL,
      longURL : urlDatabase[req.params.shortURL].longURL,
      user : users[req.session.user_id]
      };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = { 
      user : null,
      message : "You have to Register/Login in order to have the right to display this url"
     };
    res.render("message",templateVars);
  }
});

//----create a new url--------
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  }
  res.redirect(`/urls/${shortURL}`);       
});

// ------ Delete an url---------------
app.post('/urls/:shortURL/delete',(req, res) => {
  if(req.session['user_id'] && urlsForUser(req.session['user_id']).hasOwnProperty(req.params.shortURL)) {
    const key = req.params.shortURL;
    delete urlDatabase[key];
    res.redirect("/urls");
  } else {
    const templateVars = { 
      user : users[req.session.user_id],
      message : "You have to Register/Login in order to have the right to delete this url"
     };
    res.render("message",templateVars);
  }
});

// ---- update an url--------------
app.post('/urls/:shortURL/update',(req, res) => {
  if(req.session.user_id && urlsForUser(req.session.user_id).hasOwnProperty(req.params.shortURL)) {
  const key = req.params.shortURL;
  urlDatabase[key].longURL = req.body.longURL;
  res.redirect("/urls");
} else {
  const templateVars = { 
    user : users[req.session.user_id],
    message : "You have to Register/Login in order to have the right to update this url"
   };
  res.render("message",templateVars);
}
});

//------------Redirect any request to "/u/:shortURL" to its longURL--------------
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
