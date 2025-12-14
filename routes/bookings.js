const express = require('express');
const router = express.Router();

const redirectLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/users/login');
  }
  next();
};

router.get('/add', redirectLogin, (req, res) => {
  res.render('booking_Add', { error: null });
});

router.post('/added', redirectLogin, (req, res) => {
  const { patient_name, appointment_date, appointment_time, reason } = req.body;
  const userId = req.session.userId;

  db.query(
    `INSERT INTO bookings 
     (patient_name, appointment_date, appointment_time, reason, user_id)
     VALUES (?, ?, ?, ?, ?)`,
    [patient_name, appointment_date, appointment_time, reason, userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.render('booking_Add', {
          error: 'Error adding booking'
        });
      }
      res.redirect('/bookings/list');
    }
  );
});

router.get('/list', redirectLogin, (req, res) => {
  db.query(
    `SELECT * FROM bookings 
     WHERE user_id = ?
     ORDER BY appointment_date, appointment_time`,
    [req.session.userId],
    (err, results) => {
      res.render('bookings_list', {
        title: 'My Appointments',
        bookings: results
      });
    }
  );
});

router.post('/delete/:id', redirectLogin, (req, res) => {
  db.query(
    `DELETE FROM bookings 
     WHERE id = ? AND user_id = ?`,
    [req.params.id, req.session.userId],
    () => res.redirect('/bookings/list')
  );
});

router.get('/search', redirectLogin, (req, res) => {
  res.render('search_bookings');
});

router.get('/search-results', redirectLogin, (req, res) => {
  db.query(
    `SELECT * FROM bookings 
     WHERE appointment_date = ? AND user_id = ?`,
    [req.query.date, req.session.userId],
    (err, results) => {
      res.render('search_results', {
        date: req.query.date,
        bookings: results
      });
    }
  );
});

module.exports = router;
