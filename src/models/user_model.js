/* eslint-disable consistent-return */
/* eslint-disable func-names */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../../config');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    minlength: 1,
    maxlength: 50,
  },
  lastName: {
    type: String,
    minlength: 1,
    maxlength: 50,
  },
  username: {
    type: String,
    minlength: 4,
    maxlength: 15,
    unique: true,
    required: true,
  },
  passwordHashSHA256: {
    type: String,
    minlength: 1,
    required: true,
  },
  lastModified: {
    type: Date,
  },
});

userSchema.pre('save', function (next) {
  const user = this;
  // Generate a password hash when the password changes (or a new password)
  if (!user.isModified('passwordHashSHA256')) return next();
  // Generate a salt
  bcrypt.genSalt(config.salt_work_factor, (err, salt) => {
    if (err) return next(err);
    // Combining Salt to Generate New Hash
    // eslint-disable-next-line no-shadow
    bcrypt.hash(user.passwordHashSHA256, salt, (err, hash) => {
      if (err) return next(err);
      // Overwriting plaintext passwords with hash
      user.passwordHashSHA256 = hash;
      next();
    });
  });
});

module.exports = mongoose.model('User', userSchema);
