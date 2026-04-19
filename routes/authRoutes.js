const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

// Middleware: student login check
const isStudent = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'student') return next();
  res.redirect('/login');
};

// Middleware: admin login check
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.redirect('/login');
};


router.get('/login', auth.loginPage);
router.post('/login', auth.loginPost);
router.get('/register', auth.registerPage);
router.post('/register', auth.registerPost);
router.get('/logout', auth.logout);

module.exports = router;