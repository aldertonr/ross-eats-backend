const express = require('express');
const controller = require('../controllers/account');
const methods = require('../libs/method_helper');

const router = express.Router();

router.post('/login', controller.loginController);
router.post('/register', controller.registerController);

router.all('/', methods(['POST']));

module.exports = router;
