require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

// ---- BASE PATH (CRITICAL FOR GOLDSMITHS VM)
const basePath = process.env.HEALTH_BASE_PATH || '';

// ---- STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));

// ---- VIEW ENGINE
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

// ---- SESSIONS
app.use(session({
  secret: 'health-secret',
  resave: false,
  saveUninitialized: false
}));

// ---- GLOBAL VARIABLES FOR EJS
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.basePath = basePath;
  next();
});

// ---- DATABASE
const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE
});
global.db = db;

// ---- ROUTES (BASE PATH AWARE)
app.use(basePath + '/', require('./routes/main'));
app.use(basePath + '/users', require('./routes/users'));
app.use(basePath + '/bookings', require('./routes/bookings'));

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
