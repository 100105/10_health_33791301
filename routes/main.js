const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index.ejs");
});

router.get("/about", (req, res) => {
  res.render("about.ejs");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    // ✅ stay inside app on VM
    res.redirect(res.locals.basePath + "/");
  });
});

module.exports = router;
