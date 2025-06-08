const express = require('express');
const router = express.Router();
const turfOwnerController = require('../controller/turfOwner.controller');

router.post('/register', turfOwnerController.registerTurfOwner);
router.post('/login', turfOwnerController.loginTurfOwner);

module.exports = router;