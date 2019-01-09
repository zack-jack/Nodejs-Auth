const jwt = require('jsonwebtoken');

const User = require('../models/User');
const key = require('../config/keys');

// Setup token
const tokenForUser = user => {
  const timestamp = new Date().getTime();
  const payload = { sub: user.id, iat: timestamp };

  return jwt.sign(payload, key.tokenSecret, { expiresIn: 72000 });
};

// Register route handling
exports.register = (req, res, next) => {
  let errors = [];
  let validData = undefined;
  const { email, password, passwordConfirm } = req.body;

  // Validate request data
  // Check required fields completed
  if (!email || !password || !passwordConfirm) {
    errors.push({ msg: 'Please fill in all required fields' });
  }

  // Check if email is valid
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!re.test(email)) {
    errors.push({ msg: 'Please provide a valid email address' });
  }

  // Check password matches passwordConfirm
  if (password && password !== passwordConfirm) {
    errors.push({ msg: 'Passwords do not match' });
  }

  // Check password length is greater than 8 chars
  if (password && password.length < 8) {
    errors.push({ msg: 'Password should be at least 8 characters' });
  }

  if (errors.length > 0) {
    validData = false;
    res.status(422).json({
      errors
    });
  }

  // Check if user email already exists
  if (validData !== false) {
    User.findOne({ email: email })
      .then(existingUser => {
        // Email already exists
        // Return error
        if (existingUser) {
          errors.push({ msg: 'Email is already registered' });
          console.log(errors);
          res.status(422).json({
            errors,
            existingUser
          });
        }

        // User email does not already exist
        // Create new user instance
        const newUser = new User({
          email,
          password
        });

        // Save new user record to DB
        newUser
          .save()
          .then(user => {
            // Respond that the user was created
            res.json({ token: tokenForUser(user) });
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
};

// Login route handling
exports.login = (req, res, next) => {
  // User already authenticated by requireLogin middleware
  // Give user an auth token
  res.send({ token: tokenForUser(req.user) });
};
