require('dotenv').config();

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const path = require('path');
const expressSanitizer = require('express-sanitizer');

const app = express();
const port = 8000;

// ✅ Base path for Goldsmiths VM (e.g. /usr/sshah004) OR empty locally
const basePath = process.env.HEALTH_BASE_PATH || '';

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(expressSanitizer());

// ✅ Static files (CSS) - works with basePath because links will include basePath
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'health-secret',
  resave: false,
  saveUninitialized: false
}));

// ✅ Make these available in all EJS pages
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId;
  res.locals.currentUser = req.session.userId || null;
  res.locals.basePath = basePath;
  next();
});

// ✅ Database pool
const db = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE,
  waitForConnections: true,
  connectionLimit: 10
});
global.db = db;

// ✅ Mount routes under basePath so VM URLs work
app.use(basePath + '/', require('./routes/main'));
app.use(basePath + '/users', require('./routes/users'));
app.use(basePath + '/bookings', require('./routes/bookings'));

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
