const express = require('express');
const passport = require('passport');

const auth = require('../controllers/auth');
const passportConfig = require('../config/passport');

const router = express.Router();

// Email + Password provided for login
// Middleware authenticates user before they can access the route
const requireLogin = passport.authenticate('local', { session: false });

// Register new user
router.post('/register', auth.register);

// Login user
router.post('/login', requireLogin, auth.login);

module.exports = router;
