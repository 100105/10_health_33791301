const express = require('express');
const router = express.Router();

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) return res.redirect('/users/login');
  next();
};

router.get('/add', redirectLogin, (req, res) => {
  res.render('booking_add.ejs', { error: null });
});

router.post('/added', redirectLogin, (req, res) => {
  const { patient_name, appointment_date, appointment_time, reason } = req.body;

  db.query(
    `INSERT INTO bookings (patient_name, appointment_date, appointment_time, reason, user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [patient_name, appointment_date, appointment_time, reason, req.session.userId],
    err => {
      if (err) {
        return res.render('booking_add.ejs', { error: 'Error saving booking' });
      }
      res.redirect('list');
    }
  );
});

router.get('/list', redirectLogin, (req, res) => {
  db.query(
    'SELECT * FROM bookings WHERE user_id = ? ORDER BY appointment_date, appointment_time',
    [req.session.userId],
    (err, results) => {
      res.render('bookings_list.ejs', {
        title: 'My Appointments',
        bookings: results
      });
    }
  );
});

router.post('/delete/:id', redirectLogin, (req, res) => {
  db.query(
    'DELETE FROM bookings WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.userId],
    () => res.redirect('..')
  );
});

router.get('/search', redirectLogin, (req, res) => {
  res.render('search_bookings.ejs');
});

router.get('/search-results', redirectLogin, (req, res) => {
  db.query(
    'SELECT * FROM bookings WHERE appointment_date = ? AND user_id = ?',
    [req.query.date, req.session.userId],
    (err, results) => {
      res.render('search_results.ejs', {
        date: req.query.date,
        bookings: results
      });
    }
  );
});

module.exports = router;