/* eslint-disable no-underscore-dangle */
const BCRYPT = require('bcryptjs');
const USER_MODEL = require('../models/user_model');
const JWT_HANDLER = require('../libs/jwt_handler');

const loginController = async (req, res) => {
  try {
    const user = await USER_MODEL.findOne({ username: req.body.username });
    if (user) {
      const matches = BCRYPT.compareSync(req.body.password, user.passwordHashSHA256);
      if (matches) {
        const token = await JWT_HANDLER.signToken(user._id, user.username);
        res.status(200).json(token);
      } else {
        console.warn('Invalid username or password');
        res.status(400).json('Invalid username or password');
      }
    } else {
      console.log('User not found');
      res.status(400).json('User not found');
    }
  } catch (error) {
    if (error.name === 'TokenError') {
      res.status(500).json('Token signing error');
    } else {
      res.status(500).json(`An error occurred whilst logging in: ${error.message}`);
    }
  }
};

const registerController = async (req, res) => {
  try {
    const user = await USER_MODEL.findOne({ username: req.body.username });
    if (!user) {
      const {
        firstName, lastName, username, password,
      } = req.body;
      if (!firstName) throw Error('invalid firstName');
      if (!lastName) throw Error('invalid lastName');
      if (!username) throw Error('invalid username');
      if (!password) throw Error('invalid password');
      console.log(`Registering: ${firstName} ${lastName} with username ${username}`);
      const userToInsert = new USER_MODEL({
        firstName,
        lastName,
        username,
        passwordHashSHA256: password,
      });
      await userToInsert.save();
      console.log(userToInsert);
    } else {
      res.status(400).json('User already exists');
    }
  } catch (error) {
    if (error.name === 'TokenError') {
      res.status(500).json('Token signing error');
    } else {
      res.status(500).json(`An error occurred whilst logging in: ${error.message}`);
    }
  }
};

module.exports = {
  loginController,
  registerController,
};
