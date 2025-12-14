require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

// Serve static files (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');

// Body parser + sanitizer
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

// Sessions
app.use(session({
  secret: 'health-secret',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId;
    res.locals.currentUser = req.session.userId || null;
    next();
  });
  

// Make login state available to all EJS pages
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  next();
});

// Database connection
const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE
});
global.db = db;

// Routes
app.use('/', require('./routes/main'));
app.use('/users', require('./routes/users'));
app.use('/bookings', require('./routes/bookings'));

// Start server
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
