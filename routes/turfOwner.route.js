const express = require('express');
const router = express.Router();
const turfOwnerController = require('../controller/turfOwner.controller');
const authMiddleware = require('../Middleware/authMiddleware'); // सही path

router.post('/register', turfOwnerController.registerTurfOwner);
router.post('/login', turfOwnerController.loginTurfOwner);
//forgot passwoard functionality for turf owner app
router.post('/forgot-password', turfOwnerController.forgotPassword);
router.post('/reset-password', turfOwnerController.resetPassword);
router.get('/me', authMiddleware, turfOwnerController.getProfile);
router.put('/me', authMiddleware, turfOwnerController.updateProfile);

module.exports = router;

