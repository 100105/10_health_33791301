const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/about", (req, res) => {
  res.render("about.ejs");
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect("./");
    }
    res.redirect("./");
  });
});

module.exports = router;