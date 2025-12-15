const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();

/* REGISTER PAGE */
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('..');
  res.render('register.ejs', { errors: [], data: {} });
});

/* REGISTER HANDLER */
router.post(
  '/register',
  [
    check('password')
      .isLength({ min: 8 })
      .matches(/[a-z]/)
      .matches(/[A-Z]/)
      .matches(/[0-9]/)
      .matches(/[^A-Za-z0-9]/)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register.ejs', {
        errors: errors.array(),
        data: req.body
      });
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    db.query(
      'INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?, ?, ?, ?, ?)',
      [req.body.username, req.body.first, req.body.last, req.body.email, hash],
      err => {
        if (err) return res.send('Username already exists');
        res.redirect('../users/login');
      }
    );
  }
);

/* LOGIN PAGE */
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('..');
  res.render('login.ejs', { error: null });
});

/* LOGIN HANDLER */
router.post('/login', (req, res) => {
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [req.body.username],
    async (err, results) => {
      if (!results || results.length === 0) {
        return res.render('login.ejs', { error: 'Login failed' });
      }

      const match = await bcrypt.compare(
        req.body.password,
        results[0].hashedPassword
      );

      if (!match) {
        return res.render('login.ejs', { error: 'Login failed' });
      }

      req.session.userId = results[0].username;
      res.redirect('..');
    }
  );
});

router.get('/audit', redirectLogin, (req, res) => {
  db.query(
    'SELECT * FROM login_audit ORDER BY login_time DESC',
    (err, logs) => {
      if (err) return res.send('Database error');
      res.render('audit.ejs', { logs });
    }
  );
});

module.exports = router;