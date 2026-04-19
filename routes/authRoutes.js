const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.get('/login', auth.loginPage);
router.post('/login', auth.loginPost);
router.get('/register', auth.registerPage);
router.post('/register', auth.registerPost);
router.get('/logout', auth.logout);

module.exports = router;