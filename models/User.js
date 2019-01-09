const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;
const model = mongoose.model;

// Define user model
const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Encrypt password with bcrypt before saving
userSchema.pre('save', function(next) {
  const user = this;

  // Generate salt
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    // Hash password using the salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // Replace plain text password with hashed password
      user.password = hash;

      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);

    callback(null, isMatch);
  });
};

// Model class
const User = model('User', userSchema);

module.exports = User;
