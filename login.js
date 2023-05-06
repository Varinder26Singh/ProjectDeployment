const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const base = `${__dirname}/pages`;
const app = express();
const port = 5000;
app.use(express.static('pages'));
// Configure passport.js with the Google strategy
passport.use(new GoogleStrategy({
  clientID: '268220279857-0nm3v5me8ncnhi26eedvlt04ggt4r0r0.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "http://localhost:5000/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile);
}));

// Configure passport.js session handling
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure express.js middleware
app.use(session({
  secret: 'cats',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Define protected routes
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/auth/google');
}

app.get('/', (req, res) => {
  res.sendFile(`${base}/welcome.html`);
});

app.get('/water', (req, res) => {
  res.sendFile(`${base}/water.html`);
});

app.get('/login', (req, res) => {
  res.sendFile(`${base}/second.html`);
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/protected',
  failureRedirect: '/auth/failure'
}));

app.get('/protected', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/third.html`);
});

app.get('/protected/Diet', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/fourth.html`);
});

app.get('/protected/Yoga', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/yoga.html`);
});

app.get('/protected/Water', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/water.html`);
});

app.get('/protected/Meal_Plan', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/meal_plan.html`);
});

app.get('/protected/Meal_Plan/Breakfast', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/breakfast.html`);
});

app.get('/protected/Meal_Plan/Lunch', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/lunch.html`);
});

app.get('/protected/Meal_Plan/Snacks', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/snacks.html`);
});

app.get('/protected/Meal_Plan/Dinner', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/Dinner.html`);
});

app.get('/protected/Watch', isLoggedIn, (req, res) => {
  res.sendFile(`${base}/main.html`);
});

app.get('/result', (req, res) => {
  res.sendFile(`${base}/result.txt`);
});


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate.');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});