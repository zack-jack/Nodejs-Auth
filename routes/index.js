const express = require('express');
const passport = require('passport');

const router = express.Router();

// Token authentication strategy
const requireAuth = passport.authenticate('jwt', { session: false });

// Welcome
router.get('/', (req, res) => {
  res.send('Welcome to the home page!');
});

// Dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.send('GET request to dashboard route');
});

module.exports = router;
