require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

app.use(
  session({
    secret: 'health-secret',
    resave: false,
    saveUninitialized: false
  })
);

/* globals */
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.currentUser = req.session.userId || null;
  next();
});

/* database */
const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE
});
global.db = db;

/* routes */
app.use('/', require('./routes/main'));
app.use('/users', require('./routes/users'));
app.use('/bookings', require('./routes/bookings'));

app.listen(port, () => {
  console.log('App running');
});