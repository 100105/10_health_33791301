const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('register.ejs', {
    errors: [],
    data: {}
  });
});

router.post(
  '/register',
  [
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/).withMessage('Must include a lowercase letter')
      .matches(/[A-Z]/).withMessage('Must include an uppercase letter')
      .matches(/[0-9]/).withMessage('Must include a number')
      .matches(/[^A-Za-z0-9]/).withMessage('Must include a special character')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('register.ejs', {
        errors: errors.array(),
        data: req.body
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    db.query(
      'INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?, ?, ?, ?, ?)',
      [
        req.body.username,
        req.body.first,
        req.body.last,
        req.body.email,
        hashedPassword
      ],
      err => {
        if (err) {
          return res.render('register.ejs', {
            errors: [{ msg: 'Username already exists' }],
            data: req.body
          });
        }
        res.redirect('/users/login');
      }
    );
  }
);

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('login.ejs', { error: null });
});

router.post('/login', (req, res) => {
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [req.body.username],
    async (err, results) => {
      if (results.length === 0) {
        return res.render('login.ejs', {
          error: 'Invalid username or password'
        });
      }

      const match = await bcrypt.compare(
        req.body.password,
        results[0].hashedPassword
      );

      if (!match) {
        return res.render('login.ejs', {
          error: 'Invalid username or password'
        });
      }

      req.session.userId = results[0].username;
      res.redirect('/');
    }
  );
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
