const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User');
const key = require('./keys');

// Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
  // Check DB for user that matches provided email
  User.findOne({ email: email }, (err, user) => {
    if (err) return done(err);

    // If no user found, return false
    if (!user) return done(null, false);

    // Compare password provided with matched user's password
    user.comparePassword(password, (err, isMatch) => {
      if (err) return done(err);

      // Password does not match, return false
      if (!isMatch) return done(null, false);

      // Password matches, return user
      return done(null, user);
    });
  });
});

// Set up options for JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: key.tokenSecret
};

// Create JWT strategy for login
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // Check if the payload user id exists in DB
  User.findById(payload.sub, (err, user) => {
    if (err) return done(err, false);

    // If user exists, call done with user obj
    // Otherwise, call done without user obj
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use strategies
passport.use(jwtLogin);
passport.use(localLogin);
