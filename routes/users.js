const express = require('express');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect(res.locals.basePath + '/users/login');
  }
  next();
};

// ---- REGISTER PAGE (only if not logged in)
router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect(res.locals.basePath + '/');
  }
  res.render('register.ejs', { errors: [], data: {} });
});

// ---- REGISTER HANDLER
router.post(
  '/register',
  [
    check('first').trim().notEmpty().withMessage('First name is required'),
    check('last').trim().notEmpty().withMessage('Last name is required'),
    check('email').trim().isEmail().withMessage('Valid email is required'),
    check('username').trim().notEmpty().withMessage('Username is required'),
    check('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[a-z]/).withMessage('Password must include a lowercase letter')
      .matches(/[A-Z]/).withMessage('Password must include an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must include a number')
      .matches(/[^A-Za-z0-9]/).withMessage('Password must include a special character')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register.ejs', {
        errors: errors.array(),
        data: req.body
      });
    }

    const cleanUsername = req.sanitize(req.body.username.trim());
    const cleanFirst = req.sanitize(req.body.first.trim());
    const cleanLast = req.sanitize(req.body.last.trim());
    const cleanEmail = req.sanitize(req.body.email.trim());

    const hash = await bcrypt.hash(req.body.password, 10);

    db.query(
      'INSERT INTO users (username, first, last, email, hashedPassword) VALUES (?, ?, ?, ?, ?)',
      [cleanUsername, cleanFirst, cleanLast, cleanEmail, hash],
      err => {
        if (err) return res.send('Username already exists');
        res.redirect(res.locals.basePath + '/users/login');
      }
    );
  }
);

// ---- LOGIN PAGE (only if not logged in)
router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect(res.locals.basePath + '/');
  }
  res.render('login.ejs', { error: null });
});

// ---- LOGIN HANDLER (+ audit log)
router.post('/login', (req, res) => {
  const username = req.sanitize(req.body.username);

  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (err, results) => {
      if (err) return res.render('login.ejs', { error: 'Database error' });

      if (results.length === 0) {
        db.query('INSERT INTO login_audit (username, success) VALUES (?, ?)', [username, false]);
        return res.render('login.ejs', { error: 'Login failed' });
      }

      const match = await bcrypt.compare(req.body.password, results[0].hashedPassword);

      if (!match) {
        db.query('INSERT INTO login_audit (username, success) VALUES (?, ?)', [username, false]);
        return res.render('login.ejs', { error: 'Login failed' });
      }

      req.session.userId = results[0].username;
      db.query('INSERT INTO login_audit (username, success) VALUES (?, ?)', [username, true]);

      // ✅ stay inside app on VM
      return res.redirect(res.locals.basePath + '/');
    }
  );
});

// ---- AUDIT PAGE (logged in only)
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