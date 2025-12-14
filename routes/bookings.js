const express = require('express');
const router = express.Router();

// ---- LOGIN GUARD
const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect(res.locals.basePath + '/users/login');
  }
  next();
};

// ---- SEARCH PAGE
router.get('/search', redirectLogin, (req, res) => {
  res.render('search_bookings.ejs');
});

// ---- SEARCH RESULTS (USER-ONLY)
router.get('/search-results', redirectLogin, (req, res) => {
  db.query(
    `SELECT * FROM bookings
     WHERE appointment_date = ?
     AND user_id = ?`,
    [req.query.date, req.session.userId],
    (err, results) => {
      if (err) return res.send('Database error');

      res.render('search_results.ejs', {
        date: req.query.date,
        bookings: results
      });
    }
  );
});

module.exports = router;
